"use client";

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
      className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}