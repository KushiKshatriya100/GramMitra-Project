// utils.ts

// 🔥 SAFE STRING
export const safeString = (value?: string | null, fallback = ""): string => {
  return value?.trim() || fallback;
};

// 🔥 CAPITALIZE
export const capitalize = (text?: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// 🔥 FORMAT CURRENCY
export const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "N/A";
  return `₹ ${amount}`;
};

// 🔥 DEBOUNCE (SEARCH OPTIMIZATION)
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay = 300
) => {
  let timer: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

// 🔥 GENERATE ID (fallback usage)
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// 🔥 SAFE JSON PARSE
export const safeParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};