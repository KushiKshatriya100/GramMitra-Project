import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getLanguage } from "@/shared/i18n/languageStore";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/shared/theme/ThemeScript";

// 🤖 IMPORT CHATBOT
import Chatbot from "@/features/gram-mitra/components/Chatbot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getLanguage();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Applies the theme class to <html> BEFORE first paint (no FOUC). */}
        <ThemeScript />
      </head>

      <body className="relative min-h-screen antialiased">

        {/* BACKGROUND — village photo, dimmed automatically in dark theme */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/images/village11.jpg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ opacity: "var(--bg-image-opacity)" }}
          />
        </div>

        {/* THEMED OVERLAY */}
        <div className="fixed inset-0 bg-overlay -z-10" />

        {/* MAIN */}
        <main className="relative z-10">
          {children}
        </main>

        <Footer />

        <Toaster position="top-right" reverseOrder={false} />

        {/* GLOBAL CHATBOT */}
        <Chatbot />

      </body>
    </html>
  );
}
