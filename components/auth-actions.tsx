"use client";

import { useClerk } from "@clerk/nextjs";

export function AuthActions() {
  const clerk = useClerk();

  return (
    <div className="flex flex-wrap items-center gap-1 sm:flex-nowrap sm:gap-2">
      <button
        type="button"
        onClick={() => clerk.openSignIn()}
        className="rounded-lg px-2 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#1C1917]/5 sm:px-4"
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => clerk.openSignUp()}
        className="rounded-lg bg-[#9A3412] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12] sm:px-4"
      >
        Start tracking
      </button>
    </div>
  );
}
