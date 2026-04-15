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
      className="min-w-[130px] text-center"
    >
      <div className="text-3xl mb-2">{icon}</div>

      <p className="capitalize text-sm font-medium">
        {title}
      </p>
    </Card>
  );
}