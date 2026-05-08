"use client";

import Navbar from "@/components/layout/Navbar";
import { useTranslation } from "@/shared/i18n/useTranslation";

export default function JobsPage() {
  const { t, lang } = useTranslation();

  if (!lang) return null;

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">

        <h1 className="text-3xl font-bold mb-2">
          {t("jobs.title")}
        </h1>

        <p className="text-gray-500 mb-6">
          {t("jobs.subtitle")}
        </p>

        <div className="bg-white rounded-2xl p-6 shadow text-center text-gray-500">
          {t("jobs.empty")}
        </div>
      </div>
    </div>
  );
}