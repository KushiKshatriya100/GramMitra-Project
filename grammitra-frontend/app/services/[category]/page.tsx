"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkersBySkill } from "@/features/gram-mitra/services/workerService";
import WorkerCard from "@/features/gram-mitra/components/WorkerCard";
import Loader from "@/components/ui/Loader";
import Navbar from "@/components/layout/Navbar";

type Worker = {
  id: string;
  name: string;
  skills: string[];
  wage?: number;
  availability?: boolean;
};

export default function ServicesPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableOnly, setAvailableOnly] = useState(false);

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

  // 🔥 Filter logic
  const filteredWorkers = availableOnly
    ? workers.filter((w) => w.availability)
    : workers;

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <Navbar />

      <div className="px-6 pt-24 pb-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-blue-600 hover:underline mb-2"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-dark capitalize">
              {category} Workers
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Showing available workers near you
            </p>
          </div>

          {/* Filters */}
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={() =>
                  setAvailableOnly(!availableOnly)
                }
              />
              Available only
            </label>
          </div>
        </div>

        {/* Loading */}
        {loading && <Loader />}

        {/* Empty */}
        {!loading && filteredWorkers.length === 0 && (
          <p className="text-gray-500">
            No workers found for "{category}"
          </p>
        )}

        {/* Grid */}
        {!loading && filteredWorkers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredWorkers.map((worker, index) => (
              <WorkerCard
                key={worker.id || index} // 🔥 FIXED (safe fallback)
                worker={worker}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}