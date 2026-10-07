import type { Metadata } from "next";
import { Show, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";

import { ActionLink } from "@/components/ui/action-link";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Pricing | SubTrack",
  description: "Track subscriptions with SubTrack for free during the project demo.",
};

const includedFeatures = [
  "Track subscriptions you add yourself",
  "Import and review recurring charges from a bank CSV",
  "See renewal dates, category totals, and multiple currencies",
];

export default function PricingPage() {
  return (
    <PageShell className="max-w-5xl px-6 py-12">
      <section className="relative overflow-hidden rounded-2xl border border-[#f1d2bd] bg-[#fff1e6] px-6 py-8 sm:px-9 sm:py-10">
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#9A3412]">Pricing</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              The demo is on us.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#57534E]">
              Every SubTrack feature is free to try during this project demo. There are no paid plans or checkout.
            </p>
            <p className="mt-3 text-sm text-[#7C2D12]">
              The amounts in your account are your subscriptions, not a SubTrack bill.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Show when="signed-out">
                <SignUpButton>
                  <button className="rounded-lg bg-[#9A3412] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]">
                    Start tracking
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <ActionLink href="/dashboard" variant="primary">Open dashboard</ActionLink>
              </Show>
              <ActionLink href="/features" variant="secondary">Explore features</ActionLink>
            </div>
          </div>
          <div className="mx-auto w-fit rounded-full bg-[#ffe0c4] p-2 sm:mr-2">
            <Image
              src="/tangerine-icon.png"
              alt=""
              width={132}
              height={132}
              className="h-28 w-28 object-contain sm:h-32 sm:w-32"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="included-heading" className="mt-10 max-w-2xl">
        <SectionHeading id="included-heading" title="What's in the basket?" />
        <ul className="mt-4 divide-y divide-[#1C1917]/10 border-t border-[#1C1917]/10">
          {includedFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-3 py-3 text-sm leading-6 text-[#1C1917]">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C2410C]" />
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
