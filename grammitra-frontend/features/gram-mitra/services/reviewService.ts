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
export const createReview = async (
  bookingId: string,
  rating: number,
  comment: string
) => {

  // ✅ BASIC VALIDATION
  if (!bookingId) {
    throw new Error("Invalid booking");
  }

  if (rating < 1 || rating > 5) {
    throw new Error(
      "Rating must be between 1 and 5"
    );
  }

  if (!comment?.trim()) {
    throw new Error(
      "Review comment required"
    );
  }

  try {

    const response = await api.post(
      "/review",
      null,
      {
        params: {
          bookingId,
          rating,
          comment: comment.trim(),
        },
      }
    );

    return response.data;

  } catch (error: any) {

    console.error(
      "REVIEW ERROR:",
      error?.response?.data || error.message
    );

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "";

    // ✅ FRIENDLY ERRORS
    if (
      message.includes(
        "Review already submitted"
      )
    ) {

      throw new Error(
        "Review already submitted"
      );
    }

    if (
      message.includes(
        "Booking not completed yet"
      )
    ) {

      throw new Error(
        "Booking not completed yet"
      );
    }

    if (
      message.includes(
        "Only booking owner can add review"
      )
    ) {

      throw new Error(
        "Only booking owner can review"
      );
    }

    if (
      message.includes(
        "Booking not found"
      )
    ) {

      throw new Error(
        "Booking not found"
      );
    }

    throw new Error(
      "Failed to submit review"
    );
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