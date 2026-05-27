export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_ATTR = "data-theme";

const isBrowser = typeof window !== "undefined";

const getStored = (): Theme | null => {
  if (!isBrowser) return null;
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  return v === "light" || v === "dark" ? v : null;
};

const getSystem = (): Theme => {
  if (!isBrowser) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const resolveTheme = (): Theme => getStored() ?? getSystem();

export const applyTheme = (theme: Theme) => {
  if (!isBrowser) return;
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(`theme-${theme}`);
  root.setAttribute(THEME_ATTR, theme);
  root.style.colorScheme = theme;
};

export const setTheme = (theme: Theme) => {
  if (!isBrowser) return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(
    new CustomEvent<Theme>("themechange", { detail: theme })
  );
};
