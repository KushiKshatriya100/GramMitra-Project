import api from "@/lib/api";
import { Worker } from "../types/Worker";

const normalizeSkill = (
  skill: string
): string => {

  return skill
    ?.trim()
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
};

// 🔥 SEARCH WORKERS BY SKILL
export const getWorkersBySkill = async (
  skill: string
): Promise<Worker[]> => {

  const cleanSkill =
    normalizeSkill(skill);

  if (!cleanSkill) return [];

  try {

    const res = await api.get(
      "/worker/search",
      {
        params: {
          skill: cleanSkill,
        },
      }
    );

    const data: Worker[] =
      Array.isArray(res.data)
        ? res.data
        : [];

    // ✅ SORT BEST WORKERS FIRST
    return data.sort((a, b) => {

      const scoreA =
        (a.rating ?? 0) +
        (a.experience ?? 0);

      const scoreB =
        (b.rating ?? 0) +
        (b.experience ?? 0);

      return scoreB - scoreA;
    });

  } catch (error: any) {

    console.error(
      "SEARCH ERROR:",
      error?.response?.data ||
        error.message
    );

    return [];
  }
};

// 🔥 GET NEARBY WORKERS
export const getNearbyWorkers = async (
  lat: number,
  lng: number,
  skill: string
): Promise<Worker[]> => {

  const cleanSkill =
    normalizeSkill(skill);

  if (
    !cleanSkill ||
    lat == null ||
    lng == null
  ) {
    return [];
  }

  try {

    const res = await api.get(
      "/worker/nearby",
      {
        params: {
          lat,
          lng,
          skill: cleanSkill,
        },
      }
    );

    return Array.isArray(res.data)
      ? res.data
      : [];

  } catch (error: any) {

    console.error(
      "NEARBY WORKERS ERROR:",
      error?.response?.data ||
        error.message
    );

    return [];
  }
};

// 🔥 GET WORKER BY ID
export const getWorkerById = async (
  id: string
): Promise<Worker | null> => {

  if (!id) return null;

  try {

    const res = await api.get(
      `/worker/${id}`
    );

    return res.data ?? null;

  } catch (error: any) {

    console.error(
      "GET WORKER ERROR:",
      error?.response?.data ||
        error.message
    );

    return null;
  }
};

// 🔥 GET CURRENT WORKER PROFILE
// ✅ IMPORTANT:
// Returns actual Worker Mongo document
// including worker.id
export const getMyProfile = async (): Promise<Worker | null> => {

  try {

    const res = await api.get(
      "/worker/me"
    );

    const data =
      res.data ?? null;

    // ✅ SAFE DEBUG
    if (data?.id) {

      console.log(
        "✅ Worker Profile Loaded:",
        {
          workerId: data.id,
          userId: data.userId,
        }
      );
    }

    return data;

  } catch (error: any) {

    console.error(
      "PROFILE ERROR:",
      error?.response?.data ||
        error.message
    );

    return null;
  }
};

// 🔥 CREATE / UPDATE WORKER PROFILE
export const updateProfile = async (
  data: Partial<Worker>
): Promise<Worker> => {

  if (!data) {
    throw new Error(
      "Invalid profile data"
    );
  }

  // ✅ CLEAN PAYLOAD
  const payload = {
    ...data,

    // ALWAYS SAFE STRING
    phone: (
      data.phone ?? ""
    )
      .toString()
      .trim(),
  };

  // ✅ DEBUG
  console.log(
    "🚀 Worker API Payload:",
    {
      phone: payload.phone,
      location: payload.location,
      skills: payload.skills,
      workerId: payload.id,
    }
  );

  // ⚠️ WARNING ONLY
  if (!payload.phone) {

    console.warn(
      "⚠️ Phone missing in API payload"
    );
  }

  try {

    const res = await api.post(
      "/worker/create-or-update",
      payload
    );

    return res.data;

  } catch (error: any) {

    console.error(
      "UPDATE PROFILE ERROR:",
      error?.response?.data ||
        error.message
    );

    throw error;
  }
};