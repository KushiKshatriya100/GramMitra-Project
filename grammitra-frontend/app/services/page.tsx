"use client";

import Navbar from "@/components/layout/Navbar";
import { sections } from "@/features/gram-mitra/utils/categories";
import { getCategoryIcon } from "@/features/gram-mitra/utils/categoryIcons";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { useRouter } from "next/navigation";
import { formatSkillName } from "@/features/gram-mitra/utils/formatText";

export default function ServicesPage() {
  const { t, lang } = useTranslation();
  const router = useRouter();

  if (!lang) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="pt-24 max-w-6xl mx-auto px-6 pb-10">

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-10">
          {t("services.title")}
        </h1>

        {/* ALL SERVICES */}
        {sections.map((section) => (
          <div key={section.title.en} className="mb-12">

            <h2 className="text-xl font-semibold mb-5">
              {section.title[lang]}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

              {section.items.map((item) => {
                const icon = getCategoryIcon(item.en);

                const title =
                  lang === "en"
                    ? formatSkillName(item.en)
                    : item.hi;

                return (
                  <div
                    key={item.en}
                    onClick={() =>
                      router.push(
                        `/services/${section.title.en
                          .toLowerCase()
                          .replace(/\s+/g, "-")}/${item.en
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      )
                    }
                    className="bg-white p-6 rounded-xl shadow hover:shadow-md hover:scale-105 transition cursor-pointer text-center"
                  >
                    <div className="text-3xl mb-3">{icon}</div>

                    <p className="font-medium">
                      {title}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}