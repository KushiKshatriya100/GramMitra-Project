"use client";

import Card from "@/components/ui/Card";

type CategoryCardProps = {
  icon: string;
  title: string;
  onClick?: () => void;
};

export default function CategoryCard({
  icon,
  title,
  onClick,
}: CategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      className="w-[150px] h-[150px] flex flex-col items-center justify-center
      text-center gap-3 rounded-2xl border border-[var(--border)] bg-white/90
      hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-full
      bg-[var(--border)] text-2xl shadow-sm group-hover:scale-110 transition">
        {icon}
      </div>

      <p className="text-sm font-semibold text-[var(--text)] leading-snug">
        {title}
      </p>
    </Card>
  );
}