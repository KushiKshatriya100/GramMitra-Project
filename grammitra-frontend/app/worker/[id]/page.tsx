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
  isAuthenticated,
  clearSession,
} from "@/lib/auth";

import toast from "react-hot-toast";

import {
  useTranslation,
} from "@/shared/i18n/useTranslation";

import {
  mapSkillKey,
} from "@/features/gram-mitra/utils/translationMapper";

import { useReverseGeocode } from "@/shared/geo/useReverseGeocode";
import { parseCoords } from "@/shared/geo/reverseGeocode";

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

  latitude?: number;

  longitude?: number;

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

  // ⚠️ Rules of Hooks: this hook MUST run on every render, before any
  // conditional return below. The hook itself no-ops when coords are
  // undefined/invalid, so calling it pre-worker-load is safe.
  //
  // A worker's `location` is a free-text field, but in practice it sometimes
  // contains raw "lat, lng" instead of a place name. Detect that here so we
  // can geocode those values rather than displaying the numbers verbatim.
  const locationCoordsEarly = parseCoords(worker?.location);
  const latEarly =
    typeof worker?.latitude === "number" && worker.latitude !== 0
      ? worker.latitude
      : locationCoordsEarly?.lat;
  const lngEarly =
    typeof worker?.longitude === "number" && worker.longitude !== 0
      ? worker.longitude
      : locationCoordsEarly?.lng;

  // "Typed location" means a human-readable string — NOT a coord pair.
  const hasTypedLocationEarly =
    !!worker?.location?.trim() && !locationCoordsEarly;
  const hasCoordsEarly =
    typeof latEarly === "number" &&
    typeof lngEarly === "number" &&
    !(latEarly === 0 && lngEarly === 0);

  const geocode = useReverseGeocode(latEarly, lngEarly, {
    enabled: hasCoordsEarly && !hasTypedLocationEarly,
    lang: lang === "hi" ? "hi" : "en",
  });

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

          toast.error(t("worker.loadError"));

        } finally {

          setLoading(false);
        }
      };

    fetchWorker();

  }, [workerId]);

  if (!lang) return null;

  const handleBooking =
    async () => {

      // Single gate: must have a live session blob (loginId + non-expired
      // exp) before booking. Without this, an expired session would fire
      // a doomed POST, hit a 401, and leave the user staring at a toast.
      if (!isAuthenticated()) {
        clearSession();
        toast(
          t("auth.loginRequired"),
          { icon: "⚠️" }
        );
        router.push("/auth/user/login");
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        // Defensive — token said valid but no usable sub claim.
        router.push("/auth/user/login");
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

            {t("worker.notFoundMessage")}
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

  // Display values derived from the geocode hook lifted to the top of the
  // component. By this point `worker` is guaranteed non-null (early returns
  // above), so these reads are safe.
  const locationCoords = parseCoords(worker.location);
  const lat =
    typeof worker.latitude === "number" && worker.latitude !== 0
      ? worker.latitude
      : locationCoords?.lat;
  const lng =
    typeof worker.longitude === "number" && worker.longitude !== 0
      ? worker.longitude
      : locationCoords?.lng;

  const hasTypedLocation =
    !!worker.location?.trim() && !locationCoords;
  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    !(lat === 0 && lng === 0);

  const resolvedLocation = hasTypedLocation
    ? worker.location!.trim()
    : geocode.status === "ready"
      ? geocode.address.label
      : null;

  const resolvedDetail =
    !hasTypedLocation && geocode.status === "ready"
      ? geocode.address.detail
      : null;

  const mapUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : null;

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
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-soft)]">

        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_35%)]" />

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

              <div className="relative h-[360px] w-full overflow-hidden rounded-[32px] shadow-[var(--shadow-medium)] border-4 border-[var(--card)] bg-[var(--card)]">

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
                <div className="absolute top-5 right-5 flex items-center gap-2 rounded-full bg-[var(--success-soft)] px-4 py-2 shadow-[var(--shadow-soft)] border border-[var(--success)]/30">

                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)] animate-pulse" />

                  <span className="text-xs font-bold text-[var(--success)]">

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
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--success-soft)] px-4 py-2 text-sm font-semibold text-[var(--success)] mb-5 border border-[var(--success)]/30">

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
                      bg-[var(--card)]/90
                      px-4 py-2
                      text-sm font-medium
                      text-[var(--primary)]
                      shadow-[var(--shadow-soft)]
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
                <div className="flex items-center gap-2 rounded-2xl bg-[var(--card)] px-4 py-3 shadow-[var(--shadow-soft)] border border-[var(--border)]">

                  <span className="text-[var(--warning)] text-lg">

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
                <div className="flex items-center gap-2 rounded-2xl bg-[var(--card)] px-4 py-3 shadow-[var(--shadow-soft)] border border-[var(--border)]">

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
                <div className="flex items-center gap-2 rounded-2xl bg-[var(--card)] px-4 py-3 shadow-[var(--shadow-soft)] border border-[var(--border)]">

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
              <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--text-soft)]">

                <span className="text-xl leading-none" aria-hidden>📍</span>

                <div className="flex flex-col leading-tight">
                  {geocode.status === "loading" && !resolvedLocation ? (
                    <span
                      className="text-base inline-block h-4 w-44 rounded bg-[var(--bg-soft)] animate-pulse"
                      aria-label={t("worker.locating")}
                    />
                  ) : (
                    <p className="text-base text-[var(--text)] font-medium">
                      {resolvedLocation || t("worker.nearby")}
                    </p>
                  )}
                  {resolvedDetail && (
                    <p className="text-xs text-[var(--text-muted)]">
                      {resolvedDetail}
                    </p>
                  )}
                </div>

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      text-xs font-semibold text-[var(--primary)]
                      hover:underline whitespace-nowrap
                    "
                  >
                    {t("worker.viewOnMap")} →
                  </a>
                )}
              </div>

              {/* BIO */}
              <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-[var(--card)]/80 p-6 shadow-[var(--shadow-soft)]">

                <h3 className="text-lg font-bold text-[var(--text)] mb-3">

                  {t("worker.aboutWorker")}
                </h3>

                <p className="text-[15px] leading-8 text-[var(--text-soft)]">

                  {worker.bio ||
                    worker.description ||
                    t("worker.defaultBio", {
                      skill: translatedSkills?.[0] || t("worker.service"),
                    })}
                </p>
              </div>



              {/* CONTACT */}
              <div className="mt-5 flex flex-wrap items-center gap-4">

                {(() => {
                  const phone = worker.phone?.trim();
                  const telHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;
                  const card = (
                    <>
                      <span className="text-xl" aria-hidden>📞</span>
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-soft)]">
                          {t("worker.contactNumber")}
                        </p>
                        <p className="font-semibold text-[var(--text)] truncate">
                          {phone || t("worker.notAvailable")}
                        </p>
                      </div>
                      {telHref && (
                        <span className="ml-2 hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                          {t("worker.callWorker")} →
                        </span>
                      )}
                    </>
                  );
                  return telHref ? (
                    <a
                      href={telHref}
                      aria-label={`${t("worker.callWorker")} ${phone}`}
                      className="
                        group flex items-center gap-3 rounded-2xl
                        bg-[var(--card)] px-5 py-4
                        border border-[var(--border)]
                        shadow-[var(--shadow-soft)]
                        hover:shadow-[var(--shadow-medium)] hover:border-[var(--primary)]
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60
                        transition
                      "
                    >
                      {card}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl bg-[var(--card)] px-5 py-4 border border-[var(--border)] shadow-[var(--shadow-soft)]">
                      {card}
                    </div>
                  );
                })()}

                <div className="flex items-center gap-3 rounded-2xl bg-[var(--card)] px-5 py-4 border border-[var(--border)] shadow-[var(--shadow-soft)]">
                  <span className="text-xl" aria-hidden>✅</span>

                  <div>
                    <p className="text-xs text-[var(--text-soft)]">
                      {t("worker.completedJobs")}
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
                  {t("worker.browseServices")}
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
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">

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
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">

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

              {t("worker.yearsExperienceLabel")}
            </p>
          </div>

          {/* AVAILABILITY */}
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t(
                "worker.availability"
              )}
            </p>

            <h3
              className={`text-2xl font-bold ${
                worker.availability
                  ? "text-[var(--success)]"
                  : "text-[var(--danger)]"
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

              {t("worker.currentStatus")}
            </p>
          </div>

          {/* TOTAL REVIEWS */}
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">

            <p className="text-sm text-[var(--text-soft)] mb-2">

              {t("worker.totalReviewsLabel")}
            </p>

            <h3 className="text-2xl font-bold text-[var(--warning)]">

              {
                worker.totalReviews ||
                0
              }
            </h3>

            <p className="text-sm text-[var(--text-soft)] mt-1">

              {t("worker.customerRatings")}
            </p>
          </div>
        </div>

        {/* ⭐ REVIEWS SECTION */}
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-soft)]">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-2xl font-bold text-[var(--text)]">

                {t("worker.customerReviews")}
              </h2>

              <p className="text-[var(--text-soft)] mt-1">

                {t("worker.verifiedFeedback")}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--warning-soft)] px-5 py-3 border border-[var(--warning)]/30">

              <div className="flex items-center gap-2">

                <span className="text-[var(--warning)] text-xl">

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

                {t("worker.noReviews")}
              </h3>

              <p className="text-[var(--text-soft)]">

                {t("worker.noReviewsSubtitle")}
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

                            {t("worker.customer")}
                          </h4>

                          <p className="text-xs text-[var(--text-soft)]">

                            {t("worker.verifiedBooking")}
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
                                ? "text-[var(--warning)]"
                                : "text-[var(--border)]"
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