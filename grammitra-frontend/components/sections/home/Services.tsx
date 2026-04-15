"use client";

import { useRouter } from "next/navigation"; // ✅ FIXED
import CategoryCard from "@/features/gram-mitra/components/CategoryCard";

// ✅ FIXED (named imports)
import { sections } from "@/features/gram-mitra/utils/categories";
import { categoryIcons } from "@/features/gram-mitra/utils/categoryIcons";

export default function Services() {
  const router = useRouter();

  return (
    <section className="bg-background py-16 px-6">

      <div className="max-w-6xl mx-auto">

        <h2 className="text-2xl font-semibold mb-10 text-dark">
          Popular Services
        </h2>

        {sections.map((section) => (
          <div key={section.title} className="mb-12">

            {/* Section Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-dark">
                {section.title}
              </h3>

              <button
                onClick={() =>
                  router.push(
                    `/services/${section.items[0].toLowerCase()}`
                  )
                }
                className="text-sm text-blue-600 hover:underline"
              >
                Explore →
              </button>
            </div>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {section.items.map((item) => {
                const icon =
                  categoryIcons[item.toLowerCase()] || "🔧";

                return (
                  <CategoryCard
                    key={item}
                    icon={icon}
                    title={item}
                    onClick={() =>
                      router.push(
                        `/services/${item.toLowerCase()}`
                      )
                    }
                  />
                );
              })}
            </div>

          </div>
        ))}

      </div>
    </section>
  );
}