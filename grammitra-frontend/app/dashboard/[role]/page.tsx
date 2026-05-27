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

  // 📊 STATS — driven by the currently visible tab. Previously the worker
  // dashboard always showed stats from `incomingBookings` even when the
  // "My Bookings" tab was active, which was confusing.
  const activeBookings =
    role === "worker" && activeTab === "incoming-jobs"
      ? incomingBookings
      : bookings;

  const completedBookings = activeBookings.filter(
    (b) => b.status === "COMPLETED"
  );

  // ✅ PENDING REVIEWS — only meaningful for the user side of a booking
  // (workers don't leave reviews on bookings; users do). So we only surface
  // this for "My Bookings" tabs.
  const isMyBookingsView =
    role === "user" ||
    (role === "worker" && activeTab === "my-bookings");

  const pendingReviews = isMyBookingsView
    ? completedBookings.filter((b) => !b.reviewSubmitted)
    : [];

  if (loading) {

    return (
      <div className="min-h-screen bg-[var(--bg)]">

        <Navbar />

        <div className="pt-24 text-center text-[var(--text-soft)]">

          {translate(
            "common.loading",
            "Loading..."
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-[var(--text)]">

            {t("dashboard.title")}{" "}
            (
            {role === "worker"
              ? t("auth.worker")
              : t("auth.user")}
            )
          </h1>

          <p className="text-[var(--text-soft)] mt-2">

            {t("dashboard.subtitle")}
          </p>

          {/* 📩 SMS NOTICE */}
          <div className="mt-3 text-sm text-[var(--text-muted)]">

            📩 {t("booking.smsNotice")}
          </div>
        </div>

        {/* ✅ DASHBOARD STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* TOTAL */}
          <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-[var(--shadow-soft)]">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t("dashboard.totalBookings")}
            </p>

            <h2 className="text-3xl font-bold text-[var(--text)]">

              {activeBookings.length}
            </h2>
          </div>

          {/* COMPLETED */}
          <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-[var(--shadow-soft)]">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t("dashboard.completedServices")}
            </p>

            <h2 className="text-3xl font-bold text-[var(--success)]">

              {
                completedBookings.length
              }
            </h2>
          </div>

          {/* PENDING REVIEW */}
          <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-[var(--shadow-soft)]">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t("dashboard.pendingReviews")}
            </p>

            <h2 className="text-3xl font-bold text-[var(--primary)]">

              {
                pendingReviews.length
              }
            </h2>
          </div>
        </div>

        {/* ⭐ REVIEW ALERT */}
        {pendingReviews.length >
          0 && (
          <div className="mb-8 rounded-3xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-5">

            <div className="flex items-start gap-3">

              <div className="text-2xl">
                ⭐
              </div>

              <div>

                <h3 className="font-semibold text-[var(--warning)]">

                  {t("dashboard.reviewPending")}
                </h3>

                <p className="text-sm text-[var(--text)] mt-1">

                  {t("dashboard.reviewPendingBody", {
                    count: pendingReviews.length,
                  })}
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
                    ? "bg-[var(--primary)] text-white shadow-[var(--shadow-medium)]"
                    : "bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)]"
                }
              `}
            >
              {t("dashboard.myBookingsCount")}

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
                    ? "bg-[var(--primary)] text-white shadow-[var(--shadow-medium)]"
                    : "bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)]"
                }
              `}
            >
              {t("dashboard.incomingJobsCount")}

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

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 text-center shadow-[var(--shadow-soft)]">

            <div className="text-6xl mb-4">

              📭
            </div>

            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">

              {t("dashboard.noBookingsFound")}
            </h3>

            <p className="text-[var(--text-soft)]">

              {t("dashboard.noBookings")}
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