"use client";

import clsx from "clsx";
import React from "react";

type CardProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function Card({
  children,
  onClick,
  className,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
      className={clsx(
        // BASE
        "relative rounded-2xl border backdrop-blur-md",

        // THEME SUPPORT
        "bg-[var(--card)] border-[var(--border)]",

        // SHADOW SYSTEM (premium depth)
        "shadow-[0_2px_10px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]",

        // INTERACTION
        "transition-all duration-300 ease-out",
        onClick &&
          "cursor-pointer hover:-translate-y-[2px] active:scale-[0.98]",

        // FOCUS (accessibility)
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40",

        // INNER SPACING
        "p-4",

        className
      )}
    >
      {children}
    </div>
  );
}