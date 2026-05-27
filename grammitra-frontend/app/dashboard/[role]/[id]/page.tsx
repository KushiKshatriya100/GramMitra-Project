"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loader from "@/components/ui/Loader";
import Button from "@/components/ui/Button";
import { getWorkerById } from "@/features/gram-mitra/services/workerService";
import { useTranslation } from "@/shared/i18n/useTranslation";

export default function DashboardWorkerViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      if (!id) return;

      try {
        const data = await getWorkerById(id as string);
        setWorker(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [id]);

  if (!lang) return null;
  if (loading) return <Loader />;

  if (!worker) {
    return (
      <div className="pt-24 text-center text-[var(--text-soft)]">
        {t("common.notFound")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-10">

        <button
          onClick={() => router.back()}
          className="text-[var(--primary)] text-sm mb-4 hover:underline"
        >
          ← {t("common.back")}
        </button>

        <div className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-2xl shadow-[var(--shadow-soft)] p-6 space-y-4">

          <h1 className="text-2xl font-bold text-[var(--text)]">
            {worker.skills?.[0] || t("worker.localWorker")}
          </h1>

          <p>📍 {worker.location || t("profile.notAdded")}</p>

          <p>
            {t("worker.experience")} : {worker.experience || 0}
          </p>

          <p>
            ₹ {worker.wage} {t("worker.perDay")}
          </p>

          <p>
            {worker.availability
              ? t("worker.available")
              : t("worker.busy")}
          </p>

          <Button
            onClick={() => router.push(`/worker/${worker.id}`)}
          >
            {t("profile.view")}
          </Button>
        </div>
      </div>
    </div>
  );
}
