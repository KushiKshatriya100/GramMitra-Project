"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Theme,
  THEME_STORAGE_KEY,
  applyTheme,
  resolveTheme,
  setTheme as persistTheme,
} from "./themeStore";

/**
 * useTheme — synchronous read of the current theme + reactive updates.
 *
 * Returns `null` for `theme` before hydration to avoid SSR/CSR mismatch when
 * callers render theme-dependent text (e.g. "Switch to dark"). Components that
 * just need to APPLY classes can ignore that and use the theme attribute on
 * <html>, which is already set pre-paint by the inline boot script.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    setThemeState(resolveTheme());

    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") setThemeState(detail);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = e.newValue === "dark" ? "dark" : "light";
      applyTheme(next);
      setThemeState(next);
    };

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
      // Only react to system changes when the user hasn't explicitly chosen.
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      const next: Theme = mql.matches ? "dark" : "light";
      applyTheme(next);
      setThemeState(next);
    };

    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("storage", onStorage);
    mql.addEventListener?.("change", onMedia);

    return () => {
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("storage", onStorage);
      mql.removeEventListener?.("change", onMedia);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = (theme ?? resolveTheme()) === "dark" ? "light" : "dark";
    persistTheme(next);
    setThemeState(next);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
