"use client";

import {
  acceptBooking,
  rejectBooking,
  completeBooking,
  createOrder,
  verifyPayment,
} from "@/features/gram-mitra/services/bookingService";

import {
  createReview,
} from "@/features/gram-mitra/services/reviewService";

import { useState } from "react";

import { useTranslation } from "@/shared/i18n/useTranslation";

import {
  mapStatusKey,
  mapDescriptionKey,
} from "@/features/gram-mitra/utils/translationMapper";

import toast from "react-hot-toast";

type Booking = {
  id: string;

  workerId?: string;

  userId?: string;

  description: string;

  status:
    | "PENDING"
    | "PAID"
    | "ACCEPTED"
    | "REJECTED"
    | "COMPLETED";

  paymentStatus?: "PENDING" | "PAID" | "FAILED";

  amount?: number;

  reviewSubmitted?: boolean;
};

export default function BookingCard({
  booking,
  role,
  onAction,
}: {
  booking: Booking;
  role: string;
  onAction: () => void;
}) {

  const { t, lang } = useTranslation();

  const [loading, setLoading] =
    useState(false);

  // ⭐ REVIEW STATES
  const [showReviewBox, setShowReviewBox] =
    useState(false);

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  if (!lang) return null;

  // 🔐 SAFE TRANSLATION
  const translate = (
    key: string,
    fallback: string
  ) => {

    const value = t(key);

    return value === key
      ? fallback
      : value;
  };

  const statusKey =
    mapStatusKey(booking.status);

  const descKey =
    mapDescriptionKey(
      booking.description
    );

  // 🔹 LOAD RAZORPAY
  const loadRazorpay = () => {

    return new Promise<boolean>(
      (resolve) => {

        if (
          (window as any).Razorpay
        ) {
          return resolve(true);
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () =>
          resolve(true);

        script.onerror = () =>
          resolve(false);

        document.body.appendChild(
          script
        );
      }
    );
  };

  // 💳 PAYMENT
  const handlePayment = async () => {

    try {

      setLoading(true);

      const isLoaded =
        await loadRazorpay();

      if (!isLoaded) {

        toast.error(
          translate(
            "payment.sdkFailed",
            "Payment system failed to load"
          )
        );

        return;
      }

      const order =
        await createOrder(
          booking.id
        );

      const options: any = {

        key: order.key,

        amount: order.amount,

        currency:
          order.currency,

        name: "GramMitra",

        description:
          translate(
            "payment.description",
            "Service Booking Payment"
          ),

        order_id:
          order.orderId,

        handler:
          async function (
            response: any
          ) {

            try {

              await verifyPayment({
                orderId:
                  response.razorpay_order_id,

                paymentId:
                  response.razorpay_payment_id,

                signature:
                  response.razorpay_signature,
              });

              toast.success(
                translate(
                  "booking.paymentSuccess",
                  "Payment successful"
                )
              );

              onAction();

            } catch (err) {

              console.error(
                "VERIFY ERROR:",
                err
              );

              toast.error(
                translate(
                  "booking.paymentFailed",
                  "Payment verification failed"
                )
              );
            }
          },

        modal: {
          ondismiss: () => {

            toast.error(
              translate(
                "payment.cancelled",
                "Payment cancelled"
              )
            );
          },
        },

        theme: {
          color: "#A35231",
        },
      };

      const paymentObject =
        new (window as any).Razorpay(
          options
        );

      paymentObject.open();

    } catch (error: any) {

      console.error(
        "PAYMENT ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        translate(
          "booking.paymentFailed",
          "Payment failed"
        )
      );

    } finally {

      setLoading(false);
    }
  };

  // ✅ ACCEPT
  const handleAccept =
    async () => {

      try {

        setLoading(true);

        await acceptBooking(
          booking.id
        );

        toast.success(
          translate(
            "booking.acceptSuccess",
            "Booking accepted"
          )
        );

        onAction();

      } catch {

        toast.error(
          translate(
            "booking.acceptFailed",
            "Failed to accept booking"
          )
        );

      } finally {

        setLoading(false);
      }
    };

  // ❌ REJECT
  const handleReject =
    async () => {

      try {

        setLoading(true);

        await rejectBooking(
          booking.id
        );

        toast.success(
          translate(
            "booking.rejectSuccess",
            "Booking rejected"
          )
        );

        onAction();

      } catch {

        toast.error(
          translate(
            "booking.rejectFailed",
            "Failed to reject booking"
          )
        );

      } finally {

        setLoading(false);
      }
    };

  // ✅ MARK COMPLETED
  const handleComplete =
    async () => {

      try {

        setLoading(true);

        await completeBooking(
          booking.id
        );

        toast.success(
          "Booking marked as completed"
        );

        onAction();

      } catch {

        toast.error(
          "Failed to complete booking"
        );

      } finally {

        setLoading(false);
      }
    };




  // ⭐ SUBMIT REVIEW
  const handleSubmitReview =
    async () => {

      if (!comment.trim()) {

        toast.error(
          "Please write review"
        );

        return;
      }

      try {

        setLoading(true);

        await createReview(
          booking.id,
          rating,
          comment
        );

        toast.success(
          "Review submitted successfully"
        );

        setShowReviewBox(false);

        setComment("");

        onAction();

      } catch (error: any) {

        toast.error(
          error?.message ||
            "Failed to submit review"
        );

      } finally {

        setLoading(false);
      }
    };

  // 🎨 STATUS COLORS
  const statusStyles =
    booking.status ===
    "PENDING"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : booking.status ===
        "PAID"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : booking.status ===
        "ACCEPTED"
      ? "bg-green-50 text-green-700 border-green-200"
      : booking.status ===
        "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <div
      className="
      rounded-3xl
      border border-[var(--border)]
      bg-white
      p-6
      shadow-sm
      transition-all duration-300
      hover:shadow-lg
      "
    >

      {/* TOP */}
      <div className="flex items-start justify-between gap-4">

        {/* LEFT */}
        <div className="flex-1">

          {/* TYPE */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--text-soft)]">

            {role === "worker"
              ? "📥 Incoming Job"
              : "📤 My Booking"}
          </div>

          {/* DESCRIPTION */}
          <h3 className="text-lg font-semibold text-[var(--text)] leading-relaxed">

            {descKey
              ? translate(
                  descKey,
                  booking.description
                )
              : booking.description}
          </h3>

          {/* META */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--text-soft)]">

            {/* STATUS */}
            <div
              className={`
                inline-flex items-center gap-2
                rounded-full border px-3 py-1
                font-medium
                ${statusStyles}
              `}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />

              {statusKey
                ? translate(
                    statusKey,
                    booking.status
                  )
                : booking.status}
            </div>

            {/* PAYMENT */}
            {booking.paymentStatus && (
              <div className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">

                💳 {booking.paymentStatus}
              </div>
            )}

            {/* AMOUNT */}
            {booking.amount !==
              undefined && (
              <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#A35231]">

                ₹ {booking.amount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6">

        {/* 💳 USER PAYMENT */}
        {role === "user" &&
          booking.status ===
            "PENDING" && (
            <button
              onClick={
                handlePayment
              }
              disabled={loading}
              className="
                h-11 rounded-xl
                bg-[var(--primary)]
                px-5 text-sm font-semibold
                text-white transition
                hover:opacity-90
                disabled:opacity-50
              "
            >
              {loading
                ? translate(
                    "common.loading",
                    "Loading..."
                  )
                : translate(
                    "payment.payNow",
                    "Pay Now"
                  )}
            </button>
          )}

        {/* 👷 WORKER ACTIONS */}
        {role === "worker" &&
          booking.status ===
            "PENDING" && (
            <div className="flex flex-wrap gap-3">

              {/* ACCEPT */}
              <button
                onClick={
                  handleAccept
                }
                disabled={loading}
                className="
                  h-11 rounded-xl
                  bg-[var(--primary)]
                  px-5 text-sm font-semibold
                  text-white transition
                  hover:opacity-90
                  disabled:opacity-50
                "
              >
                {loading
                  ? translate(
                      "common.loading",
                      "Loading..."
                    )
                  : translate(
                      "booking.accept",
                      "Accept"
                    )}
              </button>

              {/* REJECT */}
              <button
                onClick={
                  handleReject
                }
                disabled={loading}
                className="
                  h-11 rounded-xl
                  bg-red-500 px-5
                  text-sm font-semibold
                  text-white transition
                  hover:opacity-90
                  disabled:opacity-50
                "
              >
                {translate(
                  "booking.reject",
                  "Reject"
                )}
              </button>
            </div>
          )}

        {/* ✅ PAID */}
        {booking.status === "PAID" && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 border border-green-100">

            ✅ Payment completed
          </div>
        )}

        {/* ✅ ACCEPTED */}
        {booking.status === "ACCEPTED" && (
          <div className="space-y-4">

            <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 border border-green-100">

              ✅ Booking is active
            </div>

            {/* ✅ USER CAN COMPLETE */}
            {role === "user" && (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="
                  h-11 rounded-xl
                  bg-emerald-600
                  px-5 text-sm font-semibold
                  text-white transition
                  hover:opacity-90
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Loading..."
                  : "Mark Completed"}
              </button>
            )}
          </div>
        )}

        {/* ⭐ COMPLETED */}
        {booking.status ===
          "COMPLETED" && (
          <div className="space-y-4">

            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-100">

              ✅ Service completed successfully
            </div>

            {/* REVIEW BUTTON */}
            {!booking.reviewSubmitted && (
              <button
                onClick={() =>
                  setShowReviewBox(
                    !showReviewBox
                  )
                }
                className="
                  h-11 rounded-xl
                  bg-[var(--primary)]
                  px-5 text-sm font-semibold
                  text-white transition
                  hover:opacity-90
                "
              >
                ⭐ Give Review
              </button>
            )}

            {/* REVIEW BOX */}
            {showReviewBox && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

                {/* RATING */}
                <div className="mb-4">

                  <p className="mb-2 text-sm font-medium text-[var(--text)]">

                    Rating
                  </p>

                  <div className="flex gap-2">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setRating(
                              star
                            )
                          }
                          className={`text-3xl transition ${
                            rating >=
                            star
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* COMMENT */}
                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Write your experience..."
                  className="
                    w-full rounded-2xl
                    border border-[var(--border)]
                    bg-white px-4 py-3
                    text-sm outline-none
                    focus:border-[var(--primary)]
                  "
                />

                {/* SUBMIT */}
                <button
                  onClick={
                    handleSubmitReview
                  }
                  disabled={loading}
                  className="
                    mt-4 h-11 rounded-xl
                    bg-[var(--primary)]
                    px-5 text-sm font-semibold
                    text-white transition
                    hover:opacity-90
                    disabled:opacity-50
                  "
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              </div>
            )}

            {/* REVIEW ALREADY SUBMITTED */}
            {booking.reviewSubmitted && (
              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 border border-blue-100">

                ⭐ Review already submitted
              </div>
            )}
          </div>
        )}

        {/* ❌ REJECTED */}
        {booking.status ===
          "REJECTED" && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-100">

            ❌ Booking was rejected
          </div>
        )}
      </div>
    </div>
  );
}