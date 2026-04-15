"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { verifyOtp } from "@/features/gram-mitra/services/authService";
import { saveToken } from "@/lib/auth";

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const mode = params.get("mode"); // register / login
  const name = params.get("name");
  const role = params.get("role");

  // ✅ always fetch fresh loginId
  const getLoginId = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("loginId");
  };

  useEffect(() => {
    const urlPhone = params.get("phone");

    if (!urlPhone) {
      router.replace("/");
      return;
    }

    setPhone(urlPhone);
  }, [params, router]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      alert("Enter OTP");
      return;
    }

    if (!phone) {
      alert("Phone missing. Please retry.");
      return;
    }

    try {
      setLoading(true);

      let res: any;

      // 🟢 REGISTER FLOW
      if (mode === "register") {
        if (!name || !role) {
          alert("Invalid registration data");
          return;
        }

        res = await verifyOtp({
          phone,
          otp: otp.trim(),
          name,
          role,
        });

        const loginId = res?.user?.loginId;

        // ✅ store user
        localStorage.setItem("user", JSON.stringify(res.user));

        alert(`✅ Registered Successfully!\nYour Login ID: ${loginId}`);

        router.replace("/auth/user/login");
        return;
      }

      // 🔐 LOGIN FLOW
      if (mode === "login") {
        const loginId = getLoginId();

        if (!loginId) {
          alert("Login ID missing. Please login again.");
          router.replace("/auth/user/login");
          return;
        }

        res = await verifyOtp({
          phone,
          otp: otp.trim(),
          loginId: loginId.trim(), // 🔥 FIXED
        });

        if (!res?.token || !res?.user) {
          throw new Error("Invalid response from server");
        }

        // ✅ save token + user
        saveToken(res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        // ✅ remove loginId after success
        localStorage.removeItem("loginId");

        // ✅ redirect
        if (res.user.role === "WORKER") {
          router.replace("/dashboard/worker");
        } else {
          router.replace("/dashboard/user");
        }

        return;
      }

      alert("Invalid mode. Please retry.");
    } catch (err: any) {
      console.error("OTP VERIFY ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "OTP verification failed";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6EC]">
      <h1 className="text-xl font-bold mb-4">Verify OTP</h1>

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-3 rounded mb-4 w-72"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}