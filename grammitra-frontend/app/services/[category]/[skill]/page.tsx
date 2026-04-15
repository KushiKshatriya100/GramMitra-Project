"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getWorkersBySkill } from "@/features/gram-mitra/services/workerService";
import WorkerCard from "@/features/gram-mitra/components/WorkerCard";
import Loader from "@/components/ui/Loader";

type Worker = {
  id: string;
  name: string;
  skills: string[];
  wage?: number;
};

export default function ServicesPage() {
  const params = useParams();
  const category = params.category as string;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!category) return;

      setLoading(true);

      const data = await getWorkersBySkill(category);

      setWorkers(data || []);
      setLoading(false);
    };

    fetchWorkers();
  }, [category]);

  return (
    <div className="min-h-screen px-6 py-24 bg-background">

      {/* Title */}
      <h1 className="text-3xl font-bold text-dark mb-8 capitalize">
        {category} Workers
      </h1>

      {/* Loading */}
      {loading && <Loader />}

      {/* Empty State */}
      {!loading && workers.length === 0 && (
        <p className="text-gray-500">
          No workers found for "{category}"
        </p>
      )}

      {/* Worker Grid */}
      {!loading && workers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}