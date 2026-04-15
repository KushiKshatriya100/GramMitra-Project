"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const categories = [
    { name: "Electrician", img: "/images/Electrician.jpg" },
    { name: "Plumber", img: "/images/Plumber.jpg" },
    { name: "Carpenter", img: "/images/carpenter.jpg" },
    { name: "Housekeeping", img: "/images/Homekeeping.jpg" },
  ];

  return (
    <div className="relative min-h-screen">

      {/* 🌄 Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/village.jpg')" }}
      />

      {/* 🌑 Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">

        {/* 🔝 NAVBAR */}
        <div className="flex justify-between items-center px-6 py-4 text-white">
          <h1 className="text-3xl font-bold text-green-400">
            GramMitra
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/login")}
              className="border px-4 py-1 rounded"
            >
              Login
            </button>

            <button className="bg-green-500 px-4 py-1 rounded">
              Sign Up
            </button>
          </div>
        </div>

        {/* 🔍 BIG SEARCH BAR */}
        <div className="flex justify-center mt-10 px-4">
          <div className="flex items-center bg-white rounded-full px-6 py-4 w-full max-w-2xl shadow-lg">
            <span className="text-gray-500 text-xl mr-3">🔍</span>
            <input
              placeholder="Search services like plumber, electrician..."
              className="w-full outline-none text-lg"
            />
          </div>
        </div>

        {/* 🏷️ TITLE */}
        <div className="text-center mt-10">
          <h1 className="text-7xl font-extrabold text-green-400">
            GramMitra
          </h1>
          <p className="text-gray-200 mt-2">
            Connecting Rural Skills to Local Demand
          </p>
        </div>

        {/* 📦 BIG SERVICE BOXES */}
        <div className="flex justify-center mt-12 px-4">
          <div className="grid grid-cols-2 gap-6 max-w-4xl">

            {categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => router.push("/login")}
                className="h-40 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 transition"
              >
                <div className="relative w-full h-full">

                  <img
                    src={cat.img}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute bottom-0 w-full bg-black/50 text-white text-center py-2 text-lg">
                    {cat.name}
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* 🔽 HOME APPLIANCE SECTION */}
        <div className="bg-white mt-20 px-8 py-10 rounded-t-3xl">

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Home Appliances</h2>
              <p className="text-gray-500 text-sm">
                Repair & maintenance services
              </p>
            </div>

            <button className="text-blue-500 text-sm">
              Explore More
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto">

            {[
              "AC",
              "Fridge",
              "Washing Machine",
              "Microwave",
              "Geyser",
              "Water Purifier",
            ].map((item, i) => (
              <div key={i} className="min-w-[120px] text-center">

                <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center shadow">
                  <span className="text-2xl">🔧</span>
                </div>

                <p className="mt-2 text-sm text-gray-700">
                  {item}
                </p>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}