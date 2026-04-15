import api from "@/lib/api";
import { getToken, getUserIdFromToken } from "@/lib/auth";

// ✅ Auth header
const getAuthHeader = () => {
  const token = getToken();

  console.log("🔐 TOKEN:", token);

  if (!token) {
    console.warn("⚠️ No token found");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// 🔥 CREATE BOOKING
export const createBooking = async (
  workerId: string,
  description: string
) => {
  try {
    const userId = getUserIdFromToken();

    const response = await api.post(
      `/booking?userId=${userId}&workerId=${workerId}&description=${description}`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Booking failed:", error?.response || error);
    throw error;
  }
};

// 🔥 GET USER BOOKINGS (🔥 FIXED HERE)
export const getUserBookings = async () => {
  try {
    const userId = getUserIdFromToken();

    console.log("👤 USER ID:", userId);

    if (!userId) {
      console.warn("No userId found");
      return [];
    }

    const response = await api.get(`/booking/user/${userId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching bookings:", error?.response || error);

    // ❌ only logout on 401 (not 403)
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/user/login";
    }

    return [];
  }
};

// 🔥 GET WORKER BOOKINGS
export const getWorkerBookings = async (workerId: string) => {
  try {
    const response = await api.get(`/booking/worker/${workerId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching worker bookings:", error?.response || error);
    return [];
  }
};

// 🔥 ACCEPT BOOKING
export const acceptBooking = async (bookingId: string) => {
  try {
    const response = await api.put(
      `/booking/${bookingId}/accept`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Accept failed:", error?.response || error);
    throw error;
  }
};

// 🔥 REJECT BOOKING
export const rejectBooking = async (bookingId: string) => {
  try {
    const response = await api.put(
      `/booking/${bookingId}/reject`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Reject failed:", error?.response || error);
    throw error;
  }
};