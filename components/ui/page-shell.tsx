import type { ReactNode } from "react";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <main className={`mx-auto w-full flex-1 ${className}`}>{children}</main>;
}
