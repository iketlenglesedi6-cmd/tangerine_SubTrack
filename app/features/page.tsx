import type { Metadata } from "next";
import { ActionLink } from "@/components/ui/action-link";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Features | SubTrack",
  description: "See how SubTrack helps you track renewals, spending, and subscriptions in one dashboard.",
};

const featureGroups = [
  {
    title: "See what renews next",
    text: "Keep each subscription’s next expected charge date in one schedule. SubTrack advances past dates by the billing cycle you choose.",
  },
  {
    title: "Compare spending by currency",
    text: "View monthly equivalents and category totals without adding different currencies into a misleading single number.",
  },
  {
    title: "Find recurring charges",
    text: "Import a bank statement CSV, review possible monthly or yearly charges, and choose which ones to track.",
  },
];

const workflow = [
  "Enter subscriptions yourself or import a statement exported by your bank",
  "Review detected recurring charges before adding them to your tracker",
  "Check upcoming renewals and review spending by category and currency",
];

export default function FeaturesPage() {
  return (
    <PageShell className="max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <section className="rounded-[2rem] border border-[#e7ddd2] bg-[#fbf8f4] p-8 shadow-[0_20px_50px_rgba(33,26,20,0.05)] md:p-12">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#7a5b3a]">
          Features
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.07em] text-zinc-900 md:text-5xl">
          Built to surface the subscriptions you actually need to watch.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
          SubTrack focuses on clarity, not clutter. It turns a stream of recurring charges into useful signals you can act on.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {featureGroups.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[1.75rem] border border-[#e7ddd2] bg-white p-6 shadow-[0_16px_32px_rgba(38,28,21,0.04)]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0dfbf] text-lg font-black text-[#3d2c20]">
              +
            </div>
            <h2 className="text-xl font-bold tracking-[-0.05em] text-zinc-900">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.text}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <ActionLink href="/pricing" variant="secondary" className="px-5 py-3 text-zinc-800">
          See what’s included
        </ActionLink>
        <ActionLink href="/import" variant="primary" className="px-5 py-3">
          Import a statement
        </ActionLink>
      </div>

      <section className="mt-10 rounded-[2rem] border border-[#e7ddd2] bg-[#f6f1ea] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#7a5b3a]">
              Product flow
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-zinc-900">
              Stay ahead without checking every bill manually.
            </h2>
          </div>

          <div className="space-y-4">
            {workflow.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl border border-[#e9dccd] bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1a17] text-xs font-bold text-[#f7f1ea]">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-zinc-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
