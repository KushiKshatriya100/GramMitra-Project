"use client";

import { useEffect, useState, useCallback } from "react";
import en from "./en.json";
import hi from "./hi.json";
import {
  getLanguage,
  setLanguage,
  subscribeLanguage,
} from "./languageStore";

type Lang = "en" | "hi";

const translations: Record<Lang, any> = { en, hi };

export function useTranslation() {
  const [lang, setLang] = useState<Lang | null>(null);

  useEffect(() => {
    const savedLang = getLanguage();

    setLang(savedLang);
    setLanguage(savedLang);

    const unsubscribe = subscribeLanguage((newLang) => {
      setLang(newLang);
    });

    return unsubscribe;
  }, []);

  // 🔥 SAFE TRANSLATION FUNCTION
  const t = useCallback((key: string): string => {
    if (!lang) return "";

    const keys = key.split(".");
    let value: any = translations[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    // 🔥 fallback to EN
    if (!value) {
      let fallback: any = translations["en"];

      for (const k of keys) {
        fallback = fallback?.[k];
      }

      return fallback || key;
    }

    return value;
  }, [lang]);

  return {
    t,
    lang,
    setLanguage, // 🔥 allow switching language globally
  };
}