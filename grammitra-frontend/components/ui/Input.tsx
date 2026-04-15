"use client";

import clsx from "clsx";

type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
};

export default function Input({
  value,
  onChange,
  placeholder,
  onKeyDown,
  className,
  type = "text",
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={clsx(
        "px-5 py-3 rounded-full outline-none w-full text-black bg-white",
        "border border-gray-200 focus:ring-2 focus:ring-orange-400",
        className
      )}
    />
  );
}