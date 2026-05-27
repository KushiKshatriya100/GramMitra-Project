import api from "@/lib/api";
import { saveSession, clearSession } from "@/lib/auth";

// ✅ SEND OTP (UPDATED)
export const sendOtp = async (
  phone: string,
  loginId?: string,
  mode?: string
) => {
  try {
    const res = await api.post("/auth/send-otp", null, {
      params: { phone, loginId, mode },
    });
    return res.data;
  } catch (error: any) {
    console.error("SEND OTP ERROR:", error?.response?.data || error.message);
    throw error;
  }
};

// ✅ VERIFY OTP (LOGIN + REGISTER)
export const verifyOtp = async (data: {
  phone: string;
  otp: string;
  name?: string;
  role?: string;
  loginId?: string;
}) => {
  try {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ""
      )
    );

    const res = await api.post("/auth/verify-otp", cleanData);

    // The JWT is now an httpOnly cookie set by the backend on this same
    // response — JS never sees it. What we DO persist locally are two
    // non-secret blobs:
    //
    //   localStorage.gm_session  → { loginId, role, exp }
    //       Drives isAuthenticated() and proactive session-expiry checks.
    //
    //   localStorage.user        → the full User object (name, phone, etc.)
    //       Drives UI display (Navbar avatar, profile dropdown, welcome
    //       text). Contents are non-sensitive — it's the user's own
    //       profile data they already see on screen — but importantly it
    //       does NOT contain any auth proof. Removing it from storage
    //       only loses display info, not security.
    const user = res.data?.user;
    if (user?.loginId) {
      saveSession({
        loginId: user.loginId,
        role: user.role,
        exp: typeof res.data?.exp === "number" ? res.data.exp : undefined,
      });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          // localStorage full / private browsing — non-fatal. The session
          // blob is enough for auth checks; UI will just look anonymous
          // until the next page refresh (which re-fetches /auth/me).
          console.warn("Could not cache user profile in localStorage:", e);
        }
      }
    }

    return res.data;
  } catch (error: any) {
    console.error("VERIFY OTP ERROR:", error?.response?.data || error.message);
    throw error;
  }
};

// ✅ LOGOUT — clears the server's httpOnly cookie + drops the local
// session blob. Use this anywhere the user signs out manually.
export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    // Don't block local cleanup if the server call fails — the worst case
    // is a stale cookie that the next 401 will invalidate anyway.
    console.warn("Logout call failed (continuing with local cleanup):", e);
  }
  clearSession();
};

// ✅ FORGOT LOGIN ID
export const forgotLoginId = async (phone: string) => {
  try {
    const res = await api.post("/auth/forgot-id", null, {
      params: { phone },
    });
    return res.data;
  } catch (error: any) {
    console.error("FORGOT ID ERROR:", error?.response?.data || error.message);
    throw error;
  }
};

// ===============================
// 🔥 NEW: GET NEARBY WORKERS (PHASE 3)
// ===============================

export const getNearbyWorkers = async (
  lat: number,
  lng: number,
  skill?: string
) => {
  try {
    const res = await api.get("/worker/nearby", {
      params: {
        lat,
        lng,
        skill,
      },
    });

    return res.data;
  } catch (error: any) {
    console.error(
      "GET NEARBY WORKERS ERROR:",
      error?.response?.data || error.message
    );
    throw error;
  }
};