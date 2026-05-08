"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp } from "@/features/gram-mitra/services/authService";
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  if (!lang) return null;

  const handleRegister = async () => {
    if (!phone || !name) {
      toast.error(t("auth.fillAll"));
      return;
    }

    try {
      setLoading(true);

      const res: any = await sendOtp(phone);

      if (res.userExists) {
        toast.error(t("auth.alreadyRegistered"));
        return;
      }

      router.push(
        `/auth/verify-otp?mode=register&phone=${phone}&name=${name}&role=${role}`
      );
    } catch (err: any) {
      toast.error(err?.message || t("auth.registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="bg-[var(--card)] p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 border border-[var(--border)]">

        <h1 className="text-2xl font-bold text-center">
          {t("auth.register")}
        </h1>

        {/* NAME */}
        <div className="space-y-1">
          <label className="text-sm text-[var(--text-soft)]">
            {t("auth.name")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.namePlaceholder")}
            className="input-primary"
          />
        </div>

        {/* PHONE */}
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

        {/* ROLE */}
        <div className="space-y-1">
          <label className="text-sm text-[var(--text-soft)]">
            {t("auth.role")}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-primary"
          >
            <option value="USER">{t("auth.user")}</option>
            <option value="WORKER">{t("auth.worker")}</option>
          </select>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? t("auth.sending") : t("auth.sendOtp")}
        </button>
      </div>
    </div>
  );
}