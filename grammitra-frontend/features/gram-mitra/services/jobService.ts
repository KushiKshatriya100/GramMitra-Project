import api from "@/lib/api";

export const getJobById = async (jobId: string) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};