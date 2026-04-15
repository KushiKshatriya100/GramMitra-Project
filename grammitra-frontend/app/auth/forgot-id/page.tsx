"use client";

import { useState } from "react";
import api from "@/lib/api"; // ✅ ADD THIS
import {
  forgotLoginId,
  sendOtp,
  verifyOtp,
} from "@/features/gram-mitra/services/authService";

export default function ForgotLoginIdPage() {
  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loginId, setLoginId] = useState("");

  const [loading, setLoading] = useState(false);

  // 📩 STEP 1: SEND OTP
  const handleSendOtp = async () => {
    if (!phone.trim()) {
      alert("Enter phone number");
      return;
    }

    try {
      setLoading(true);

      await sendOtp(phone.trim());

      setStep(2);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 STEP 2: VERIFY OTP + GET LOGIN ID
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      alert("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      // ✅ NEW API
      await api.post("/auth/verify-otp-forgot", {
        phone: phone.trim(),
        otp: otp.trim(),
      });

      // ✅ THEN GET LOGIN ID
      const res: any = await forgotLoginId(phone.trim());

      setLoginId(res.loginId);
      setStep(3);

    } catch (err: any) {
      alert(err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6EC]">
      <h1 className="text-xl font-bold mb-4">Forgot Login ID</h1>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <input
            placeholder="Enter Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-3 rounded mb-4 w-72"
          />

          <button
            onClick={handleSendOtp}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-3 rounded mb-4 w-72"
          />

          <button
            onClick={handleVerifyOtp}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="text-center bg-white p-6 rounded shadow">
          <p className="mb-2 text-gray-600">Your Login ID is:</p>
          <h2 className="text-xl font-bold text-green-600">
            {loginId}
          </h2>
        </div>
      )}
    </div>
  );
}