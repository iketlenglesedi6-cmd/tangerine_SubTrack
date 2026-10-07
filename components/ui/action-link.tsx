import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const variants = {
  primary:
    "inline-flex w-fit items-center rounded-lg bg-[#9A3412] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]",
  secondary:
    "inline-flex w-fit items-center rounded-lg border border-[#d9c5af] px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#f7f3ee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]",
  text: "w-fit text-sm font-medium text-[#9A3412] underline underline-offset-2 hover:text-[#7C2D12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]",
} as const;

export function ActionLink({
  href,
  children,
  variant = "text",
  className = "",
}: {
  href: ComponentProps<typeof Link>["href"];
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link href={href} className={`${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
