"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";

type Worker = {
  id: string;
  name: string;
  skills: string[];
  wage?: number;
  rating?: number; // ✅ NEW
  totalReviews?: number; // ✅ NEW
};

export default function WorkerCard({ worker }: { worker: Worker }) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/worker/${worker.id}`)}
      className="min-w-[200px]"
    >
      <h3 className="font-semibold text-dark">
        {worker.name}
      </h3>

      <p className="text-sm text-gray-500 capitalize">
        {worker.skills?.join(", ")}
      </p>

      {/* ⭐ RATING */}
      <p className="text-sm mt-2 text-yellow-500 font-medium">
        ⭐ {worker.rating?.toFixed(1) || "0.0"} (
        {worker.totalReviews || 0})
      </p>

      <p className="text-sm mt-1 text-primary font-medium">
        ₹ {worker.wage || "N/A"} /day
      </p>
    </Card>
  );
}