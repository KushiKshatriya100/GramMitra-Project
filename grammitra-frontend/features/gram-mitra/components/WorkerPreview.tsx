"use client";

import { useEffect, useState } from "react";
import { getWorkersBySkill } from "@/features/gram-mitra/services/workerService";
import WorkerCard from "./WorkerCard";
import Loader from "@/components/ui/Loader";

type Worker = {
  id: string;
  name: string;
  skills: string[];
  wage?: number;
};

export default function WorkerPreview({ skill }: { skill: string }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);

      const data = await getWorkersBySkill(skill);

      setWorkers(data || []);
      setLoading(false);
    };

    fetchWorkers();
  }, [skill]);

  if (loading) return <Loader />;

  if (!workers.length) {
    return (
      <p className="text-sm text-gray-500">
        No workers found for "{skill}"
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto">
      {workers.slice(0, 5).map((worker) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </div>
  );
}