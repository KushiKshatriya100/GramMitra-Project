"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  getWorkersBySkill,
  getNearbyWorkers,
} from "@/features/gram-mitra/services/workerService";

import WorkerCard from "@/features/gram-mitra/components/WorkerCard";
import Navbar from "@/components/layout/Navbar";

import { useTranslation } from "@/shared/i18n/useTranslation";
import { mapSkillKey } from "@/features/gram-mitra/utils/translationMapper";

type Worker = {
  id: string;
  skills: string[];
  wage?: number;
  profileImage?: string;
  location?: string;
  availability?: boolean;
  profileCompleted?: boolean;
  rating?: number;
  totalReviews?: number;
  distance?: number;
};

export default function ServicesPage() {
  const params = useParams();

  const { t, lang } = useTranslation();

  const skillRaw = params.skill as string;

  const skill = decodeURIComponent(skillRaw || "")
    .replace(/-/g, " ")
    .trim();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<
    "rating" | "nearest" | "wage"
  >("rating");

  useEffect(() => {
    if (!skill) return;

    let isMounted = true;

    const fetchWorkers = async () => {
      setLoading(true);

      if (!navigator?.geolocation) {
        console.warn(
          "Geolocation not supported → fallback"
        );

        await fallbackFetch();

        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } =
              position.coords;

            const data =
              await getNearbyWorkers(
                latitude,
                longitude,
                skill
              );

            if (!isMounted) return;

            const safeData = Array.isArray(data)
              ? data
              : [];

            setWorkers(safeData);
          } catch (err) {
            console.error(
              "Nearby fetch error:",
              err
            );

            await fallbackFetch();
          } finally {
            if (isMounted) {
              setLoading(false);
            }
          }
        },

        async (error) => {
          console.warn(
            "Geolocation error:",
            error.message
          );

          await fallbackFetch();
        },

        {
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    };

    const fallbackFetch = async () => {
      try {
        const data =
          await getWorkersBySkill(skill);

        if (!isMounted) return;

        const filtered =
          data?.filter(
            (w: Worker) =>
              w.profileCompleted &&
              w.availability
          ) || [];

        setWorkers(filtered);
      } catch (err) {
        console.error(
          "Fallback fetch error:",
          err
        );

        setWorkers([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWorkers();

    return () => {
      isMounted = false;
    };
  }, [skill]);

  // ✅ TRANSLATION KEY
  const skillKey = mapSkillKey(skill);

  // ✅ REMOVE PREFIX
  const cleanSkillKey =
    skillKey.replace("skills.", "");

  // ✅ TRANSLATED TITLE
  const translatedSkill =
    t(skillKey) === skillKey
      ? skill
      : t(skillKey);

  // ✅ SMART SORTING
  const sortedWorkers = useMemo(() => {
    const cloned = [...workers];

    switch (sortBy) {
      case "nearest":
        return cloned.sort(
          (a, b) =>
            (a.distance ?? 9999) -
            (b.distance ?? 9999)
        );

      case "wage":
        return cloned.sort(
          (a, b) =>
            (a.wage ?? 999999) -
            (b.wage ?? 999999)
        );

      default:
        return cloned.sort(
          (a, b) =>
            (b.rating ?? 0) -
            (a.rating ?? 0)
        );
    }
  }, [workers, sortBy]);

  if (!lang) return null;

  // ✅ LOADER
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />

        <div className="pt-32 text-center">
          <div className="inline-flex flex-col items-center gap-4">

            <div
              className="
                w-12 h-12
                border-4
                border-[var(--border)]
                border-t-[var(--primary)]
                rounded-full
                animate-spin
              "
            />

            <p className="text-[var(--text-soft)]">
              {t("common.loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* HERO */}
      <section
        className="
          relative
          overflow-hidden
          border-b border-[var(--border)]
          bg-[var(--card)]
        "
      >

        {/* BACKGROUND GLOW */}
        <div
          className="
            absolute inset-0
            opacity-70
            pointer-events-none
          "
          style={{
            background: `
              radial-gradient(
                circle at top right,
                rgba(160,82,45,0.12),
                transparent 30%
              ),
              radial-gradient(
                circle at bottom left,
                rgba(124,154,109,0.10),
                transparent 30%
              )
            `,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16">

          {/* BREADCRUMB */}
          <div
            className="
              flex items-center gap-2
              text-sm
              text-[var(--text-soft)]
              mb-5
            "
          >
            <span>{t("navbar.home")}</span>

            <span>/</span>

            <span>{t("navbar.services")}</span>

            <span>/</span>

            <span className="text-[var(--primary)] font-medium">
              {translatedSkill}
            </span>
          </div>

          {/* TITLE */}
          <div className="max-w-3xl">

            <h1
              className="
                text-4xl
                md:text-5xl
                font-bold
                leading-tight
                text-[var(--text)]
              "
            >
              {translatedSkill} Services
            </h1>

            <p
              className="
                mt-5
                text-lg
                leading-relaxed
                text-[var(--text-soft)]
              "
            >
              {t(
                `serviceSubtitles.${cleanSkillKey}`
              ) ||
                t("services.subtitle")}
            </p>

            {/* STATS */}
            <div className="flex flex-wrap gap-4 mt-8">

              {/* WORKERS */}
              <div
                className="
                  px-5 py-4
                  rounded-2xl
                  bg-[var(--bg)]
                  border border-[var(--border)]
                  shadow-[var(--shadow-soft)]
                  min-w-[160px]
                "
              >
                <p className="text-2xl font-bold text-[var(--text)]">
                  {sortedWorkers.length}
                </p>

                <p className="text-sm text-[var(--text-soft)] mt-1">
                  Available Workers
                </p>
              </div>

              {/* TRUST */}
              <div
                className="
                  px-5 py-4
                  rounded-2xl
                  bg-[var(--bg)]
                  border border-[var(--border)]
                  shadow-[var(--shadow-soft)]
                  min-w-[180px]
                "
              >
                <p className="text-2xl font-bold text-[var(--primary)]">
                  ★
                </p>

                <p className="text-sm text-[var(--text-soft)] mt-1">
                  Trusted Local Services
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* FILTER BAR */}
        {sortedWorkers.length > 0 && (
          <div
            className="
              flex flex-col md:flex-row
              md:items-center md:justify-between
              gap-5
              mb-10
            "
          >
            <div>
              <h2
                className="
                  text-2xl
                  font-semibold
                  text-[var(--text)]
                "
              >
                Available Workers
              </h2>

              <p className="text-[var(--text-soft)] text-sm mt-1">
                Skilled workers available near your
                location
              </p>
            </div>

            {/* SORT */}
            <div className="flex items-center gap-3">

              <span className="text-sm text-[var(--text-soft)]">
                Sort by:
              </span>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "rating"
                      | "nearest"
                      | "wage"
                  )
                }
                className="
                  px-4 py-2.5
                  rounded-xl
                  border border-[var(--border)]
                  bg-[var(--bg)]
                  text-[var(--text)]
                  outline-none
                  shadow-[var(--shadow-soft)]
                "
              >
                <option value="rating">
                  Top Rated
                </option>

                <option value="nearest">
                  Nearest
                </option>

                <option value="wage">
                  Lowest Wage
                </option>
              </select>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {sortedWorkers.length === 0 && (
          <div
            className="
              mt-14
              border border-[var(--border)]
              rounded-3xl
              bg-[var(--card)]
              p-12
              text-center
              shadow-[var(--shadow-soft)]
            "
          >
            <div className="text-6xl mb-5">
              🔍
            </div>

            <h3
              className="
                text-2xl
                font-semibold
                text-[var(--text)]
                mb-3
              "
            >
              {t("services.noWorkers")}
            </h3>

            <p
              className="
                text-[var(--text-soft)]
                max-w-md
                mx-auto
              "
            >
              Try searching nearby areas or explore
              similar services available on GramMitra.
            </p>
          </div>
        )}

        {/* WORKERS GRID */}
        {sortedWorkers.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-7
            "
          >
            {sortedWorkers.map((worker) => (
              <div
                key={worker.id}
                className="animate-fadeIn"
              >
                <WorkerCard worker={worker} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}