"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp } from "@/features/gram-mitra/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loginId, setLoginId] = useState("");

  const handleLogin = async () => {
    if (!phone || !loginId) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res: any = await sendOtp(phone);

      if (!res.userExists) {
        alert("User not found. Please register.");
        return;
      }

      localStorage.setItem("loginId", loginId);

      router.push(`/auth/verify-otp?mode=login&phone=${phone}`);
    } catch (err: any) {
      alert(err?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6EC]">
      <h1 className="text-xl font-bold mb-4">Login</h1>

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-3 rounded mb-3 w-72"
      />

      <input
        placeholder="Login ID"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
        className="border p-3 rounded mb-2 w-72"
      />

      {/* 🔥 NEW BUTTON */}
      <p
        onClick={() => router.push("/auth/forgot-id")}
        className="text-sm text-blue-600 cursor-pointer mb-4"
      >
        Forgot Login ID?
      </p>

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Send OTP
      </button>
    </div>
  );
}