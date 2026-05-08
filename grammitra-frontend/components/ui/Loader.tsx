"use client";

type LoaderProps = {
  size?: number;
};

export default function Loader({ size = 32 }: LoaderProps) {
  return (
    <div className="flex justify-center items-center py-10">
      <div
        style={{ width: size, height: size }}
        className="border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin"
      />
    </div>
  );
}