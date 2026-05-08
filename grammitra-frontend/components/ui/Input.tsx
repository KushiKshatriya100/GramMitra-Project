"use client";

import clsx from "clsx";
import React from "react";

type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  name?: string;
  id?: string;
  required?: boolean;
};

export default function Input({
  value,
  onChange,
  placeholder,
  onKeyDown,
  className,
  type = "text",
  name,
  id,
  required,
}: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      required={required}
      inputMode={type === "tel" ? "tel" : undefined} // ✅ IMPROVED MOBILE SUPPORT
      className={clsx(
        "px-5 py-3 rounded-full outline-none w-full transition",
        "bg-[var(--card)] text-[var(--text)]",
        "border border-[var(--border)]",
        "focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]",
        className
      )}
    />
  );
}