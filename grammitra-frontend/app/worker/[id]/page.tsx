"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { getWorkerById } from "@/features/gram-mitra/services/workerService";
import { createBooking } from "@/features/gram-mitra/services/bookingService";
import { getUserIdFromToken } from "@/lib/auth";
import toast from "react-hot-toast";

type Worker = {
  id: string;
  name: string;
  skills: string[];
  wage?: number;
  availability?: boolean;
  experience?: string;
  location?: string;
  rating?: number; // ✅ NEW
  totalReviews?: number; // ✅ NEW
};

export default function WorkerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.id as string;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchWorker = async () => {
      if (!workerId) return;

      try {
        setLoading(true);
        const data = await getWorkerById(workerId);
        setWorker(data);
      } catch (error) {
        console.error("Failed to fetch worker", error);
        toast.error("Failed to load worker");
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [workerId]);

  const handleBooking = async () => {
    const userId = getUserIdFromToken();

    if (!userId) {
      toast("Please login first", { icon: "⚠️" });
      router.push("/auth/user/login");
      return;
    }

    try {
      setBookingLoading(true);

      toast.loading("Booking worker...", { id: "booking" });

      await createBooking(
        workerId,
        `Booking request for ${worker?.skills?.[0] || "service"}`
      );

      toast.success("Worker booked successfully!", { id: "booking" });
    } catch (error: any) {
      console.error(error);
      toast.error("Booking failed. Try again.", { id: "booking" });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!worker) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Worker not found
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="px-6 pt-24 pb-10 max-w-4xl mx-auto">

        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-card p-6">

          {/* NAME */}
          <h1 className="text-2xl font-bold text-dark mb-1">
            {worker.name}
          </h1>

          {/* ⭐ RATING */}
          <p className="text-yellow-500 font-medium mb-2">
            ⭐ {worker.rating?.toFixed(1) || "0.0"} (
            {worker.totalReviews || 0} reviews)
          </p>

          {/* SKILLS */}
          <p className="text-gray-500 mb-4">
            {worker.skills?.join(", ")}
          </p>

          {/* INFO */}
          <div className="grid grid-cols-2 gap-4 mb-6">

            <div>
              <p className="text-sm text-gray-500">Wage</p>
              <p className="font-medium">
                ₹ {worker.wage || "N/A"} /day
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <p className="font-medium">
                {worker.availability ? "Available" : "Busy"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="font-medium">
                {worker.experience || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                {worker.location || "Nearby"}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleBooking}
            className="w-full"
            disabled={bookingLoading}
          >
            {bookingLoading ? "Booking..." : "Hire Worker"}
          </Button>
        </div>
      </div>
    </div>
  );
}