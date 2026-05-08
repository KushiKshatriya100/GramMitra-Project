import api from "@/lib/api";
import { saveToken } from "@/lib/auth";

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

    // ✅ SAVE TOKEN (centralized)
    if (res.data?.token) {
      saveToken(res.data.token);
    }

    return res.data;
  } catch (error: any) {
    console.error("VERIFY OTP ERROR:", error?.response?.data || error.message);
    throw error;
  }
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