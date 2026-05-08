// lib/auth.ts

// 🔥 Safe check
const isBrowser = typeof window !== "undefined";

// ✅ Save token
export const saveToken = (token: string) => {
  try {
    if (!isBrowser) return;

    const cleanToken = token.replace(/^"|"$/g, "").trim();

    localStorage.setItem("token", cleanToken);
  } catch (error) {
    console.error("❌ Error saving token:", error);
  }
};

// ✅ Get token
export const getToken = () => {
  try {
    if (!isBrowser) return null;
    return localStorage.getItem("token");
  } catch (error) {
    console.error("❌ Error getting token:", error);
    return null;
  }
};

// ✅ Remove token
export const removeToken = () => {
  try {
    if (!isBrowser) return;
    localStorage.removeItem("token");
  } catch (error) {
    console.error("❌ Error removing token:", error);
  }
};

// ✅ Decode JWT payload safely
export const getTokenPayload = () => {
  try {
    if (!isBrowser) return null;

    const token = getToken();
    if (!token) return null;

    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    return JSON.parse(atob(payloadBase64));
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return null;
  }
};

// ✅ Extract loginId (IMPORTANT)
export const getUserIdFromToken = () => {
  const payload = getTokenPayload();
  return payload?.sub || payload?.loginId || payload?.userId || null;
};

// ✅ Extract role
export const getUserRoleFromToken = () => {
  const payload = getTokenPayload();
  return payload?.role || payload?.authorities || null;
};