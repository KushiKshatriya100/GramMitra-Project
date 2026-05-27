"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { setLanguage } from "@/shared/i18n/languageStore";
import { useTheme } from "@/shared/theme/useTheme";

type NavLink = { key: string; path: string };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang } = useTranslation();
  const { theme, toggleTheme: toggleThemeRaw } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  // BOOTSTRAP: user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // SCROLL-AWARE: transparent over hero, solid after 24px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // CLOSE PROFILE DROPDOWN: outside-click + Escape
  useEffect(() => {
    if (!profileOpen) return;

    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  // LOCK BODY SCROLL when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!lang) return null;

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    setProfileOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    // Tell the server to clear the httpOnly auth cookie. clearSession()
    // (called inside authService.logout) wipes the local session blob.
    // We await this so the redirect happens after the cookie is gone — a
    // racy fetch could otherwise hit the server with a valid cookie.
    const { logout } = await import("@/features/gram-mitra/services/authService");
    await logout();
    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  };

  const toggleTheme = () => {
    // Enable theme-change transitions briefly, then run the toggle.
    // The .theme-transitioning class is scoped to bg/border/color/shadow,
    // so hovers using transform stay snappy.
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    window.setTimeout(() => root.classList.remove("theme-transitioning"), 320);
    toggleThemeRaw();
  };

  const toggleLang = () => {
    const newLang = lang === "en" ? "hi" : "en";
    setLanguage(newLang);
    router.refresh();
  };

  const role = user?.role?.toLowerCase();

  const links: NavLink[] = [
    { key: "navbar.home", path: "/" },
    { key: "navbar.services", path: "/services" },
    { key: "navbar.about", path: "/about" },
  ];

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname?.startsWith(path);

  // Routes that render a dark hero behind the navbar — only these may show
  // the transparent + white-text state at the top. Every other route would
  // render white-on-cream and be invisible in light mode.
  const HERO_ROUTES = new Set<string>(["/"]);
  const overHero = HERO_ROUTES.has(pathname ?? "");
  const solid = scrolled || !overHero;

  return (
    <>
      <nav
        aria-label="Primary"
        className={[
          "fixed top-0 left-0 w-full z-50",
          "transition-[background-color,backdrop-filter,box-shadow,padding] duration-300 ease-out",
          solid
            ? "bg-[var(--card)]/85 backdrop-blur-xl shadow-[var(--shadow-medium)] border-b border-[var(--border)] py-2.5"
            : "bg-transparent backdrop-blur-0 border-b border-transparent py-4",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* LOGO */}
          <button
            onClick={() => handleNavigate("/")}
            aria-label="GramMitra home"
            className="group flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60 rounded-full px-1"
          >
            <span
              className={[
                "grid place-items-center w-9 h-9 rounded-xl text-base",
                "bg-[var(--primary)] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]",
                "transition-transform duration-300 group-hover:rotate-6",
              ].join(" ")}
              aria-hidden
            >
              🌾
            </span>
            <span
              className={[
                "font-bold text-lg tracking-wide leading-none",
                solid ? "text-[var(--text)]" : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
              ].join(" ")}
            >
              GramMitra
            </span>
          </button>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = isActive(l.path);
              return (
                <button
                  key={l.path}
                  onClick={() => handleNavigate(l.path)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative px-4 py-2 text-sm font-medium rounded-full transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60",
                    solid ? "text-[var(--text)]" : "text-white/95",
                    active
                      ? solid
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "bg-white/15 backdrop-blur-md"
                      : solid
                        ? "hover:bg-[var(--bg)]"
                        : "hover:bg-white/10",
                  ].join(" ")}
                >
                  {t(l.key)}
                </button>
              );
            })}
          </div>

          {/* RIGHT CLUSTER */}
          <div className="flex items-center gap-2">

            {/* LANG */}
            <button
              onClick={toggleLang}
              aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}
              className={[
                "hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full border transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60",
                solid
                  ? "border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
                  : "border-white/30 text-white hover:bg-white/10",
              ].join(" ")}
            >
              {lang === "en" ? "हिंदी" : "EN"}
            </button>

            {/* THEME */}
            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              suppressHydrationWarning
              className={[
                "w-9 h-9 grid place-items-center rounded-full transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60",
                solid
                  ? "text-[var(--text)] hover:bg-[var(--bg)]"
                  : "text-white hover:bg-white/10",
              ].join(" ")}
            >
              <span aria-hidden className="text-base" suppressHydrationWarning>
                {theme === null ? "" : theme === "dark" ? "☀️" : "🌙"}
              </span>
            </button>

            {/* AUTH */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNavigate("/auth/user/login")}
                  className={[
                    "text-sm font-medium px-3 py-1.5 rounded-full transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60",
                    solid
                      ? "text-[var(--text)] hover:bg-[var(--bg)]"
                      : "text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {t("navbar.login")}
                </button>

                <Button onClick={() => handleNavigate("/auth/user/register")}>
                  {t("navbar.signup")}
                </Button>
              </div>
            ) : (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                  className="w-10 h-10 rounded-full bg-[var(--primary)] text-white font-bold grid place-items-center shadow-[0_4px_14px_rgba(0,0,0,0.2)] ring-2 ring-white/40 hover:ring-white/70 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60"
                >
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 w-64 origin-top-right
                      bg-[var(--card)] border border-[var(--border)]
                      rounded-2xl shadow-[var(--shadow-medium)]
                      overflow-hidden animate-fadeIn"
                  >
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="font-semibold text-[var(--text)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--text-soft)] truncate">
                        {user.phone || t("navbar.welcome")}
                      </p>
                    </div>

                    <button
                      role="menuitem"
                      onClick={() => handleNavigate(`/dashboard/${role}`)}
                      className="w-full text-left px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition"
                    >
                      {t("navbar.dashboard")}
                    </button>

                    <button
                      role="menuitem"
                      onClick={() => handleNavigate(`/dashboard/${role}/profile`)}
                      className="w-full text-left px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition"
                    >
                      {t("navbar.profile")}
                    </button>

                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-[var(--danger)] hover:bg-[var(--danger-soft)] transition border-t border-[var(--border)]"
                    >
                      {t("navbar.logout")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* HAMBURGER (mobile) */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={[
                "md:hidden w-10 h-10 grid place-items-center rounded-full transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60",
                solid ? "text-[var(--text)] hover:bg-[var(--bg)]" : "text-white hover:bg-white/10",
              ].join(" ")}
            >
              <span className="relative w-5 h-4 block" aria-hidden>
                <span
                  className={[
                    "absolute left-0 top-0 w-full h-0.5 bg-current rounded transition-transform duration-300",
                    menuOpen ? "translate-y-[7px] rotate-45" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-current rounded transition-opacity duration-200",
                    menuOpen ? "opacity-0" : "opacity-100",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 bottom-0 w-full h-0.5 bg-current rounded transition-transform duration-300",
                    menuOpen ? "-translate-y-[7px] -rotate-45" : "",
                  ].join(" ")}
                />
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE PANEL */}
        <div
          id="mobile-menu"
          className={[
            "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
            "bg-[var(--card)]/95 backdrop-blur-xl border-t border-[var(--border)]",
            menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => {
              const active = isActive(l.path);
              return (
                <button
                  key={l.path}
                  onClick={() => handleNavigate(l.path)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition",
                    active
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--text)] hover:bg-[var(--bg)]",
                  ].join(" ")}
                >
                  {t(l.key)}
                </button>
              );
            })}

            {!user && (
              <div className="flex gap-2 pt-2 border-t border-[var(--border)] mt-2">
                <button
                  onClick={() => handleNavigate("/auth/user/login")}
                  className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition"
                >
                  {t("navbar.login")}
                </button>
                <Button
                  onClick={() => handleNavigate("/auth/user/register")}
                  className="flex-1"
                >
                  {t("navbar.signup")}
                </Button>
              </div>
            )}

            <button
              onClick={toggleLang}
              className="sm:hidden w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--bg)] transition mt-1"
            >
              {lang === "en" ? "हिंदी" : "English"}
            </button>
          </div>
        </div>
      </nav>

      {/* BACKDROP for mobile menu */}
      {menuOpen && (
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
          className="md:hidden fixed inset-0 top-[64px] z-40 bg-black/30 backdrop-blur-sm"
        />
      )}
    </>
  );
}
