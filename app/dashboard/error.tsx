"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#78716C]">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[#1C1917]">
        We couldn&apos;t load your dashboard
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#78716C]">
        This is usually temporary. Try again, and if it keeps happening, let us know.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-[#F97316] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
      >
        Try again
      </button>
    </main>
  );
}
