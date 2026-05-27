import api from "@/lib/api";

export type Review = {
  id: string;

  bookingId?: string;

  jobId?: string;

  workerId: string;

  userId?: string;

  rating: number;

  comment?: string;

  feedback?: string;

  createdAt?: string;
};

// ✅ CREATE REVIEW
// Body-encoded request. The reviewer (userId) is derived from the JWT on
// the server — we never send it from the client.
export const createReview = async (
  bookingId: string,
  rating: number,
  comment: string
) => {

  if (!bookingId) {
    throw new Error("Invalid booking");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (!comment?.trim()) {
    throw new Error("Review comment required");
  }

  try {
    const response = await api.post("/review", {
      bookingId,
      rating,
      comment: comment.trim(),
    });

    return response.data;

  } catch (error: any) {

    console.error(
      "REVIEW ERROR:",
      error?.response?.data || error.message
    );

    const status: number = error?.response?.status ?? 0;
    const serverMessage: string =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "";

    // Map the backend's status semantics to user-facing copy. The status
    // codes here are the ones ReviewService now emits via
    // ResponseStatusException — they're stable, the strings are not.
    if (status === 403) {
      throw new Error("Only the booking's customer can review it");
    }
    if (status === 409) {
      if (/already/i.test(serverMessage)) {
        throw new Error("A review has already been submitted for this booking");
      }
      if (/completed/i.test(serverMessage)) {
        throw new Error("Booking must be completed before it can be reviewed");
      }
      throw new Error(serverMessage || "Review cannot be submitted in the current state");
    }
    if (status === 404) {
      throw new Error("Booking not found");
    }

    throw new Error(serverMessage || "Failed to submit review");
  }
};

// ✅ GET WORKER REVIEWS
export const getWorkerReviews = async (
  workerId: string
): Promise<Review[]> => {

  if (!workerId) return [];

  try {

    const response = await api.get(
      `/review/worker/${workerId}`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];

  } catch (error: any) {

    console.error(
      "GET REVIEWS ERROR:",
      error?.response?.data || error.message
    );

    return [];
  }
};