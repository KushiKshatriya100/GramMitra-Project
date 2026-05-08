"use client";

import { useRouter } from "next/navigation";

import Image from "next/image";

import Card from "@/components/ui/Card";

import Button from "@/components/ui/Button";

import {
  useTranslation,
} from "@/shared/i18n/useTranslation";

import {
  mapSkillKey,
} from "@/features/gram-mitra/utils/translationMapper";

type Worker = {
  id: string;

  name?: string;

  skills: string[];

  wage?: number;

  rating?: number;

  totalReviews?: number;

  location?: string;

  profileImage?: string;

  availability?: boolean;

  distance?: number;

  experience?: number;

  dailyWage?: number;

  description?: string;

  verified?: boolean;
};

type Props = {
  worker: Worker;

  matchedSkill?: string;
};

export default function WorkerCard({
  worker,
  matchedSkill,
}: Props) {

  const router = useRouter();

  const { t, lang } =
    useTranslation();

  if (!lang) return null;

  // ✅ MATCHED SKILL PRIORITY
  const normalizedMatchedSkill =
    matchedSkill
      ?.toLowerCase()
      .trim();

  const matchedWorkerSkill =
    worker.skills?.find(
      (skill) =>
        skill
          ?.toLowerCase()
          .trim() ===
        normalizedMatchedSkill
    ) || worker.skills?.[0];

  // ✅ ORDERED SKILLS
  const orderedSkills = [
    matchedWorkerSkill,
    ...(worker.skills || []).filter(
      (s) =>
        s !==
        matchedWorkerSkill
    ),
  ];

  // ✅ TRANSLATED SKILLS
  const translatedSkills =
    orderedSkills?.map(
      (skill) => {

        const key =
          mapSkillKey(
            skill
          );

        const translated =
          t(key);

        return translated ===
          key
          ? skill
          : translated;
      }
    ) || [];

  const primarySkill =
    translatedSkills?.[0] ||
    t("worker.noSkills");

  // ✅ PROFILE IMAGE
  const workerImage =
    worker.profileImage &&
    worker.profileImage.trim() !==
      ""
      ? worker.profileImage
      : "/images/default-worker.jpg";

  // ✅ LIVE RATING
  const rating =
    typeof worker.rating ===
      "number" &&
    !isNaN(worker.rating)
      ? worker.rating.toFixed(
          1
        )
      : "0.0";

  // ✅ LIVE TOTAL REVIEWS
  const totalReviews =
    worker.totalReviews || 0;

  return (
    <Card
      onClick={() =>
        router.push(
          `/worker/${worker.id}`
        )
      }
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-gray-100
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        cursor-pointer
      "
    >

      {/* TOP */}
      <div className="mb-4 flex items-start justify-between">

        {/* IMAGE */}
        <div className="relative">

          <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-gray-50 shadow-sm md:h-20 md:w-20">

            <Image
              src={workerImage}
              alt={
                worker.name ||
                "worker"
              }
              fill
              className="
                object-cover
                transition-transform
                duration-500
                group-hover:scale-110
              "
            />
          </div>

          {/* ONLINE */}
          {worker.availability && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
          )}
        </div>

        {/* BADGES */}
        <div className="flex flex-col items-end gap-2">

          {/* VERIFIED */}
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 ring-1 ring-inset ring-green-600/20">

            ✓{" "}
            {t(
              "worker.verified"
            ).toUpperCase()}
          </span>

          {/* RATING */}
          <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 ring-1 ring-yellow-100">

            <span className="text-yellow-500 text-sm">

              ★
            </span>

            <span className="text-xs font-bold text-gray-900">

              {rating}
            </span>

            <span className="text-[10px] text-gray-500">

              (
              {
                totalReviews
              }
              )
            </span>
          </div>
        </div>
      </div>

      {/* IDENTITY */}
      <div className="mb-3">

        <h3 className="truncate text-base font-bold text-gray-900">

          {worker.name ||
            t(
              "worker.localWorker"
            )}
        </h3>

        <p className="text-xs font-semibold uppercase tracking-wide text-[#A35231]">

          {primarySkill}
        </p>
      </div>

      {/* STATS */}
      <div className="mb-4 flex gap-2">

        {/* EXPERIENCE */}
        <div className="flex-1 rounded-xl bg-gray-50 p-2 text-center">

          <p className="mb-1 text-[10px] font-medium uppercase leading-none text-gray-400">

            Exp.
          </p>

          <p className="text-xs font-bold text-gray-800">

            {
              worker.experience ||
              0
            }
            + Yrs
          </p>
        </div>

        {/* WAGE */}
        <div className="flex-1 rounded-xl bg-orange-50 p-2 text-center">

          <p className="mb-1 text-[10px] font-medium uppercase leading-none text-orange-400">

            Wage
          </p>

          <p className="text-xs font-bold text-[#A35231]">

            ₹
            {worker.dailyWage ||
              worker.wage ||
              0}
          </p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="mb-4 h-12 overflow-hidden">

        <p className="line-clamp-2 text-[13px] leading-relaxed text-gray-500">

          {worker.description ||
            `Expert in ${primarySkill} providing high-quality service.`}
        </p>
      </div>

      {/* SKILL TAGS */}
      <div className="mb-4 flex h-8 flex-wrap gap-1.5 overflow-hidden">

        {translatedSkills
          .slice(1, 3)
          .map((skill) => (

            <span
              key={skill}
              className="
                whitespace-nowrap
                rounded-lg
                bg-gray-100
                px-2.5
                py-1
                text-[10px]
                font-medium
                text-gray-600
              "
            >
              {skill}
            </span>
          ))}
      </div>

      {/* FOOTER */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">

        {/* LOCATION */}
        <div className="flex items-center gap-1 truncate text-gray-400">

          <span className="text-sm">
            📍
          </span>

          <span className="truncate text-[11px] font-medium">

            {worker.location ||
              "Nearby"}
          </span>
        </div>

        {/* DISTANCE */}
        {worker.distance !==
          undefined && (

          <span className="text-[10px] font-bold text-gray-400">

            {worker.distance.toFixed(
              1
            )}{" "}
            km
          </span>
        )}
      </div>

      {/* BUTTONS */}
      <div className="mt-4 flex gap-2">

        {/* VIEW */}
        <Button
          onClick={(e: any) => {

            e.stopPropagation();

            router.push(
              `/worker/${worker.id}`
            );
          }}
          variant="outline"
          className="
            h-10
            flex-1
            rounded-xl
            border-gray-200
            text-xs
            font-bold
            text-gray-700
            hover:bg-gray-50
          "
        >
          {t("worker.view")}
        </Button>

        {/* HIRE */}
        <Button
          onClick={(e: any) => {

            e.stopPropagation();

            router.push(
              `/worker/${worker.id}`
            );
          }}
          className="
            h-10
            flex-[1.5]
            rounded-xl
            bg-[#A35231]
            text-xs
            font-bold
            text-white
            shadow-md
            shadow-orange-900/20
            hover:bg-[#8B4428]
          "
        >
          {t("worker.hire")}
        </Button>
      </div>
    </Card>
  );
}