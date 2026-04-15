"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp } from "@/features/gram-mitra/services/authService";

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");

  const handleRegister = async () => {
    if (!phone || !name || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res: any = await sendOtp(phone);

      // ⚠️ ALREADY REGISTERED
      if (res.userExists) {
        alert("⚠️ Already registered. Please login.");
        return;
      }

      // ✅ GO TO OTP PAGE
      router.push(
        `/auth/verify-otp?mode=register&phone=${phone}&name=${name}&role=${role}`
      );

    } catch (err: any) {
      alert(err?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6EC]">
      <h1 className="text-xl font-bold mb-4">Register</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-3 rounded mb-3 w-72"
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-3 rounded mb-3 w-72"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-3 rounded mb-4 w-72"
      >
        <option value="USER">User</option>
        <option value="WORKER">Worker</option>
      </select>

      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Send OTP
      </button>
    </div>
  );
}