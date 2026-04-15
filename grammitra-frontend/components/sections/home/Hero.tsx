"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero({
  title,
  subtitle,
  backgroundImage,
}: any) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push(`/services/${search.toLowerCase()}`);
  };

  return (
    <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">

      {/* ✅ BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ✅ OVERLAY */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* ✅ CONTENT */}
      <div className="relative z-20 text-center px-6 max-w-3xl">

        <h1 className="text-5xl font-bold mb-6">
          {title}
        </h1>

        <p className="text-lg mb-8 text-white/90">
          {subtitle}
        </p>

        {/* SEARCH */}
        <div className="flex bg-white rounded-full overflow-hidden shadow-lg">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search electricians, plumbers..."
            className="flex-1 px-6 py-4 text-black outline-none"
          />

          <button
            onClick={handleSearch}
            className="bg-primary text-white px-8"
          >
            Search
          </button>
        </div>

      </div>
    </section>
  );
}