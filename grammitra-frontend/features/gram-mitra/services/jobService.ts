import api from "@/lib/api";

export const getJobById = async (jobId: string) => {
  if (!jobId) return null;

  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data ?? null;
  } catch (error: any) {
    console.error("JOB FETCH ERROR:", error?.response?.data || error.message);
    return null;
  }
};