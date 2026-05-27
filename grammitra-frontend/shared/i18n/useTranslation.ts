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

  // 🔥 SAFE TRANSLATION FUNCTION with {{param}} substitution.
  // Usage:  t("worker.defaultBio")
  //         t("dashboard.reviewPendingBody", { count: 3 })
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      if (!lang) return "";

      const lookup = (langKey: Lang): string | undefined => {
        const segments = key.split(".");
        let value: any = translations[langKey];
        for (const k of segments) value = value?.[k];
        return typeof value === "string" ? value : undefined;
      };

      const resolved = lookup(lang) ?? lookup("en") ?? key;

      if (!params) return resolved;
      return resolved.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
        params[name] != null ? String(params[name]) : `{{${name}}}`
      );
    },
    [lang]
  );

  return {
    t,
    lang,
    setLanguage, // 🔥 allow switching language globally
  };
}