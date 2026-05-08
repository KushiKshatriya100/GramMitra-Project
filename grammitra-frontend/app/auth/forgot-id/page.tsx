"use client";

import { useState } from "react";
import api from "@/lib/api";
import { forgotLoginId, sendOtp } from "@/features/gram-mitra/services/authService";
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";

export default function ForgotLoginIdPage() {
  const { t, lang } = useTranslation();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!lang) return null;

  const handleSendOtp = async () => {
    if (!phone) return toast.error(t("auth.phoneRequired"));

    try {
      setLoading(true);
      await sendOtp(phone);
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || t("auth.failedOtp"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      await api.post("/auth/verify-otp-forgot", { phone, otp });

      const res: any = await forgotLoginId(phone);
      setLoginId(res.loginId);
      setStep(3);
    } catch (err: any) {
      toast.error(err?.message || t("auth.failedOtp"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="bg-[var(--card)] p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 border border-[var(--border)]">

        <h1 className="text-xl font-bold text-center">
          {t("auth.forgotId")}
        </h1>

        {step === 1 && (
          <>
            <input
              placeholder={t("auth.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-primary"
            />

            <button onClick={handleSendOtp} className="btn-primary w-full">
              {loading ? t("auth.sending") : t("auth.sendOtp")}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              placeholder={t("auth.enterOtp")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-primary"
            />

            <button onClick={handleVerifyOtp} className="btn-primary w-full">
              {loading ? t("auth.verifying") : t("auth.verify")}
            </button>
          </>
        )}

        {step === 3 && (
          <div className="text-center">
            <p>{t("auth.yourId")}</p>
            <h2 className="text-[var(--primary)] font-bold text-lg">
              {loginId}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}