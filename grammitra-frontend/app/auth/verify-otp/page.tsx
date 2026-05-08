"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { verifyOtp } from "@/features/gram-mitra/services/authService";
import { saveToken } from "@/lib/auth";
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
const { t, lang } = useTranslation();
const params = useSearchParams();
const router = useRouter();

const [phone, setPhone] = useState("");
const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);

const mode = params.get("mode");
const loginId = params.get("loginId");

useEffect(() => {
const p = params.get("phone");


if (!p) {
  router.replace("/");
  return;
}

setPhone(p);

}, [params, router]);

const handleVerify = async () => {
if (!otp.trim()) {
toast.error(t("auth.enterOtp"));
return;
}


if (!phone) {
  toast.error(t("auth.invalidSession"));
  router.replace("/");
  return;
}

try {
  setLoading(true);

  const res: any = await verifyOtp({
    phone,
    otp,
    loginId: loginId || undefined,
    name: params.get("name") || undefined,
    role: params.get("role") || undefined,
  });

  if (!res?.token || !res?.user) {
    throw new Error("Invalid response from server");
  }

  saveToken(res.token);
  localStorage.setItem("user", JSON.stringify(res.user));

  router.replace(
    res.user.role === "WORKER"
      ? "/dashboard/worker"
      : "/dashboard/user"
  );

} catch (err: any) {
  console.error("OTP VERIFY ERROR:", err);
  toast.error(err?.message || t("auth.failedOtp"));
} finally {
  setLoading(false);
}


};

if (!lang) return null;

return ( <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4"> <div className="bg-[var(--card)] p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 border border-[var(--border)]">


    <h1 className="text-2xl font-bold text-center text-[var(--text)]">
      {t("auth.verifyOtp")}
    </h1>

    <p className="text-sm text-center text-[var(--text-soft)]">
      {t("auth.otpSentTo")} {phone}
    </p>

    <div className="space-y-1">
      <label className="text-sm text-[var(--text-soft)]">
        {t("auth.enterOtp")}
      </label>

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder={t("auth.enterOtpPlaceholder")}
        className="input-primary text-center tracking-widest text-lg"
        maxLength={6}
      />
    </div>

    <button
      onClick={handleVerify}
      disabled={loading}
      className="btn-primary w-full disabled:opacity-50"
    >
      {loading ? t("auth.verifying") : t("auth.verify")}
    </button>

  </div>
</div>

);
}
