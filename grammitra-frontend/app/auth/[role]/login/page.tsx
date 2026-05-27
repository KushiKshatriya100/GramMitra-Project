"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sendOtp } from "@/features/gram-mitra/services/authService";
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const role = (params?.role as string) || "user";
  const { t, lang } = useTranslation();

  const [phone, setPhone] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!lang) return null;

  // Match the backend's "User not found" message however it gets surfaced —
  // axios may wrap it, or it may come through as the raw business error.
  const isUserNotFoundError = (err: any): boolean => {
    const candidates = [
      err?.message,
      err?.response?.data?.error,
      err?.response?.data?.message,
      err?.original?.response?.data?.error,
    ];
    return candidates.some(
      (m) => typeof m === "string" && /user not found/i.test(m)
    );
  };

  const handleLogin = async () => {
    // Normalize before sending so a trailing space from autofill or a
    // lowercase loginId from a password manager can't trigger a backend
    // rejection. The backend now compares case-insensitively too, but
    // fixing this on both sides means the bug stays dead.
    const cleanPhone = phone.trim();
    const cleanLoginId = loginId.trim().toUpperCase();

    if (!cleanPhone || !cleanLoginId) {
      toast.error(t("auth.fillAll"));
      return;
    }

    try {
      setLoading(true);

      const res: any = await sendOtp(cleanPhone, cleanLoginId, "login");

      if (!res.userExists) {
        toast.error(t("auth.userNotFound"));
        return;
      }

      router.push(
        `/auth/verify-otp?mode=login&phone=${cleanPhone}&loginId=${cleanLoginId}`
      );

    } catch (err: any) {
      // Most common 4xx here is "User not found" — show a friendly toast
      // with a clickable Sign Up CTA instead of a dead-end raw error.
      if (isUserNotFoundError(err)) {
        toast(
          (toastInstance) => (
            <div className="flex flex-col gap-2">
              <span>{t("auth.userNotFound")}</span>
              <button
                onClick={() => {
                  toast.dismiss(toastInstance.id);
                  router.push(`/auth/${role}/register`);
                }}
                className="text-left text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                {t("auth.signUpInstead")} →
              </button>
            </div>
          ),
          { icon: "👤", duration: 6000 }
        );
        return;
      }

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
          className="text-sm text-[var(--primary)] cursor-pointer text-right hover:underline"
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