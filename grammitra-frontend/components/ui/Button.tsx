"use client";

import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  className,
  disabled,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-6 py-2 rounded-full font-medium transition-all duration-200",
        "bg-primary text-white shadow-md",
        "hover:shadow-lg hover:scale-[1.03]",
        "active:scale-[0.98]",
        "disabled:opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}