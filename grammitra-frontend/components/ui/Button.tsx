"use client";

import clsx from "clsx";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  onClick,
  className,
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={clsx(
        // BASE
        "relative px-6 py-2.5 rounded-full font-medium",

        // THEME COLORS
        "bg-[var(--primary)] text-white",

        // DEPTH
        "shadow-[0_4px_14px_rgba(0,0,0,0.15)]",

        // HOVER (premium feel)
        "hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]",
        "hover:-translate-y-[1px]",

        // ACTIVE (press feel)
        "active:scale-[0.96] active:shadow-sm",

        // TRANSITION
        "transition-all duration-200 ease-out",

        // FOCUS
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50",

        // DISABLED
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100",

        className
      )}
    >
      {children}
    </button>
  );
}