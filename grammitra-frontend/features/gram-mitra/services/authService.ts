import api from "@/lib/api";

// ✅ SEND OTP
export const sendOtp = async (phone: string) => {
  const res = await api.post("/auth/send-otp", null, {
    params: { phone },
  });
  return res.data;
};

// ✅ VERIFY OTP (FIXED)
export const verifyOtp = async (data: {
  phone: string;
  otp: string;
  name?: string;
  role?: string;
  loginId?: string;
}) => {
  console.log("📤 VERIFY OTP PAYLOAD:", data);

  // 🔥 remove undefined/null fields
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
  );

  const res = await api.post("/auth/verify-otp", cleanData);
  return res.data;
};

// ✅ FORGOT LOGIN ID
export const forgotLoginId = async (phone: string) => {
  const res = await api.post("/auth/forgot-id", null, {
    params: { phone },
  });
  return res.data;
};