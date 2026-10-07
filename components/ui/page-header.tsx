import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`mb-8 flex flex-col gap-4 border-b border-[#1C1917]/10 pb-6 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div>
        <p className="text-sm text-[#57534E]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold text-[#1C1917]">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#57534E]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-4">{actions}</div>}
    </header>
  );
}
