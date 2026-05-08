"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Navbar from "@/components/layout/Navbar";

import Button from "@/components/ui/Button";

import Loader from "@/components/ui/Loader";

import {
  getWorkerById,
} from "@/features/gram-mitra/services/workerService";

import {
  createBooking,
} from "@/features/gram-mitra/services/bookingService";

import {
  getWorkerReviews,
} from "@/features/gram-mitra/services/reviewService";

import {
  getUserIdFromToken,
} from "@/lib/auth";

import toast from "react-hot-toast";

import {
  useTranslation,
} from "@/shared/i18n/useTranslation";

import {
  mapSkillKey,
} from "@/features/gram-mitra/utils/translationMapper";

type Worker = {
  id: string;

  name?: string;

  phone?: string;

  jobsCompleted?: number;

  profileImage?: string;

  skills: string[];

  wage?: number;

  dailyWage?: number;

  availability?: boolean;

  experience?: string | number;

  location?: string;

  rating?: number;

  totalReviews?: number;

  description?: string;

  bio?: string;

  verified?: boolean;
};

type Review = {
  id: string;

  userId?: string;

  rating: number;

  comment?: string;

  feedback?: string;

  createdAt?: string;
};

export default function WorkerDetailsPage() {

  const params = useParams();

  const router = useRouter();

  const workerId =
    params.id as string;

  const { t, lang } =
    useTranslation();

  const [worker, setWorker] =
    useState<Worker | null>(
      null
    );

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    bookingLoading,
    setBookingLoading,
  ] = useState(false);

  useEffect(() => {

    const fetchWorker =
      async () => {

        if (!workerId) return;

        try {

          setLoading(true);

          const [
            workerData,
            reviewData,
          ] = await Promise.all([
            getWorkerById(
              workerId
            ),

            getWorkerReviews(
              workerId
            ),
          ]);

          setWorker(
            workerData
          );

          setReviews(
            reviewData || []
          );

        } catch (error) {

          console.error(
            "Failed to fetch worker",
            error
          );

          toast.error(
            t(
              "worker.loadError"
            ) ||
              "Failed to load worker"
          );

        } finally {

          setLoading(false);
        }
      };

    fetchWorker();

  }, [workerId]);

  if (!lang) return null;

  const handleBooking =
    async () => {

      const userId =
        getUserIdFromToken();

      if (!userId) {

        toast(
          t(
            "auth.loginRequired"
          ),
          {
            icon: "⚠️",
          }
        );

        router.push(
          "/auth/user/login"
        );

        return;
      }

      try {

        setBookingLoading(
          true
        );

        toast.loading(
          t("worker.booking"),
          {
            id: "booking",
          }
        );

        await createBooking(
          workerId,
          `${
            t(
              "worker.bookingRequest"
            )
          } ${
            worker?.skills?.[0] ||
            t(
              "worker.service"
            )
          }`
        );

        toast.success(
          t("worker.success"),
          {
            id: "booking",
          }
        );

      } catch (error: any) {

        console.error(error);

        toast.error(
          error?.message ||
            t(
              "worker.failed"
            ),
          {
            id: "booking",
          }
        );

      } finally {

        setBookingLoading(
          false
        );
      }
    };

  if (loading) {

    return (
      <div className="min-h-screen bg-[var(--bg)]">

        <Navbar />

        <div className="flex items-center justify-center pt-40">

          <Loader />
        </div>
      </div>
    );
  }

  if (!worker) {

    return (
      <div className="min-h-screen bg-[var(--bg)]">

        <Navbar />

        <div className="flex flex-col items-center justify-center pt-40 px-6 text-center">

          <div className="text-6xl mb-4">
            😕
          </div>

          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">

            {t(
              "worker.notFound"
            )}
          </h2>

          <p className="text-[var(--text-soft)]">

            Worker profile could not
            be found.
          </p>
        </div>
      </div>
    );
  }

  const translatedSkills =
    worker.skills?.map(
      (skill) => {

        const key =
          mapSkillKey(
            skill
          );

        const translated =
          t(key);

        return translated ===
          key
          ? skill
          : translated;
      }
    ) || [];

  const workerImage =
    worker.profileImage &&
    worker.profileImage.trim() !==
      ""
      ? worker.profileImage
      : "/images/default-worker.jpg";

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-br from-[#F7EFE5] via-[#F5EFE6] to-[#EFE3D4]">

        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#A0522D_0%,transparent_35%)]" />

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16">

          {/* BACK */}
          <button
            onClick={() =>
              router.back()
            }
            className="mb-8 text-sm font-medium text-[var(--primary)] hover:opacity-80 transition"
          >
            ← {t("common.back")}
          </button>

          <div className="grid lg:grid-cols-[320px_1fr] gap-10 items-start">

            {/* PROFILE IMAGE */}
            <div className="relative">

              <div className="relative h-[360px] w-full overflow-hidden rounded-[32px] shadow-2xl border-4 border-white bg-white">

                <Image
                  src={workerImage}
                  alt={
                    worker.name ||
                    "worker"
                  }
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* ONLINE */}
              {worker.availability && (
                <div className="absolute top-5 right-5 flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 shadow-sm">

                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />

                  <span className="text-xs font-bold text-green-700">

                    {t(
                      "worker.available"
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div>

              {/* VERIFIED */}
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 mb-5">

                ✓ {t("worker.verified")}
              </div>

              {/* NAME */}
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] leading-tight">

                {worker.name ||
                  t(
                    "worker.localWorker"
                  )}
              </h1>

              {/* SKILLS */}
              <div className="flex flex-wrap gap-2 mt-5">

                {translatedSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="
                      rounded-full
                      border border-[var(--border)]
                      bg-white/90
                      px-4 py-2
                      text-sm font-medium
                      text-[var(--primary)]
                      shadow-sm
                    "
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>

              {/* STATS */}
              <div className="flex flex-wrap items-center gap-4 mt-6">

                {/* RATING */}
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm border border-[var(--border)]">

                  <span className="text-yellow-500 text-lg">

                    ★
                  </span>

                  <div>

                    <p className="text-sm font-bold text-[var(--text)]">

                      {worker.rating?.toFixed(
                        1
                      ) || "0.0"}
                    </p>

                    <p className="text-xs text-[var(--text-soft)]">

                      {
                        worker.totalReviews ||
                        0
                      }{" "}
                      {
                        t(
                          "worker.reviews"
                        )
                      }
                    </p>
                  </div>
                </div>

                {/* EXPERIENCE */}
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm border border-[var(--border)]">

                  <span className="text-lg">
                    🛠
                  </span>

                  <div>

                    <p className="text-sm font-bold text-[var(--text)]">

                      {
                        worker.experience ||
                        0
                      }
                      +
                    </p>

                    <p className="text-xs text-[var(--text-soft)]">

                      {t(
                        "worker.experience"
                      )}
                    </p>
                  </div>
                </div>

                {/* PRICE */}
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm border border-[var(--border)]">

                  <span className="text-lg">
                    ₹
                  </span>

                  <div>

                    <p className="text-sm font-bold text-[var(--primary)]">

                      {worker.dailyWage ||
                        worker.wage ||
                        0}
                    </p>

                    <p className="text-xs text-[var(--text-soft)]">

                      {t(
                        "worker.perDay"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* LOCATION */}
              <div className="mt-7 flex items-center gap-3 text-[var(--text-soft)]">

                <span className="text-xl">
                  📍
                </span>

                <p className="text-base">

                  {worker.location ||
                    t(
                      "worker.nearby"
                    )}
                </p>
              </div>

              {/* BIO */}
              <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-white/80 p-6 shadow-sm">

                <h3 className="text-lg font-bold text-[var(--text)] mb-3">

                  About Worker
                </h3>

                <p className="text-[15px] leading-8 text-[var(--text-soft)]">

                  {worker.bio ||
                    worker.description ||
                    `Experienced professional specializing in ${
                      translatedSkills?.[0] ||
                      t(
                        "worker.service"
                      )
                    } services with trusted local expertise.`}
                </p>
              </div>



              {/* CONTACT */}
              <div className="mt-5 flex flex-wrap items-center gap-4">

                <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 border border-[var(--border)] shadow-sm">
                  <span className="text-xl">📞</span>

                  <div>
                    <p className="text-xs text-[var(--text-soft)]">
                      Contact Number
                    </p>

                    <p className="font-semibold text-[var(--text)]">
                      {worker.phone || "Not Available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 border border-[var(--border)] shadow-sm">
                  <span className="text-xl">✅</span>

                  <div>
                    <p className="text-xs text-[var(--text-soft)]">
                      Completed Jobs
                    </p>

                    <p className="font-semibold text-[var(--text)]">
                      {worker.jobsCompleted || 0}
                    </p>
                  </div>
                </div>

              </div>







              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">

                <Button
                  onClick={() =>
                    router.push(
                      "/services"
                    )
                  }
                  variant="secondary"
                  className="sm:w-[180px] h-14 rounded-2xl font-semibold"
                >
                  Browse Services
                </Button>

                <Button
                  onClick={
                    handleBooking
                  }
                  className="flex-1 h-14 rounded-2xl font-semibold text-base shadow-lg hover:scale-[1.01] transition-all"
                  disabled={
                    bookingLoading
                  }
                >
                  {bookingLoading
                    ? t(
                        "worker.booking"
                      )
                    : t(
                        "worker.hire"
                      )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="max-w-6xl mx-auto px-6 py-12">

        {/* INFO CARDS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          {/* WAGE */}
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t("worker.wage")}
            </p>

            <h3 className="text-2xl font-bold text-[var(--primary)]">

              ₹{" "}
              {worker.dailyWage ||
                worker.wage ||
                t(
                  "common.na"
                )}
            </h3>

            <p className="text-sm text-[var(--text-soft)] mt-1">

              {t("worker.perDay")}
            </p>
          </div>

          {/* EXPERIENCE */}
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t(
                "worker.experience"
              )}
            </p>

            <h3 className="text-2xl font-bold text-[var(--text)]">

              {worker.experience ||
                t(
                  "common.na"
                )}
            </h3>

            <p className="text-sm text-[var(--text-soft)] mt-1">

              Years Experience
            </p>
          </div>

          {/* AVAILABILITY */}
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t(
                "worker.availability"
              )}
            </p>

            <h3
              className={`text-2xl font-bold ${
                worker.availability
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {worker.availability
                ? t(
                    "worker.available"
                  )
                : t(
                    "worker.busy"
                  )}
            </h3>

            <p className="text-sm text-[var(--text-soft)] mt-1">

              Current Status
            </p>
          </div>

          {/* TOTAL REVIEWS */}
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              Total Reviews
            </p>

            <h3 className="text-2xl font-bold text-yellow-500">

              {
                worker.totalReviews ||
                0
              }
            </h3>

            <p className="text-sm text-[var(--text-soft)] mt-1">

              Customer Ratings
            </p>
          </div>
        </div>

        {/* ⭐ REVIEWS SECTION */}
        <div className="rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-2xl font-bold text-[var(--text)]">

                Customer Reviews
              </h2>

              <p className="text-[var(--text-soft)] mt-1">

                Real feedback from
                verified customers
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-50 px-5 py-3 border border-yellow-100">

              <div className="flex items-center gap-2">

                <span className="text-yellow-500 text-xl">

                  ★
                </span>

                <span className="text-xl font-bold text-[var(--text)]">

                  {worker.rating?.toFixed(
                    1
                  ) || "0.0"}
                </span>
              </div>
            </div>
          </div>

          {/* EMPTY */}
          {reviews.length ===
            0 && (

            <div className="rounded-3xl bg-[var(--bg)] p-10 text-center">

              <div className="text-5xl mb-4">
                ⭐
              </div>

              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">

                No Reviews Yet
              </h3>

              <p className="text-[var(--text-soft)]">

                This worker has not
                received reviews yet.
              </p>
            </div>
          )}

          {/* REVIEW LIST */}
          {reviews.length >
            0 && (

            <div className="space-y-5">

              {reviews.map(
                (review) => (

                  <div
                    key={review.id}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-6"
                  >

                    {/* TOP */}
                    <div className="flex items-center justify-between mb-4">

                      {/* USER */}
                      <div className="flex items-center gap-3">

                        <div className="h-12 w-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">

                          {(review.userId ||
                            "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <h4 className="font-semibold text-[var(--text)]">

                            Customer
                          </h4>

                          <p className="text-xs text-[var(--text-soft)]">

                            Verified Booking
                          </p>
                        </div>
                      </div>

                      {/* STARS */}
                      <div className="flex items-center gap-1">

                        {[
                          1, 2, 3, 4,
                          5,
                        ].map((star) => (

                          <span
                            key={star}
                            className={`text-xl ${
                              star <=
                              review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* COMMENT */}
                    <p className="text-[15px] leading-7 text-[var(--text-soft)]">

                      {review.comment ||
                        review.feedback ||
                        "Great service experience"}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}