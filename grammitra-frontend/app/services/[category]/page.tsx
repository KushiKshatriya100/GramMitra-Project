"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loader from "@/components/ui/Loader";
import Button from "@/components/ui/Button";
import WorkerCard from "@/features/gram-mitra/components/WorkerCard";
import { getWorkersBySkill } from "@/features/gram-mitra/services/workerService";
import { createBooking } from "@/features/gram-mitra/services/bookingService";
import toast from "react-hot-toast";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { mapSkillKey } from "@/features/gram-mitra/utils/translationMapper";

export default function CategoryPage() {
  const { category } = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // 🔥 URL slug → readable text
  const decoded = decodeURIComponent((category as string) || "")
    .replace(/-/g, " ")
    .trim();

  const skillKey = mapSkillKey(decoded);

  const translatedCategory =
    t(skillKey) === skillKey ? decoded : t(skillKey);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!decoded) return;

      try {
        setLoading(true);

        const data = await getWorkersBySkill(decoded);

        setWorkers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Category fetch error:", err);
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [decoded]);

  const handleHire = async (
    workerId: string,
    translatedSkill: string
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast(t("auth.loginRequired"));
      router.push("/auth/user/login");
      return;
    }

    try {
      setBookingId(workerId);

      await createBooking(
        workerId,
        `${t("worker.bookingRequest")} ${translatedSkill}`
      );

      toast.success(t("worker.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("worker.failed"));
    } finally {
      setBookingId(null);
    }
  };

  if (!lang) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-soft)]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-16">
          <div className="max-w-3xl">

            {/* BADGE */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)]/80 border border-[var(--border)] shadow-[var(--shadow-soft)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />

              <span className="text-sm font-medium text-[var(--text-soft)]">
                {workers.length} {t("services.title")}
              </span>
            </div>

            {/* TITLE */}
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] capitalize leading-tight">
              {translatedCategory}

              <span className="block text-[var(--primary)] mt-2">
                {t("services.title")}
              </span>
            </h1>

            {/* SUBTITLE */}
            <p className="mt-5 text-lg text-[var(--text-soft)] leading-relaxed">
              {t("services.findTrusted", { skill: translatedCategory })}
            </p>

            {/* STATS */}
            <div className="flex flex-wrap gap-4 mt-8">

              <div className="bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl px-5 py-4 shadow-[var(--shadow-soft)]">
                <p className="text-2xl font-bold text-[var(--text)]">
                  {workers.length}
                </p>

                <p className="text-sm text-[var(--text-soft)]">
                  {t("services.availableWorkers")}
                </p>
              </div>

              <div className="bg-[var(--card)]/90 border border-[var(--border)] rounded-2xl px-5 py-4 shadow-[var(--shadow-soft)]">
                <p className="text-2xl font-bold text-[var(--text)]">
                  100%
                </p>

                <p className="text-sm text-[var(--text-soft)]">
                  {t("services.verifiedProfiles")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <Loader />
          </div>
        )}

        {/* EMPTY */}
        {!loading && workers.length === 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-10 text-center shadow-[var(--shadow-soft)]">
            <div className="text-6xl mb-5">🔎</div>

            <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
              {t("services.noWorkers")}
            </h2>

            <p className="text-[var(--text-soft)] max-w-lg mx-auto leading-relaxed">
              {t("services.noWorkersNear", { skill: translatedCategory })}
            </p>

            <Button
              onClick={() => router.push("/services")}
              className="mt-8"
            >
              {t("services.exploreOther")}
            </Button>
          </div>
        )}

        {/* WORKERS */}
        {!loading && workers.length > 0 && (
          <>
            {/* SECTION HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

              <div>
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  {t("services.availableWorkers")}
                </h2>

                <p className="text-[var(--text-soft)] mt-1">
                  {t("services.subtitle")}
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-soft)] w-fit">
                <span className="text-[var(--success)]">●</span>

                <span className="text-sm font-medium text-[var(--text-soft)]">
                  {t("services.activeResults", { count: workers.length })}
                </span>
              </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {workers.map((w) => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  matchedSkill={decoded}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}