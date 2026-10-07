import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { formatCurrency } from "@/src/lib/currency";
import { convertCurrencyAmount } from "@/src/lib/currency";
import type { ExchangeRates, SupportedCurrency } from "@/src/lib/currency";
import { getExchangeRates } from "@/src/lib/exchange-rates";
import { getDisplayCurrency } from "@/src/lib/display-currency";
import { CurrencyPreferenceSelect } from "@/components/currency-preference-select";
import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
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

function displayAmount(cost: number, currency: string, preferred: SupportedCurrency, rates: ExchangeRates | null) {
  const converted = convertCurrencyAmount(cost, currency, preferred, rates);
  return formatCurrency(converted ?? cost, converted === null ? currency : preferred);
}

export default async function RenewalsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const rows = await db.orm.public.Subscription.where({ userId, status: "active" }).all();
  const [displayCurrency, exchangeRates] = await Promise.all([getDisplayCurrency(), getExchangeRates()]);
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

  let monthlySpend = 0;
  let canConvertMonthlySpend = true;
  for (const renewal of renewals) {
    const monthlyAmount = renewal.billingCycle === "yearly" ? renewal.cost / 12 : renewal.cost;
    const converted = convertCurrencyAmount(monthlyAmount, renewal.currency, displayCurrency, exchangeRates);
    if (converted === null) canConvertMonthlySpend = false;
    else monthlySpend += converted;
  }
  const dueSoon = renewals.filter((renewal) => renewal.daysUntil !== null && renewal.daysUntil <= 30);

  return (
    <PageShell className="max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow="Your tracked subscriptions"
        title="Renewal schedule"
        description="See the next expected charge for each active subscription. Dates are based on the billing cycle you track."
        actions={
          <>
          <CurrencyPreferenceSelect currency={displayCurrency} />
            <ActionLink href="/dashboard">Back to dashboard</ActionLink>
          </>
        }
      />

      <section aria-label="Renewal overview" className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#1C1917] p-5 text-white">
          <p className="text-sm text-white/90">Expected monthly spend</p>
          {renewals.length === 0 ? (
            <p className="mt-2 text-xl font-semibold">No active subscriptions</p>
          ) : canConvertMonthlySpend ? (
            <p className="mt-3 text-2xl font-semibold">
              {formatCurrency(monthlySpend, displayCurrency)} <span className="text-sm font-normal text-white/90">/ month</span>
            </p>
          ) : <p className="mt-3 text-sm">Exchange rates are unavailable; see original currencies below.</p>}
          {renewals.length > 0 && canConvertMonthlySpend && <p className="mt-2 text-xs text-white/90">{exchangeRates ? `Shown in ${displayCurrency} using ${exchangeRates.date} reference rates.` : `Amounts are already in ${displayCurrency}; no conversion was needed.`}</p>}
        </div>
        <div className="rounded-2xl border border-[#1C1917]/10 bg-white p-5">
          <p className="text-sm text-[#57534E]">Renewing in the next 30 days</p>
          <p className="mt-2 text-2xl font-semibold text-[#1C1917]">
            {dueSoon.length} {dueSoon.length === 1 ? "subscription" : "subscriptions"}
          </p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="renewal-list-heading">
        <SectionHeading id="renewal-list-heading" title="Upcoming charges" className="mb-4" />
        {renewals.length === 0 ? (
          <EmptyState
            title="Nothing scheduled yet"
            description="Add a subscription or import a bank statement to see upcoming renewals."
            action={<ActionLink href="/import" variant="primary">Import a bank statement</ActionLink>}
          />
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
                  <span className="text-right">
                    <span className="block font-semibold text-[#1C1917]">{displayAmount(renewal.cost, renewal.currency, displayCurrency, exchangeRates)}</span>
                    {renewal.currency !== displayCurrency && <span className="block text-xs text-[#57534E]">Original: {formatCurrency(renewal.cost, renewal.currency)}</span>}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
