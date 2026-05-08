"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { setLanguage } from "@/shared/i18n/languageStore";

export default function Navbar() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(`theme-${savedTheme}`);
  }, []);

  if (!lang) return null;

  const handleNavigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    router.replace("/");
    router.refresh();
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(`theme-${newTheme}`);
  };

  const toggleLang = () => {
    const newLang = lang === "en" ? "hi" : "en";
    localStorage.setItem("lang", newLang);
    setLanguage(newLang);
    window.location.reload();
  };

  const role = user?.role?.toLowerCase();

  return (
    <nav className="fixed top-0 left-0 w-full z-50
      bg-gradient-to-r from-[#3B2F2F]/90 to-[#4E3B31]/90
      backdrop-blur-xl border-b border-white/10
      px-6 py-4 flex justify-between items-center
      shadow-[0_4px_20px_rgba(0,0,0,0.2)]">

      {/* LOGO */}
      <h1
        onClick={() => handleNavigate("/")}
        className="text-white font-bold text-xl cursor-pointer tracking-wide"
      >
        GramMitra 🌾
      </h1>

      {/* NAV LINKS */}
      <div className="hidden md:flex gap-8 text-white text-sm font-medium">
        <button onClick={() => handleNavigate("/")}>
          {t("navbar.home")}
        </button>

        <button onClick={() => handleNavigate("/services")}>
          {t("navbar.services")}
        </button>

        <button onClick={() => handleNavigate("/about")}>
          {t("navbar.about")}
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 relative">

        {/* LANG */}
        <button
          onClick={toggleLang}
          className="text-white text-xs border border-white/20 px-3 py-1 rounded-full hover:bg-white/10 transition"
        >
          {lang === "en" ? "हिंदी" : "EN"}
        </button>

        {/* THEME */}
        <button onClick={toggleTheme} className="text-lg">
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {!user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate("/auth/user/login")}
              className="text-white text-sm hover:underline"
            >
              {t("navbar.login")}
            </button>

            <Button onClick={() => handleNavigate("/auth/user/register")}>
              {t("navbar.signup")}
            </Button>
          </div>
        ) : (
          <>
            {/* AVATAR */}
            <div
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-orange-500 text-white
              flex items-center justify-center font-bold cursor-pointer shadow-md"
            >
              {user.name?.charAt(0)}
            </div>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 top-14 w-64
                bg-[var(--card)] border border-[var(--border)]
                rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]
                overflow-hidden z-50 backdrop-blur-md">

                <div className="p-4 border-b">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-[var(--text-soft)]">
                    {user.phone || t("navbar.welcome")}
                  </p>
                </div>

                <button
                  onClick={() => handleNavigate(`/dashboard/${role}`)}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg)] text-sm"
                >
                  {t("navbar.dashboard")}
                </button>

                <button
                  onClick={() => handleNavigate(`/dashboard/${role}/profile`)}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg)] text-sm"
                >
                  {t("navbar.profile")}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-500"
                >
                  {t("navbar.logout")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}