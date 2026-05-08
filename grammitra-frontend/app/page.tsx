"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/home/Hero";
import Services from "@/components/sections/home/Services";
import { useTranslation } from "@/shared/i18n/useTranslation";

// 🔥 IMPORT CHATBOT
import Chatbot from "@/features/gram-mitra/components/Chatbot";

export default function Home() {
  const { lang } = useTranslation();

  if (!lang) return null;

  return (
    <div className="min-h-screen">

      <Navbar />

      <Hero />

      <Services />

      {/* 🤖 CHATBOT (FLOATING) */}
      <Chatbot />

    </div>
  );
}