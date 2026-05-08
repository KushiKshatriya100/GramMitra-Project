"use client";

import { useTranslation } from "@/shared/i18n/useTranslation";
import Navbar from "@/components/layout/Navbar";

export default function ContactPage() {
  const { t, lang } = useTranslation();
  if (!lang) return null;

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-10">
        <h1 className="text-3xl font-bold mb-4">
          {t("contact.title")}
        </h1>

        <p className="text-gray-700 text-lg">
          📞 {t("contact.phone")}
        </p>

        <p className="text-gray-700 text-lg mt-2">
          📧 {t("contact.email")}
        </p>

        <p className="text-gray-700 mt-4">
          {t("contact.desc")}
        </p>
      </div>
    </div>
  );
}