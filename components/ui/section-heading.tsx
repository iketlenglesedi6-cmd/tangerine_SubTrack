import type { ReactNode } from "react";

export function SectionHeading({
  title,
  children,
  variant = "section",
  id,
  className = "",
  stackOnMobile = false,
}: {
  title: string;
  children?: ReactNode;
  variant?: "section" | "card" | "inverse";
  id?: string;
  className?: string;
  stackOnMobile?: boolean;
}) {
  const titleClassName =
    variant === "card"
      ? "text-lg font-semibold text-[#1C1917]"
      : variant === "inverse"
        ? "text-sm font-semibold uppercase tracking-[0.14em] text-white/80"
        : "text-sm font-semibold uppercase tracking-[0.14em] text-[#4B4742]";
  const layoutClassName = stackOnMobile
    ? "flex flex-col items-start sm:flex-row sm:items-center"
    : "flex flex-wrap items-center justify-between";

  return (
    <div className={`${layoutClassName} min-w-0 gap-3 ${className}`}>
      <h2 id={id} className={`min-w-0 ${titleClassName}`}>{title}</h2>
      {children}
    </div>
  );
}
