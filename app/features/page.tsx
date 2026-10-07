import type { Metadata } from "next";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Features | SubTrack",
  description: "See how SubTrack helps you track renewals, spending, and subscriptions in one dashboard.",
};

const featureGroups = [
  {
    title: "Track recurring charges",
    text: "Add subscriptions yourself or import a bank CSV. Review the possible repeats and choose what to save.",
  },
  {
    title: "See upcoming renewals",
    text: "Keep expected charge dates and billing cycles together in one schedule.",
  },
  {
    title: "Understand your spending",
    text: "Group monthly costs by category and choose a display currency while keeping original amounts available.",
  },
];

const workflow = [
  "Enter subscriptions or import a statement exported by your bank.",
  "Review possible recurring charges before adding them to your tracker.",
  "Check upcoming renewals and spending by category and currency.",
];

export default function FeaturesPage() {
  return (
    <PageShell className="max-w-5xl px-6 py-12">
      <PageHeader
        eyebrow="Features"
        title="A clear view of your recurring costs"
        description="SubTrack brings your subscriptions, estimated monthly spend, and upcoming renewals into one place."
      />

      <section aria-labelledby="features-heading" className="mt-10">
        <SectionHeading id="features-heading" title="What you can do" />
        <div className="mt-4 grid gap-x-8 md:grid-cols-3">
          {featureGroups.map((feature) => (
            <article key={feature.title} className="border-t border-[#1C1917]/15 py-5">
              <h3 className="font-semibold text-[#1C1917]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#57534E]">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="mt-8 border-t border-[#1C1917]/10 pt-6">
        <SectionHeading id="workflow-heading" title="How it works" />
        <ol className="mt-4 grid gap-x-8 sm:grid-cols-3">
          {workflow.map((step, index) => (
            <li key={step} className="border-t border-[#1C1917]/10 py-4">
              <p className="text-xs font-medium text-[#9A3412]">Step {index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-[#1C1917]">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionLink href="/pricing" variant="secondary">View pricing</ActionLink>
        <ActionLink href="/import" variant="primary">Import a statement</ActionLink>
      </div>
    </PageShell>
  );
}
