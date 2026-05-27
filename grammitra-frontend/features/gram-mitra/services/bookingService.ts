import api from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";

// 🔥 CREATE BOOKING
// SECURITY: the backend derives userId from the JWT. We no longer send it
// from the client — that was an IDOR. The local token check below is just
// a UX guard so we don't fire a doomed request when logged out.
export const createBooking = async (
  workerId: string,
  description: string
) => {

  if (!getUserIdFromToken()) {
    throw new Error("User not authenticated");
  }

  try {

    const response = await api.post(
      "/booking",
      { workerId, description }
    );

    return response.data;

  } catch (error: any) {

    console.error(
      "CREATE BOOKING ERROR:",
      error?.response?.data || error.message
    );

    // ✅ SELF BOOKING FRIENDLY ERROR
    if (
      error?.response?.data?.message?.includes(
        "You cannot book yourself"
      )
    ) {
      throw new Error(
        "You cannot book yourself"
      );
    }

    throw error;
  }
};

// 🔥 GET USER BOOKINGS
export const getUserBookings = async () => {

  const userId = getUserIdFromToken();

  if (!userId) return [];

  try {

    const response = await api.get(
      `/booking/my-bookings/${userId}`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];

  } catch (error: any) {

    console.error(
      "USER BOOKINGS ERROR:",
      error?.response?.data || error.message
    );

    return [];
  }
};

// 🔥 GET WORKER BOOKINGS (INCOMING JOBS)
// ✅ IMPORTANT:
// This function MUST receive actual Worker Mongo _id
// NOT auth userId
export const getWorkerBookings = async (
  workerProfileId: string
) => {

  if (!workerProfileId) return [];

  try {

    const response = await api.get(
      `/booking/incoming/${workerProfileId}`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];

  } catch (error: any) {

    console.error(
      "WORKER BOOKINGS ERROR:",
      error?.response?.data || error.message
    );

    return [];
  }
};

// ✅ OPTIONAL CLEAN HELPERS

// 📤 MY BOOKINGS
export const getMyBookings = async () => {

  const userId = getUserIdFromToken();

  if (!userId) return [];

  try {

    const response = await api.get(
      `/booking/my-bookings/${userId}`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];

  } catch (error: any) {

    console.error(
      "MY BOOKINGS ERROR:",
      error?.response?.data || error.message
    );

    return [];
  }
};

// 📥 INCOMING BOOKINGS
// ✅ MUST RECEIVE WORKER PROFILE ID
export const getIncomingBookings = async (
  workerProfileId: string
) => {

  if (!workerProfileId) return [];

  try {

    const response = await api.get(
      `/booking/incoming/${workerProfileId}`
    );

    return Array.isArray(response.data)
      ? response.data
      : [];

  } catch (error: any) {

    console.error(
      "INCOMING BOOKINGS ERROR:",
      error?.response?.data || error.message
    );

    return [];
  }
};

// 🔥 ACCEPT BOOKING
export const acceptBooking = async (
  bookingId: string
) => {

  try {

    const res = await api.put(
      `/booking/${bookingId}/accept`
    );

    return res.data;

  } catch (error: any) {

    console.error(
      "ACCEPT BOOKING ERROR:",
      error?.response?.data || error.message
    );

    throw error;
  }
};

// 🔥 REJECT BOOKING
export const rejectBooking = async (
  bookingId: string
) => {

  try {

    const res = await api.put(
      `/booking/${bookingId}/reject`
    );

    return res.data;

  } catch (error: any) {

    console.error(
      "REJECT BOOKING ERROR:",
      error?.response?.data || error.message
    );

    throw error;
  }
};

// 💰 CREATE RAZORPAY ORDER
export const createOrder = async (
  bookingId: string
) => {

  try {

    const response = await api.post(
      `/booking/create-order/${bookingId}`
    );

    return response.data;

  } catch (error: any) {

    console.error(
      "CREATE ORDER ERROR:",
      error?.response?.data || error.message
    );

    throw error;
  }
};

// 💰 VERIFY PAYMENT
export const verifyPayment = async (
  data: {
    orderId: string;
    paymentId: string;
    signature: string;
  }
) => {

  try {

    const response = await api.post(
      `/booking/verify-payment`,
      data
    );

    return response.data;

  } catch (error: any) {

    console.error(
      "VERIFY PAYMENT ERROR:",
      error?.response?.data || error.message
    );

    throw error;
  }
};

// ✅ MARK BOOKING COMPLETED
export const completeBooking = async (
  bookingId: string
) => {

  if (!bookingId) {
    throw new Error(
      "Invalid booking"
    );
  }

  try {

    const response = await api.put(
      `/booking/${bookingId}/complete`
    );

    return response.data;

  } catch (error: any) {

    console.error(
      "COMPLETE BOOKING ERROR:",
      error?.response?.data ||
      error.message
    );

    throw error;
  }
};