"use client";

import Navbar from "@/components/layout/Navbar";
import { useTranslation } from "@/shared/i18n/useTranslation";

export default function AboutPage() {
  const { t, lang } = useTranslation();

  if (!lang) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="pt-24 max-w-4xl mx-auto px-6 pb-12">

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-6">
          {t("about.title")}
        </h1>

        {/* DESCRIPTION */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {t("about.description")}
        </p>

        {/* SECTIONS */}
        <div className="space-y-6">

          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t("about.missionTitle")}
            </h2>
            <p className="text-gray-600">
              {t("about.mission")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t("about.howItWorksTitle")}
            </h2>
            <p className="text-gray-600">
              {t("about.howItWorks")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t("about.visionTitle")}
            </h2>
            <p className="text-gray-600">
              {t("about.vision")}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}