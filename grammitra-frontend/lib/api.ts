import axios from "axios";
import { getLanguage } from "@/shared/i18n/languageStore";
import { getToken, removeToken } from "@/lib/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 10000,
});

// 🔹 REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getToken();

    // ✅ Attach JWT token
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Attach language (safe fallback)
    config.headers = config.headers || {};
    config.headers["Accept-Language"] = getLanguage() || "en";
  }

  return config;
});

// 🔹 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const originalRequest = err.config;

    // 🌐 NETWORK ERROR HANDLING (SAFE RETRY ONCE)
    if (!err.response) {
      console.error("🌐 NETWORK ERROR:", err.message);

      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          return await api.request(originalRequest);
        } catch {
          return Promise.reject(
            new Error("Network error. Please try again.")
          );
        }
      }

      return Promise.reject(
        new Error("Network error. Please try again.")
      );
    }

    // 🔴 LOG API ERROR
    console.error("API ERROR:", err.response?.data || err.message);

    // 🔐 AUTH FAILURE HANDLING
    if (status === 401 && typeof window !== "undefined") {
      removeToken();
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth/user/login";
      }
    }

    // 💰 PAYMENT ERROR HANDLING (NEW)
    if (status === 400 && err.response?.data?.type === "PAYMENT_ERROR") {
      return Promise.reject(
        new Error(err.response?.data?.error || "Payment failed")
      );
    }

    return Promise.reject(err);
  }
);

export default api;