"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { normalizeSkill } from "@/features/gram-mitra/utils/skills";

export default function Hero() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { t, lang } = useTranslation();

  if (!lang) return null;

  const handleSearch = () => {
    const value = search.trim().toLowerCase();

    if (!value) return;

    // 🔥 ONLY VALID SKILLS ALLOWED
    const validSkill = normalizeSkill(value);

    if (!validSkill) {
      return;
    }

    router.push(`/services/${encodeURIComponent(validSkill)}`);
  };

  return (
    <section className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden">

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/40 z-10" />

      {/* CONTENT */}
      <div className="relative z-20 text-center px-6 max-w-3xl">

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {t("home.title")}
        </h1>

        <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
          {t("home.subtitle")}
        </p>

        {/* SEARCH BOX */}
        <div
          className="
          flex flex-col sm:flex-row
          bg-[var(--card)]/95 backdrop-blur-md
          rounded-2xl overflow-hidden
          shadow-[0_10px_30px_rgba(0,0,0,0.2)]
          border border-[var(--border)]
          "
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("home.placeholder")}
            className="
              flex-1
              px-6
              py-4
              bg-transparent
              text-white
              placeholder:text-white/70
              outline-none
            "
          />

          <button
            onClick={handleSearch}
            className="
            bg-[var(--primary)]
            hover:opacity-90
            text-white
            px-8 py-4
            font-semibold
            transition
            "
          >
            {t("home.search")}
          </button>
        </div>

        <p className="mt-4 text-sm text-white/80">
          {t("home.trust")}
        </p>
      </div>
    </section>
  );
}