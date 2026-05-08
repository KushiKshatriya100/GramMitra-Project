import api from "@/lib/api";

// 👷 WORKER TYPE
export type ChatWorker = {
  id: string;

  profileImage?: string;

  gender?: string;

  age?: number;

  location?: string;

  latitude?: number;

  longitude?: number;

  phone?: string;

  skills?: string[];

  experience?: number;

  wage?: number;

  availability?: boolean;

  bio?: string;

  rating?: number;

  totalReviews?: number;

  jobsCompleted?: number;

  profileCompletion?: number;

  profileCompleted?: boolean;
};

// 📊 BOOKING TYPE
export type ChatBooking = {
  id?: string;

  userId?: string;

  workerId?: string;

  status?: string;

  paymentStatus?: string;

  amount?: number;

  description?: string;
};

// 🧠 REQUEST TYPE
export type ChatRequest = {
  message: string;
};

// 🤖 RESPONSE TYPE
export type ChatResponse = {
  reply: string;

  intent: string;

  data?: any;

  workers?: ChatWorker[];

  booking?: ChatBooking | null;
};

// ✅ SAFE RESPONSE CREATOR
const createFallbackResponse = (
  intent: string = "ERROR"
): ChatResponse => {

  return {
    reply: "",
    intent,
    data: null,
    workers: [],
    booking: null,
  };
};

// 🧠 MAIN CHAT API
export const sendChatMessage = async (
  message: string
): Promise<ChatResponse> => {

  try {

    // ✅ VALIDATE INPUT
    if (!message || !message.trim()) {

      console.warn("⚠️ Empty chat message");

      return createFallbackResponse("EMPTY");
    }

    const cleanedMessage = message.trim();

    const payload: ChatRequest = {
      message: cleanedMessage,
    };

    console.log("📤 CHAT REQUEST:", payload);

    // ✅ API REQUEST
    const response = await api.post(
      "/chat",
      payload
    );

    const responseData = response?.data;

    console.log("📥 CHAT RESPONSE:", responseData);

    // ✅ SAFE FALLBACK
    if (!responseData) {

      console.warn("⚠️ Empty response from server");

      return createFallbackResponse();
    }

    // ✅ SAFE EXTRACTION
    const intent =
      typeof responseData.intent === "string"
        ? responseData.intent
        : "UNKNOWN";

    const reply =
      typeof responseData.reply === "string"
        ? responseData.reply
        : "";

    const data = responseData.data ?? null;

    // ✅ NORMALIZED RESPONSE
    const normalizedResponse: ChatResponse = {

      reply,

      intent,

      data,

      workers:
        intent === "FIND_WORKER" &&
        Array.isArray(data)
          ? data
          : [],

      booking:
        intent === "CHECK_STATUS"
          ? data
          : null,
    };

    return normalizedResponse;

  } catch (error: any) {

    console.error(
      "❌ CHAT API ERROR:",
      error?.response?.data ||
      error?.message ||
      error
    );

    // 🌐 NETWORK ERROR
    if (!error?.response) {

      console.error("🌐 Network failure detected");

      return createFallbackResponse("NETWORK_ERROR");
    }

    // 🔐 AUTH ERROR
    if (error?.response?.status === 401) {

      console.error("🔐 Unauthorized chat request");

      return createFallbackResponse("UNAUTHORIZED");
    }

    // ❌ SERVER ERROR
    if (error?.response?.status >= 500) {

      console.error("🔥 Server error");

      return createFallbackResponse("SERVER_ERROR");
    }

    return createFallbackResponse();
  }
};