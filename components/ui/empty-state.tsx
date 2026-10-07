import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  compact = false,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${compact ? "py-6" : "mt-4 rounded-2xl border border-dashed border-[#1C1917]/15 p-8 text-center"} ${className}`}
    >
      <p className="font-medium text-[#1C1917]">{title}</p>
      {description && <p className="mt-2 text-sm text-[#57534E]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
