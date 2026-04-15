import api from "@/lib/api";

// 🔍 Get workers by skill
export const getWorkersBySkill = async (skill: string) => {
  try {
    const response = await api.get("/worker/search", {
      params: { skill },
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error("❌ Error fetching workers:", error?.message);
    return [];
  }
};

// 👤 Get single worker by ID
export const getWorkerById = async (id: string) => {
  try {
    const response = await api.get(`/worker/${id}`);
    return response.data || null;
  } catch (error: any) {
    console.error("❌ Error fetching worker:", error?.message);
    return null;
  }
};