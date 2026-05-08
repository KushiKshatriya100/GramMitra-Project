type Language = "en" | "hi";

const DEFAULT_LANG: Language = "en";

let currentLanguage: Language = DEFAULT_LANG;

let listeners: ((lang: Language) => void)[] = [];

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;

  if (typeof window !== "undefined") {
    localStorage.setItem("lang", lang);
  }

  listeners.forEach((cb) => cb(lang));
};

export const getLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lang") as Language;
    return stored || currentLanguage || DEFAULT_LANG;
  }
  return currentLanguage;
};

export const subscribeLanguage = (cb: (lang: Language) => void) => {
  listeners.push(cb);

  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
};