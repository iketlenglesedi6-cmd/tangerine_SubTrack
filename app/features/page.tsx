import type { Metadata } from "next";
import Image from "next/image";

import { ActionLink } from "@/components/ui/action-link";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Features | SubTrack",
  description: "See how SubTrack helps you track renewals, spending, and subscriptions in one dashboard.",
};

const featureGroups = [
  {
    label: "FIND THE REPEATS",
    title: "Spot the repeat",
    text: "Import a bank CSV, review likely recurring charges, and pick the ones you want to track.",
  },
  {
    label: "PLAN AHEAD",
    title: "Know what's next",
    text: "See expected charge dates and billing cycles together in one renewal schedule.",
  },
  {
    label: "MAKE IT ADD UP",
    title: "Compare your costs",
    text: "Group spending by category and display currency while keeping original amounts close by.",
  },
];

const workflow = [
  "Add your subscriptions or bring in a CSV your bank exported.",
  "Check the possible repeats. You decide what gets saved.",
  "See what's coming up and where your monthly spend goes.",
];

export default function FeaturesPage() {
  return (
    <PageShell className="max-w-5xl px-6 py-12">
      <section className="relative overflow-hidden rounded-2xl border border-[#f1d2bd] bg-[#fff1e6] px-6 py-8 sm:px-9 sm:py-10">
        <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#9A3412]">A little less subscription surprise</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              Keep your recurring costs zipped up in one place.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#57534E]">
              Find likely repeats, see what renews next, and get a clearer picture of your monthly spend.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionLink href="/import" variant="primary">Try the statement importer</ActionLink>
              <ActionLink href="/pricing" variant="secondary">See the demo details</ActionLink>
            </div>
          </div>
          <div className="mx-auto w-fit rounded-full bg-[#ffe0c4] p-2 sm:mr-2">
            <Image
              src="/tangerine-icon.webp"
              alt=""
              width={160}
              height={160}
              className="h-32 w-32 object-contain sm:h-40 sm:w-40"
            />
          </div>
        </div>
        <p className="mt-7 w-fit rounded-lg bg-white/80 px-3 py-2 text-sm text-[#7C2D12]">
          No bank connection. No cancel button. Just your own subscription list, neatly zipped.
        </p>
      </section>

      <section aria-labelledby="features-heading" className="mt-10">
        <SectionHeading id="features-heading" title="A few handy things" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {featureGroups.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-[#e7ddd2] bg-white p-5">
              <p className="text-xs font-semibold tracking-wide text-[#9A3412]">{feature.label}</p>
              <h3 className="mt-2 font-semibold text-[#1C1917]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#57534E]">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="mt-10 rounded-2xl bg-[#f0e7de] px-6 py-6 sm:px-8">
        <SectionHeading id="workflow-heading" title="Three quick steps" />
        <ol className="mt-4 grid gap-x-8 sm:grid-cols-3">
          {workflow.map((step, index) => (
            <li key={step} className="flex gap-3 border-t border-[#1C1917]/10 py-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9A3412] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-[#1C1917]">{step}</p>
            </li>
          ))}
        </ol>
      </section>

    </PageShell>
  );
}
