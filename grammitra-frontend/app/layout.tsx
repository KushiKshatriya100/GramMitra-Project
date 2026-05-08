import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getLanguage } from "@/shared/i18n/languageStore";
import Footer from "@/components/layout/Footer";

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
      <body className="theme-light relative min-h-screen antialiased">

        {/* BACKGROUND */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/images/village11.jpg"
            alt="background"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        {/* OVERLAY */}
        <div className="fixed inset-0 bg-overlay -z-10" />

        {/* ✅ MAIN CONTENT */}
        <main className="relative z-10">
          {children}
        </main>

        <Footer />

        <Toaster position="top-right" reverseOrder={false} />

        {/* 🤖 GLOBAL CHATBOT (FLOATING BOTTOM-RIGHT) */}
        <Chatbot />

      </body>
    </html>
  );
}