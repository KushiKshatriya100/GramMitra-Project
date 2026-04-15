// lib/auth.ts

// ✅ Save token
export const saveToken = (token: string) => {
  try {
    if (typeof window !== "undefined") {
      console.log("💾 Saving token:", token);

      // ❗ Ensure clean token (no quotes/spaces)
      const cleanToken = token.replace(/^"|"$/g, "").trim();

      localStorage.setItem("token", cleanToken);
    }
  } catch (error) {
    console.error("❌ Error saving token:", error);
  }
};

// ✅ Get token
export const getToken = () => {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      console.log("🔐 Retrieved token:", token);

      return token;
    }
    return null;
  } catch (error) {
    console.error("❌ Error getting token:", error);
    return null;
  }
};

// ✅ Remove token (logout)
export const removeToken = () => {
  try {
    if (typeof window !== "undefined") {
      console.log("🧹 Removing token");
      localStorage.removeItem("token");
    }
  } catch (error) {
    console.error("❌ Error removing token:", error);
  }
};

// ✅ Decode full JWT payload (🔥 IMPORTANT for debugging)
export const getTokenPayload = () => {
  try {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));

    console.log("📦 Token payload:", payload);

    return payload;
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return null;
  }
};

// ✅ Get userId from token
export const getUserIdFromToken = () => {
  try {
    const payload = getTokenPayload();
    return payload?.sub || payload?.userId || null;
  } catch (error) {
    return null;
  }
};

// ✅ Get role from token (🔥 VERY IMPORTANT for your 403 issue)
export const getUserRoleFromToken = () => {
  try {
    const payload = getTokenPayload();
    return payload?.role || payload?.authorities || null;
  } catch (error) {
    return null;
  }
};