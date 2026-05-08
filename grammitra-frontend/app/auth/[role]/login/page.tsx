"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp } from "@/features/gram-mitra/services/authService";
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [phone, setPhone] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!lang) return null;

  const handleLogin = async () => {
    if (!phone || !loginId) {
      toast.error(t("auth.fillAll"));
      return;
    }

    try {
      setLoading(true);

      const res: any = await sendOtp(phone, loginId, "login");

      if (!res.userExists) {
        toast.error(t("auth.userNotFound"));
        return;
      }

      // ✅ FIXED
      router.push(
        `/auth/verify-otp?mode=login&phone=${phone}&loginId=${loginId}`
      );

    } catch (err: any) {
      toast.error(err?.message || t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="bg-[var(--card)] p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 border border-[var(--border)]">

        <h1 className="text-2xl font-bold text-center text-[var(--text)]">
          {t("auth.login")}
        </h1>

        <div className="space-y-1">
          <label className="text-sm text-[var(--text-soft)]">
            {t("auth.phone")}
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("auth.phonePlaceholder")}
            className="input-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-[var(--text-soft)]">
            {t("auth.loginId")}
          </label>
          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder={t("auth.loginIdPlaceholder")}
            className="input-primary"
          />
        </div>

        <p
          onClick={() => router.push("/auth/forgot-id")}
          className="text-sm text-blue-600 cursor-pointer text-right hover:underline"
        >
          {t("auth.forgotId")}
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? t("auth.sending") : t("auth.sendOtp")}
        </button>
      </div>
    </div>
  );
}