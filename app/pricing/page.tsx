import type { Metadata } from "next";
import { Show, SignUpButton } from "@clerk/nextjs";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        eyebrow="Pricing"
        title="Free during the project demo"
        description="SubTrack has no paid plans or checkout. The prices shown in your account are for the subscriptions you track."
      />

      <section aria-labelledby="included-heading" className="max-w-2xl border-t border-[#1C1917]/10 pt-6">
        <SectionHeading id="included-heading" title="Included" />
        <ul className="mt-4 divide-y divide-[#1C1917]/10">
          {includedFeatures.map((feature) => (
            <li key={feature} className="py-3 text-sm leading-6 text-[#1C1917]">
              {feature}
            </li>
          ))}
        </ul>

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
      </section>
    </PageShell>
  );
}
