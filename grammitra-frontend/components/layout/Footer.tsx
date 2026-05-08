"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/shared/i18n/useTranslation";

export default function Footer() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  if (!lang) return null;

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <footer
      className="
        mt-24 px-6 py-16 text-white
        bg-gradient-to-br from-[#3B2F2F] via-[#4E3B31] to-[#2F2622]
        border-t border-white/10
        relative overflow-hidden
      "
    >
      {/* 🔥 subtle glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[500px] h-[300px] bg-white/5 blur-[120px] -translate-x-1/2" />
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 relative z-10">

        {/* BRAND */}
        <div className="space-y-4 animate-fadeIn">
          <h2
            onClick={() => navigate("/")}
            className="font-bold text-xl cursor-pointer hover:opacity-80 transition"
          >
            GramMitra 🌾
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed">
            {t("footer.tagline")}
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="space-y-4 animate-fadeIn delay-100">
          <h3 className="font-semibold text-white/90 tracking-wide">
            {t("footer.links")}
          </h3>

          <div className="flex flex-col gap-3 text-sm text-gray-300">

            {[
              { label: t("navbar.home"), path: "/" },
              { label: t("navbar.services"), path: "/services" },
              { label: t("navbar.about"), path: "/about" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="
                  text-left relative group
                  hover:text-white transition
                "
              >
                {item.label}

                {/* underline animation */}
                <span className="
                  absolute left-0 -bottom-1 h-[2px] w-0
                  bg-white transition-all duration-300
                  group-hover:w-full
                " />
              </button>
            ))}

          </div>
        </div>

        {/* CONTACT */}
        <div className="space-y-4 animate-fadeIn delay-200">
          <h3 className="font-semibold text-white/90 tracking-wide">
            {t("footer.contact")}
          </h3>

          <div className="flex flex-col gap-3 text-sm text-gray-300">

            <a
              href="mailto:support@grammitra.com"
              className="hover:text-white transition"
            >
              📧 support@grammitra.com
            </a>

            <a
              href="tel:+918989513929"
              className="hover:text-white transition"
            >
              📞 +91 89895 13929
            </a>

            <p>📍 India</p>

          </div>
        </div>

        {/* SOCIAL */}
        <div className="space-y-4 animate-fadeIn delay-300">
          <h3 className="font-semibold text-white/90 tracking-wide">
            {t("footer.reach")}
          </h3>

          <div className="flex flex-col gap-3 text-sm text-gray-300">

            <a
              href="https://www.linkedin.com/in/kushi-kshatriya100/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                hover:text-white transition
                flex items-center gap-2
              "
            >
              🔗 LinkedIn Profile
            </a>

            <a
              href="https://github.com/KushiKshatriya100"
              target="_blank"
              rel="noopener noreferrer"
              className="
                hover:text-white transition
                flex items-center gap-2
              "
            >
              💻 GitHub Projects
            </a>

          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="mt-14 pt-6 border-t border-white/10 text-center text-xs text-gray-400 relative z-10">
        © {new Date().getFullYear()} GramMitra • {t("footer.rights")}
      </div>
    </footer>
  );
}