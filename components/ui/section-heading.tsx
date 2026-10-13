import type { ReactNode } from "react";

export function SectionHeading({
  title,
  children,
  variant = "section",
  id,
  className = "",
}: {
  title: string;
  children?: ReactNode;
  variant?: "section" | "card" | "inverse";
  id?: string;
  className?: string;
}) {
  const titleClassName =
    variant === "card"
      ? "text-lg font-semibold text-[#1C1917]"
      : variant === "inverse"
        ? "text-sm font-semibold uppercase tracking-[0.14em] text-white/80"
        : "text-sm font-semibold uppercase tracking-[0.14em] text-[#4B4742]";

  return (
    <div className={`flex min-w-0 flex-wrap items-center justify-between gap-3 ${className}`}>
      <h2 id={id} className={`min-w-0 ${titleClassName}`}>{title}</h2>
      {children}
    </div>
  );
}
