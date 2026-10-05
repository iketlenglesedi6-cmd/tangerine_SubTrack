import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { formatCurrency } from "@/src/lib/currency";
import { getDaysUntil, getNextRenewalDate } from "@/src/lib/renewals";
import { db } from "@/src/prisma/db";

export const metadata: Metadata = {
  title: "Renewals | SubTrack",
  description: "See upcoming subscription renewal dates and amounts.",
};

function renewalLabel(daysUntil: number | null) {
  if (daysUntil === null) return "Date unavailable";
  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  return `In ${daysUntil} days`;
}

export default async function RenewalsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const rows = await db.orm.public.Subscription.where({ userId, status: "active" }).all();
  const renewals = rows
    .map((subscription) => {
      const renewalDate = getNextRenewalDate(subscription.renewalDate, subscription.billingCycle);
      return {
        id: String(subscription.id),
        name: subscription.name,
        cost: Number(subscription.cost),
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        renewalDate,
        daysUntil: getDaysUntil(renewalDate),
      };
    })
    .sort((left, right) => new Date(left.renewalDate).getTime() - new Date(right.renewalDate).getTime());

  const monthlySpend = new Map<string, number>();
  for (const renewal of renewals) {
    const monthlyAmount = renewal.billingCycle === "yearly" ? renewal.cost / 12 : renewal.cost;
    monthlySpend.set(renewal.currency, (monthlySpend.get(renewal.currency) ?? 0) + monthlyAmount);
  }

  const dueSoon = renewals.filter((renewal) => renewal.daysUntil !== null && renewal.daysUntil <= 30);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-4 border-b border-[#1C1917]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#57534E]">Your tracked subscriptions</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#1C1917]">Renewal schedule</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#57534E]">
            See the next expected charge for each active subscription. Dates are based on the billing cycle you track.
          </p>
        </div>
        <Link href="/dashboard" className="w-fit text-sm font-medium text-[#9A3412] underline underline-offset-2">
          Back to dashboard
        </Link>
      </header>

      <section aria-label="Renewal overview" className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#1C1917] p-5 text-white">
          <p className="text-sm text-white/90">Expected monthly spend</p>
          {monthlySpend.size === 0 ? (
            <p className="mt-2 text-xl font-semibold">No active subscriptions</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-4">
              {Array.from(monthlySpend.entries()).map(([currency, amount]) => (
                <p key={currency} className="text-2xl font-semibold">
                  {formatCurrency(amount, currency)} <span className="text-sm font-normal text-white/90">/ month</span>
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-[#1C1917]/10 bg-white p-5">
          <p className="text-sm text-[#57534E]">Renewing in the next 30 days</p>
          <p className="mt-2 text-2xl font-semibold text-[#1C1917]">
            {dueSoon.length} {dueSoon.length === 1 ? "subscription" : "subscriptions"}
          </p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="renewal-list-heading">
        <h2 id="renewal-list-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-[#57534E]">
          Upcoming charges
        </h2>
        {renewals.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[#1C1917]/15 p-8 text-center">
            <p className="font-medium text-[#1C1917]">Nothing scheduled yet</p>
            <p className="mt-2 text-sm text-[#57534E]">Add a subscription or import a bank statement to see upcoming renewals.</p>
            <Link href="/import" className="mt-4 inline-flex rounded-lg bg-[#9A3412] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7C2D12]">
              Import a bank statement
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-[#1C1917]/10 border-t border-[#1C1917]/10">
            {renewals.map((renewal) => (
              <li key={renewal.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#1C1917]">{renewal.name}</p>
                  <p className="text-sm text-[#57534E]">
                    {renewal.billingCycle === "yearly" ? "Yearly" : "Monthly"} · {new Date(renewal.renewalDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-sm font-medium text-[#9A3412]">{renewalLabel(renewal.daysUntil)}</span>
                  <span className="font-semibold text-[#1C1917]">{formatCurrency(renewal.cost, renewal.currency)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
