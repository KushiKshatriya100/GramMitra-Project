"use client";

import { useEffect, useState } from "react";
import { getWorkersBySkill } from "@/features/gram-mitra/services/workerService";
import WorkerCard from "./WorkerCard";
import Loader from "@/components/ui/Loader";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { mapSkillKey } from "@/features/gram-mitra/utils/translationMapper";

type Worker = {
  id: string;
  skills: string[];
  wage?: number;
  profileImage?: string;
  availability?: boolean;
};

export default function WorkerPreview({ skill }: { skill: string }) {
  const { t, lang } = useTranslation();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);

        const data = await getWorkersBySkill(skill);

        const filtered =
          data?.filter((w: Worker) => w.availability).slice(0, 5) || [];

        setWorkers(filtered);
      } catch (err) {
        console.error(err);
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [skill]);

  if (!lang) return null;

  if (loading) return <Loader />;

  if (!workers.length) {
    const skillKey = mapSkillKey(skill);
    const translatedSkill = t(skillKey);
    return (
      <p className="text-sm text-[var(--text-soft)]">
        {t("worker.noWorkers")} "
        {translatedSkill === skillKey ? skill : translatedSkill}"
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto">
      {workers.map((worker) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </div>
  );
}