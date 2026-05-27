"use client";

import { useRouter } from "next/navigation";
import CategoryCard from "@/features/gram-mitra/components/CategoryCard";
import { sections } from "@/features/gram-mitra/utils/categories";
import { getCategoryIcon } from "@/features/gram-mitra/utils/categoryIcons";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { formatSkillName } from "@/features/gram-mitra/utils/formatText";

export default function Services() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  if (!lang) return null;

  return (
    <section className="bg-[var(--bg)] py-20 px-6">
      <div className="max-w-6xl mx-auto">

        <h2 className="section-title mb-12">
          {t("services.title")}
        </h2>

        {sections.map((section) => (
          <div key={section.title.en} className="mb-16">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {section.title[lang]}
              </h3>

              <button
                onClick={() => router.push("/services")}
                className="text-sm text-[var(--primary)] font-medium hover:underline"
              >
                {t("services.explore")}
              </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">

              {section.items.map((item) => {
                const icon = getCategoryIcon(item.en);

                const displayTitle =
                  lang === "en"
                    ? formatSkillName(item.en)
                    : item.hi;

                return (
                  <div key={item.en} className="snap-start flex-shrink-0">
                    <CategoryCard
                      icon={icon}
                      title={displayTitle}
                      onClick={() =>
                        router.push(
                          `/services/${section.title.en
                            .toLowerCase()
                            .replace(/\s+/g, "-")}/${item.en
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`
                        )
                      }
                    />
                  </div>
                );
              })}

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
