"use client";

import {
  acceptBooking,
  rejectBooking,
} from "@/features/gram-mitra/services/bookingService";

export default function BookingCard({
  booking,
  role,
  onAction,
}: any) {
  const handleAccept = async () => {
    await acceptBooking(booking.id);
    onAction(); // 🔥 refresh
  };

  const handleReject = async () => {
    await rejectBooking(booking.id);
    onAction(); // 🔥 refresh
  };

  return (
    <div className="p-4 bg-white shadow rounded border">
      <p className="font-semibold">{booking.description}</p>

      <p className="text-sm mt-1">
        Status:{" "}
        <span
          className={
            booking.status === "PENDING"
              ? "text-yellow-600"
              : booking.status === "ACCEPTED"
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {booking.status}
        </span>
      </p>

      {/* 🔥 WORKER ACTIONS */}
      {role === "worker" && booking.status === "PENDING" && (
        <div className="mt-3 space-x-2">
          <button
            onClick={handleAccept}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Accept
          </button>

          <button
            onClick={handleReject}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}