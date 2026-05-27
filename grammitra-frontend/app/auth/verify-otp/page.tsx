"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { verifyOtp } from "@/features/gram-mitra/services/authService";
// Note: this page no longer touches the JWT directly. The auth cookie is
// set by the server on /auth/verify-otp; the session blob is persisted
// inside authService.verifyOtp via saveSession().
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";

function VerifyOtpContent() {

  const { t, lang } = useTranslation();

  const params = useSearchParams();

  const router = useRouter();

  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ NEW
  const [generatedLoginId, setGeneratedLoginId] =
    useState("");

  const [showSuccessCard, setShowSuccessCard] =
    useState(false);

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

  // ✅ COPY LOGIN ID
  const copyLoginId = async () => {

    try {

      await navigator.clipboard.writeText(
        generatedLoginId
      );

      toast.success(t("auth.copied"));

    } catch {

      toast.error(t("auth.copyFailed"));
    }
  };

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

      // The JWT now arrives as an httpOnly cookie set by the server's
      // Set-Cookie header. We only ever see the user blob in the body —
      // the lack of `res.user` is the only real failure signal here.
      if (!res?.user) {
        throw new Error(t("auth.invalidResponse"));
      }

      // authService.verifyOtp already persisted the session blob
      // (loginId + role + exp) to localStorage via saveSession(). No
      // direct localStorage writes needed in this component.

      // ✅ SHOW LOGIN ID AFTER REGISTRATION
      if (
        res?.type === "REGISTER" &&
        res?.user?.loginId
      ) {

        setGeneratedLoginId(
          res.user.loginId
        );

        setShowSuccessCard(true);

        return;
      }

      // ✅ NORMAL LOGIN FLOW
      router.replace(
        res.user.role === "WORKER"
          ? "/dashboard/worker"
          : "/dashboard/user"
      );

    } catch (err: any) {

      console.error(
        "OTP VERIFY ERROR:",
        err
      );

      toast.error(
        err?.message ||
        t("auth.failedOtp")
      );

    } finally {

      setLoading(false);
    }
  };

  // ✅ AFTER REGISTRATION SUCCESS
  const continueToDashboard = () => {

    router.replace(
      params.get("role") === "WORKER"
        ? "/dashboard/worker"
        : "/dashboard/user"
    );
  };

  if (!lang) return null;

  return (

    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">

      <div className="bg-[var(--card)] p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 border border-[var(--border)]">

        {/* ✅ SUCCESS CARD */}
        {showSuccessCard ? (

          <div className="space-y-5 text-center">

            <div className="text-5xl">
              🎉
            </div>

            <h1 className="text-2xl font-bold text-[var(--text)]">
              {t("auth.registrationSuccess")}
            </h1>

            <p className="text-sm text-[var(--text-soft)]">
              {t("auth.saveLIdWarning")}
            </p>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 space-y-3">

              <p className="text-sm text-[var(--text-soft)]">
                {t("auth.yourLoginIdLabel")}
              </p>

              <div className="text-2xl font-bold tracking-widest text-[var(--primary)]">
                {generatedLoginId}
              </div>

              <button
                onClick={copyLoginId}
                className="btn-primary w-full"
              >
                {t("auth.copyId")}
              </button>
            </div>

            <button
              onClick={continueToDashboard}
              className="btn-primary w-full"
            >
              {t("auth.continue")}
            </button>
          </div>

        ) : (

          <>
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
                onChange={(e) =>
                  setOtp(e.target.value)
                }
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
              {loading
                ? t("auth.verifying")
                : t("auth.verify")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  );
}
