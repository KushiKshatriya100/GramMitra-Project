"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loader from "@/components/ui/Loader";
import BookingCard from "@/features/gram-mitra/components/BookingCard";
import {
  getUserBookings,
  getWorkerBookings,
} from "@/features/gram-mitra/services/bookingService";
import { getUserIdFromToken } from "@/lib/auth";

type Booking = {
  id: string;
  workerId: string;
  status: string;
  description: string;
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as string;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH FUNCTION (reusable for realtime)
  const fetchBookings = async () => {
    const userId = getUserIdFromToken();

    if (!userId) {
      router.push("/auth/user/login");
      return;
    }

    try {
      setLoading(true);

      if (role === "user") {
        const data = await getUserBookings(); // ✅ FIXED (no param)
        setBookings(data || []);
      } else if (role === "worker") {
        const data = await getWorkerBookings(userId);
        setBookings(data || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 INITIAL LOAD
  useEffect(() => {
    fetchBookings();
  }, [role]);

  // 🔥 REAL-TIME (AUTO REFRESH)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, [role]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="px-6 pt-24 pb-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark capitalize">
            {role} Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your bookings and requests
          </p>
        </div>

        {/* Loading */}
        {loading && <Loader />}

        {/* Empty */}
        {!loading && bookings.length === 0 && (
          <p className="text-gray-500">No bookings found</p>
        )}

        {/* List */}
        {!loading && bookings.length > 0 && (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role={role}
                onAction={fetchBookings} // 🔥 important
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}