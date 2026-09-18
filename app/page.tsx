import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f1ea] text-zinc-800">
      <main className="flex w-full max-w-5xl flex-col gap-10 px-6 py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#7a5b3a]">
            Tangerine SubTrack
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-zinc-900 sm:text-5xl lg:text-7xl">
            Keep the subscriptions you actually use in view.
          </h1>
        </div>

        <p className="mx-auto max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
          A quieter way to track recurring spend, surface renewals, and understand what you’re paying for without the noise.
        </p>

        <Show when="signed-out">
          <div className="flex flex-wrap justify-center gap-3">
            <SignUpButton>
              <button className="rounded-full border border-[#d9c5af] bg-[#1f1a17] px-6 py-3 text-sm font-semibold text-[#f7f2ee] transition hover:bg-[#2b241f]">
                Get started
              </button>
            </SignUpButton>
            <SignInButton>
              <button className="rounded-full border border-[#d9c5af] bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-[#f5efe9]">
                Sign in
              </button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="mx-auto inline-flex items-center justify-center rounded-full border border-[#d9c5af] bg-[#1f1a17] px-6 py-3 text-sm font-semibold text-[#f7f2ee] transition hover:bg-[#2b241f]"
          >
            Open dashboard
          </Link>
        </Show>

        <div className="grid gap-4 pt-4 text-left md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_28px_rgba(31,26,23,0.02)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a5b3a]">
              Track
            </p>
            <p className="mt-3 text-xl font-semibold text-zinc-900">
              Every recurring charge in one place.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_28px_rgba(31,26,23,0.02)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a5b3a]">
              See
            </p>
            <p className="mt-3 text-xl font-semibold text-zinc-900">
              When costs are due before they surprise you.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_28px_rgba(31,26,23,0.02)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a5b3a]">
              Calm
            </p>
            <p className="mt-3 text-xl font-semibold text-zinc-900">
              A clearer view of your monthly spend.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
