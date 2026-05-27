import axios, { AxiosError } from "axios";
import { getLanguage } from "@/shared/i18n/languageStore";
import { clearSession } from "@/lib/auth";

/**
 * Single source of truth for the Spring Boot backend origin.
 *
 * Every caller — the axios instance below, the CSP `connect-src` entry in
 * `next.config.js`, raw `fetch()` calls in route handlers, and any debug
 * tooling — MUST read this value rather than hard-coding `localhost:8080`
 * so that a deploy environment can override it with a single env var
 * (`NEXT_PUBLIC_API_URL`). Trailing slashes are stripped so callers can
 * safely template `${API_URL}/auth/me` without worrying about `//`.
 *
 * NOTE: `next.config.js` is CommonJS and cannot import this TS module, so
 * it reads the same `process.env.NEXT_PUBLIC_API_URL` with the identical
 * default — keep both fallbacks in sync if you ever change the dev port.
 */
export const API_URL: string = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code: "FORBIDDEN" | "UNAUTHORIZED" | "NETWORK" | "TIMEOUT" | "SERVER" | "OTHER";
  readonly original?: AxiosError;

  constructor(
    message: string,
    status: number,
    code: ApiError["code"],
    original?: AxiosError
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.original = original;
  }
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  // The JWT now lives in an httpOnly cookie set by /auth/verify-otp. The
  // browser sends it automatically on every same-site / cross-origin
  // request as long as withCredentials is true and the server replies with
  // Access-Control-Allow-Credentials: true (already configured in
  // SecurityConfig.corsConfigurationSource).
  withCredentials: true,
});

// 🔹 REQUEST INTERCEPTOR — language only. No Authorization header: the
// cookie handles authentication, and not exposing the token to JS is the
// whole point of the C-5 fix.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.headers = config.headers || {};
    config.headers["Accept-Language"] = getLanguage() || "en";
  }
  return config;
});

// 🔹 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    // Cancelled / aborted requests — let them propagate untouched so the
    // caller can ignore them. Do NOT retry, do NOT log noisily, do NOT
    // wrap as a user-visible error.
    if (axios.isCancel(err) || err.code === "ERR_CANCELED") {
      return Promise.reject(err);
    }

    const status = err?.response?.status ?? 0;
    const originalRequest: any = err.config;

    // ⏱️ TIMEOUT
    if (err.code === "ECONNABORTED") {
      return Promise.reject(
        new ApiError("Request timed out. Please try again.", 0, "TIMEOUT", err)
      );
    }

    // 🌐 NETWORK ERROR — retry ONCE for transient drops only
    if (!err.response) {
      console.error("🌐 NETWORK ERROR:", err.message);

      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          return await api.request(originalRequest);
        } catch (retryErr) {
          return Promise.reject(
            new ApiError(
              "Network error. Please try again.",
              0,
              "NETWORK",
              retryErr as AxiosError
            )
          );
        }
      }

      return Promise.reject(
        new ApiError("Network error. Please try again.", 0, "NETWORK", err)
      );
    }

    // 🔴 LOG (once, at the error boundary — never auto-retry 4xx/5xx)
    console.error(
      `API ERROR ${status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}:`,
      err.response?.data || err.message
    );

    // 🔐 401 → drop the local session blob (the cookie is the source of
    // truth on the server side; if the server says 401 we just bounce the
    // user to login). We do NOT call /auth/logout here — the cookie is
    // already invalid by definition, and calling logout from an
    // interceptor risks loops.
    if (status === 401 && typeof window !== "undefined") {
      clearSession();
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth/user/login";
      }
      return Promise.reject(
        new ApiError("Session expired. Please log in again.", 401, "UNAUTHORIZED", err)
      );
    }

    // 🚫 403 — distinct from 401: the server saw the request but refused it.
    // For PUBLIC endpoints (/worker/nearby, /worker/search, etc.) a 403
    // usually means a backend CORS / security misconfig, NOT user error —
    // surface it as a wrapped error so callers can show a clean toast and
    // optionally fall back to another endpoint.
    if (status === 403) {
      return Promise.reject(
        new ApiError(
          "Access to this resource is currently restricted.",
          403,
          "FORBIDDEN",
          err
        )
      );
    }

    // 💰 PAYMENT
    if (status === 400 && (err.response?.data as any)?.type === "PAYMENT_ERROR") {
      return Promise.reject(
        new Error((err.response?.data as any)?.error || "Payment failed")
      );
    }

    // 5xx
    if (status >= 500) {
      return Promise.reject(
        new ApiError("Server is temporarily unavailable.", status, "SERVER", err)
      );
    }

    return Promise.reject(err);
  }
);

export default api;