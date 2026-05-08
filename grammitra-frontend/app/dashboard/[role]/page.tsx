"use client";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Navbar from "@/components/layout/Navbar";

import BookingCard from "@/features/gram-mitra/components/BookingCard";

import {
  getUserBookings,
  getWorkerBookings,
} from "@/features/gram-mitra/services/bookingService";

import {
  getMyProfile,
} from "@/features/gram-mitra/services/workerService";

import {
  getUserIdFromToken,
} from "@/lib/auth";

import {
  useTranslation,
} from "@/shared/i18n/useTranslation";

import toast from "react-hot-toast";

type Booking = {
  id: string;

  workerId: string;

  userId?: string;

  status:
    | "PENDING"
    | "PAID"
    | "ACCEPTED"
    | "REJECTED"
    | "COMPLETED";

  description: string;

  paymentStatus?:
    | "PENDING"
    | "PAID"
    | "FAILED";

  amount?: number;

  reviewSubmitted?: boolean;
};

export default function DashboardPage() {

  const params = useParams();

  const router = useRouter();

  const { t, lang } =
    useTranslation();

  const role =
    params.role as string;

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [
    incomingBookings,
    setIncomingBookings,
  ] = useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ✅ WORKER PROFILE ID
  const [
    workerProfileId,
    setWorkerProfileId,
  ] = useState<string | null>(
    null
  );

  // ✅ NEW TAB STATE
  const [activeTab, setActiveTab] =
    useState<
      | "my-bookings"
      | "incoming-jobs"
    >("my-bookings");

  // 🔁 SAFE TRANSLATION
  const translate = (
    key: string,
    fallback: string
  ) => {

    const value = t(key);

    return value === key
      ? fallback
      : value;
  };

  const fetchBookings =
    useCallback(async () => {

      const userId =
        getUserIdFromToken();

      if (!userId) {

        router.push(
          "/auth/user/login"
        );

        return;
      }

      try {

        setLoading(true);

        let userBookings:
          Booking[] = [];

        let workerBookings:
          Booking[] = [];

        // ✅ USER DASHBOARD
        if (role === "user") {

          userBookings =
            await getUserBookings();

          setBookings(
            userBookings || []
          );
        }

        // ✅ WORKER DASHBOARD
        else if (
          role === "worker"
        ) {

          // 📤 MY BOOKINGS
          userBookings =
            await getUserBookings();

          // ✅ GET ACTUAL WORKER PROFILE
          const profile =
            await getMyProfile();

          if (profile?.id) {

            setWorkerProfileId(
              profile.id
            );

            // 📥 INCOMING JOBS
            workerBookings =
              await getWorkerBookings(
                profile.id
              );
          }

          setBookings(
            userBookings || []
          );

          setIncomingBookings(
            workerBookings || []
          );
        }

      } catch (err) {

        console.error(
          "Dashboard error:",
          err
        );

        toast.error(
          translate(
            "dashboard.loadFailed",
            "Failed to load dashboard"
          )
        );

      } finally {

        setLoading(false);
      }

    }, [role, router]);

  // ✅ INITIAL LOAD
  useEffect(() => {

    fetchBookings();

  }, [fetchBookings]);

  if (!lang) return null;

  // 📊 STATS
  // ✅ USE CORRECT SOURCE BASED ON ROLE
  const statsSource =
    role === "worker"
      ? incomingBookings
      : bookings;

  // ✅ COMPLETED BOOKINGS
  const completedBookings =
    statsSource.filter(
      (b) =>
        b.status ===
        "COMPLETED"
    );

  // ✅ PENDING REVIEWS
  const pendingReviews =
    completedBookings.filter(
      (b) =>
        !b.reviewSubmitted
    );

  const activeBookings =
    role === "worker" &&
    activeTab ===
      "incoming-jobs"
      ? incomingBookings
      : bookings;

  if (loading) {

    return (
      <div className="min-h-screen bg-[#F5EFE6]">

        <Navbar />

        <div className="pt-24 text-center text-gray-500">

          {translate(
            "common.loading",
            "Loading..."
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6]">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-[var(--text)]">

            {translate(
              "dashboard.title",
              "Your Dashboard"
            )}{" "}
            (
            {role === "worker"
              ? translate(
                  "auth.worker",
                  "Worker"
                )
              : translate(
                  "auth.user",
                  "User"
                )}
            )
          </h1>

          <p className="text-gray-500 mt-2">

            {translate(
              "dashboard.subtitle",
              "Manage your bookings and track your activity"
            )}
          </p>

          {/* 📩 SMS NOTICE */}
          <div className="mt-3 text-sm text-gray-500">

            📩{" "}
            {translate(
              "booking.smsNotice",
              "Worker will be notified via SMS"
            )}
          </div>
        </div>

        {/* ✅ DASHBOARD STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* TOTAL */}
          <div className="rounded-3xl bg-white border border-[var(--border)] p-6 shadow-sm">

            <p className="text-sm text-gray-500 mb-2">

              Total Bookings
            </p>

            <h2 className="text-3xl font-bold text-[var(--text)]">

              {statsSource.length}
            </h2>
          </div>

          {/* COMPLETED */}
          <div className="rounded-3xl bg-white border border-[var(--border)] p-6 shadow-sm">

            <p className="text-sm text-gray-500 mb-2">

              Completed Services
            </p>

            <h2 className="text-3xl font-bold text-green-600">

              {
                completedBookings.length
              }
            </h2>
          </div>

          {/* PENDING REVIEW */}
          <div className="rounded-3xl bg-white border border-[var(--border)] p-6 shadow-sm">

            <p className="text-sm text-gray-500 mb-2">

              Pending Reviews
            </p>

            <h2 className="text-3xl font-bold text-orange-500">

              {
                pendingReviews.length
              }
            </h2>
          </div>
        </div>

        {/* ⭐ REVIEW ALERT */}
        {pendingReviews.length >
          0 && (
          <div className="mb-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-5">

            <div className="flex items-start gap-3">

              <div className="text-2xl">
                ⭐
              </div>

              <div>

                <h3 className="font-semibold text-yellow-800">

                  Review Pending
                </h3>

                <p className="text-sm text-yellow-700 mt-1">

                  You have{" "}
                  <span className="font-semibold">

                    {
                      pendingReviews.length
                    }
                  </span>{" "}
                  completed booking
                  {pendingReviews.length >
                  1
                    ? "s"
                    : ""}{" "}
                  waiting for
                  review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ WORKER TABS */}
        {role === "worker" && (

          <div className="flex flex-wrap gap-3 mb-8">

            {/* 📤 MY BOOKINGS */}
            <button
              onClick={() =>
                setActiveTab(
                  "my-bookings"
                )
              }
              className={`
                px-5 py-3 rounded-2xl font-medium transition-all duration-300
                ${
                  activeTab ===
                  "my-bookings"
                    ? "bg-[var(--primary)] text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200"
                }
              `}
            >
              📤 My Bookings

              <span className="ml-2 text-xs opacity-80">

                ({
                  bookings.length
                })
              </span>
            </button>

            {/* 📥 INCOMING JOBS */}
            <button
              onClick={() =>
                setActiveTab(
                  "incoming-jobs"
                )
              }
              className={`
                px-5 py-3 rounded-2xl font-medium transition-all duration-300
                ${
                  activeTab ===
                  "incoming-jobs"
                    ? "bg-[var(--primary)] text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200"
                }
              `}
            >
              📥 Incoming Jobs

              <span className="ml-2 text-xs opacity-80">

                ({
                  incomingBookings.length
                })
              </span>
            </button>
          </div>
        )}

        {/* EMPTY */}
        {activeBookings.length ===
          0 && (

          <div className="rounded-3xl border border-[var(--border)] bg-white p-12 text-center shadow-sm">

            <div className="text-6xl mb-4">

              📭
            </div>

            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">

              No Bookings Found
            </h3>

            <p className="text-gray-500">

              {translate(
                "dashboard.noBookings",
                "No bookings found"
              )}
            </p>
          </div>
        )}

        {/* LIST */}
        {activeBookings.length >
          0 && (

          <div className="grid gap-5">

            {activeBookings.map(
              (booking) => (

                <BookingCard
                  key={booking.id}
                  booking={booking}
                  role={
                    role ===
                      "worker" &&
                    activeTab ===
                      "incoming-jobs"
                      ? "worker"
                      : "user"
                  }
                  onAction={
                    fetchBookings
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}