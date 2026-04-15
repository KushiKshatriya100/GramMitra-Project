import api from "@/lib/api";

export const addReview = async (
  jobId: string,
  rating: number,
  feedback: string
) => {
  try {
    const response = await api.post("/reviews/add", null, {
      params: {
        jobId,
        rating,
        feedback,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Review failed:", error);
    throw error;
  }
};