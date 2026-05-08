"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Worker } from "@/features/gram-mitra/types/Worker";
import { getMyProfile } from "@/features/gram-mitra/services/workerService";
import api from "@/lib/api";
import { useTranslation } from "@/shared/i18n/useTranslation";
import toast from "react-hot-toast";
import { mapSkillKey } from "@/features/gram-mitra/utils/translationMapper";

export default function ProfilePage() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [user, setUser] = useState<any>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("/auth/me");
        const userData = res.data;

        setUser(userData);

        if (userData.role === "WORKER") {
          try {
            const workerData = await getMyProfile();
            setWorker(workerData);
          } catch {
            setWorker(null);
          }
        }
      } catch (err) {
        toast.error(t("profile.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ prevent hydration mismatch
  if (!lang) return null;

  if (loading)
    return (
      <div className="pt-24 text-center text-gray-500">
        {t("common.loading")}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10 space-y-6">

        {/* 🔥 WORKER PROFILE HEADER */}
        {user?.role === "WORKER" && worker && (
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-6">

            {/* IMAGE */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {worker.profileImage ? (
                <img
                  src={worker.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                  W
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {(() => {
                  const skill = worker.skills?.[0];
                  if (!skill) return t("worker.localWorker");

                  const key = mapSkillKey(skill);
                  const translated = t(key);

                  return translated === key ? skill : translated;
                })()}
              </h2>

              <p className="text-gray-500 text-sm">
                📍 {worker.location || t("profile.notAdded")}
              </p>

              <p className="text-gray-500 text-sm">
                🎯 {worker.experience || 0} {t("profile.yearsExperience")}
              </p>
            </div>

            {/* COMPLETION */}
            <div className="text-green-600 font-bold text-lg">
              {worker.profileCompletion || 0}%
            </div>
          </div>
        )}

        {/* BASIC INFO */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("profile.basicInfo")}
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <p className="text-gray-500">{t("profile.name")}</p>
            <p>{user?.name}</p>

            <p className="text-gray-500">{t("profile.phone")}</p>
            <p>{user?.phone}</p>

            <p className="text-gray-500">{t("profile.loginId")}</p>
            <p>{user?.loginId}</p>

            <p className="text-gray-500">{t("profile.role")}</p>
            <p>
              {user?.role === "WORKER"
                ? t("auth.worker")
                : t("auth.user")}
            </p>
          </div>
        </div>

        {/* WORKER SECTION */}
        {user?.role === "WORKER" && (
          <>
            {/* PROFILE STATUS */}
            <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">
                  {t("profile.workerProfile")}
                </h3>

                <p className="text-sm text-gray-500">
                  {worker?.profileCompleted
                    ? t("profile.completed")
                    : t("profile.incomplete")}
                </p>
              </div>

              <div className="text-green-600 font-bold">
                {worker?.profileCompletion || 0}%
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4">
              <Button
                onClick={() =>
                  router.push("/dashboard/worker/profile/edit")
                }
                className="w-full"
              >
                {t("profile.edit")}
              </Button>

              {worker && (
                <Button
                  onClick={() =>
                    router.push(`/worker/${worker.id}`)
                  }
                  className="w-full bg-blue-600"
                >
                  {t("profile.view")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}