// lib/auth.ts
//
// The actual JWT is held in an httpOnly cookie set by the backend on
// /auth/verify-otp. JS in this app can't read it — and that's deliberate:
// it removes the XSS exfiltration path. The cookie travels automatically
// with every request because the axios client has `withCredentials: true`.
//
// What lives in localStorage is a SESSION BLOB — a small JSON record with:
//   - loginId  (so we can show "your bookings", build dashboard paths)
//   - role     ("USER" | "WORKER", drives nav / dashboard routing)
//   - exp      (unix seconds; lets the UI proactively bounce to /login
//               when the cookie is about to expire instead of waiting
//               for the next 401)
//
// This blob is NOT a credential. Anyone who reads it can learn the user's
// loginId and role — but that is no more sensitive than what the user
// already sees on screen. It cannot be used to authenticate.

const isBrowser = typeof window !== "undefined";

const SESSION_KEY = "gm_session";

export interface SessionBlob {
  loginId: string;
  role?: string;
  /** Unix seconds (matches JWT `exp`). */
  exp?: number;
}

/** Save the session blob after a successful login/register. */
export const saveSession = (session: SessionBlob): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("❌ Error saving session:", error);
  }
};

/** Read the session blob (or null if none). */
export const getSession = (): SessionBlob | null => {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.loginId === "string") {
      return parsed as SessionBlob;
    }
    return null;
  } catch (error) {
    console.error("❌ Error reading session:", error);
    return null;
  }
};

/** Drop the local session blob (call after /auth/logout). */
export const clearSession = (): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(SESSION_KEY);
    // Backwards-compat cleanup for older builds that stored the JWT here.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("❌ Error clearing session:", error);
  }
};

/** Loose check: did the user log in at some point, and is the blob's exp still in the future? */
export const isAuthenticated = (): boolean => {
  const s = getSession();
  if (!s) return false;
  if (typeof s.exp !== "number") return true; // blob present but no exp — trust it
  const nowSec = Math.floor(Date.now() / 1000);
  return s.exp > nowSec + 30; // 30s skew tolerance
};

/** Convenience for code that just needs the loginId. */
export const getUserIdFromToken = (): string | null => {
  return getSession()?.loginId ?? null;
};

/** Convenience for code that branches on role. */
export const getUserRoleFromToken = (): string | null => {
  return getSession()?.role ?? null;
};

/**
 * Decodes a JWT payload purely for picking out `exp` so the UI can
 * proactively log the user out before the cookie expires. The token
 * argument should be discarded immediately after — we do NOT persist it.
 */
export const parseJwtExp = (token: string): number | undefined => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return undefined;
    const payload = JSON.parse(atob(payloadBase64));
    return typeof payload.exp === "number" ? payload.exp : undefined;
  } catch {
    return undefined;
  }
};
