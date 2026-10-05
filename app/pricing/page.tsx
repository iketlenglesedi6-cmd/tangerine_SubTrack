import type { Metadata } from "next";
import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing | SubTrack",
  description: "Track subscriptions with SubTrack for free during the project demo.",
};

const includedFeatures = [
  "Track subscriptions entered by you",
  "Import recurring charges from a bank statement CSV",
  "See renewal dates, category totals, and multiple currencies",
];

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-12 sm:px-6 md:py-16">
      <section className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-[#e7ddd2] bg-white p-7 shadow-[0_18px_40px_rgba(38,28,21,0.04)] sm:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#7a5b3a]">
          Pricing
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.07em] text-zinc-900">
          Free to use for this project demo.
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          SubTrack has no paid tiers or checkout yet. The prices below belong to the subscriptions you track, not a
          SubTrack plan.
        </p>

        <ul className="mt-7 space-y-3 text-sm text-zinc-700">
          {includedFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-0.5 font-bold text-[#7a5b3a]">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Show when="signed-out">
            <SignUpButton>
              <button className="rounded-lg bg-[#9A3412] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12]">
                Start tracking
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="rounded-lg bg-[#9A3412] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12]">
              Open dashboard
            </Link>
          </Show>
          <Link href="/features" className="rounded-lg border border-[#d9c5af] px-5 py-3 text-sm font-medium text-zinc-800 hover:bg-[#f7f3ee]">
            Explore features
          </Link>
        </div>
      </section>
    </main>
  );
}
