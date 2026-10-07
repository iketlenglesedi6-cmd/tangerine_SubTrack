import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SubTrack",
  description: "Track your active subscriptions, upcoming renewals, and monthly spend in one place.",
};

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SubscriptionForm } from "@/components/subscription-form";
import { SubscriptionList } from "@/components/subscription-list";
import { CategoryManager } from "@/components/category-manager";
import { calculateDashboardSummary } from "@/src/lib/dashboard";
import { convertCurrencyAmount, formatCurrency } from "@/src/lib/currency";
import { getExchangeRates } from "@/src/lib/exchange-rates";
import { getDisplayCurrency } from "@/src/lib/display-currency";
import { CurrencyPreferenceSelect } from "@/components/currency-preference-select";
import type { ExchangeRates, SupportedCurrency } from "@/src/lib/currency";
import { getDaysUntil } from "@/src/lib/renewals";
import { db } from "@/src/prisma/db";
import Link from "next/link";

const CATEGORY_COLORS = ["#9A3412", "#1C1917", "#059669", "#A8A29E", "#7C2D12"];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function normalizeSubscription(record: {
  id: number;
  name: string;
  cost: number;
  currency: string;
  billingCycle: string;
  renewalDate: string;
  status: string;
  userId: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string } | null;
}) {
  return {
    id: String(record.id),
    name: record.name,
    cost: Number(record.cost),
    currency: record.currency,
    billingCycle: record.billingCycle,
    renewalDate: new Date(record.renewalDate).toISOString(),
    status: record.status,
    userId: record.userId,
    categoryId: String(record.categoryId),
    categoryName: record.category?.name ?? "Uncategorized",
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

function monthlyCost(cost: number, billingCycle: string) {
  return billingCycle === "yearly" ? cost / 12 : cost;
}

function displayAmount(cost: number, currency: string, preferred: SupportedCurrency, rates: ExchangeRates | null) {
  const converted = convertCurrencyAmount(cost, currency, preferred, rates);
  return formatCurrency(converted ?? cost, converted === null ? currency : preferred);
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const rows = await db.orm.public.Subscription
    .where({ userId })
    .include("category", (category) => category.select("id", "name"))
    .all();
  const categoryRows = await db.orm.public.Category.where({ userId }).all();
  const categories = categoryRows.map((category) => ({
    id: String(category.id),
    name: category.name,
  }));

  const subscriptions = rows.map(normalizeSubscription);
  const summary = calculateDashboardSummary(subscriptions);
  const [displayCurrency, exchangeRates] = await Promise.all([getDisplayCurrency(), getExchangeRates()]);
  const convertedMonthlyTotals = summary.monthlySpendByCurrency.map((item) =>
    convertCurrencyAmount(item.monthlySpend, item.currency, displayCurrency, exchangeRates),
  );
  const monthlySpendTotal = convertedMonthlyTotals.every((amount) => amount !== null)
    ? convertedMonthlyTotals.reduce<number>((total, amount) => total + (amount ?? 0), 0)
    : null;
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const categoryTotals = new Map<string, number>();
  for (const sub of activeSubscriptions) {
    const convertedCost = convertCurrencyAmount(monthlyCost(sub.cost, sub.billingCycle), sub.currency, displayCurrency, exchangeRates);
    const currency = convertedCost === null ? sub.currency : displayCurrency;
    const key = `${currency}\u0000${sub.categoryName}`;
    categoryTotals.set(
      key,
      (categoryTotals.get(key) ?? 0) + (convertedCost ?? monthlyCost(sub.cost, sub.billingCycle)),
    );
  }
  const monthlyTotalsByCurrency = monthlySpendTotal === null
    ? new Map(summary.monthlySpendByCurrency.map((item) => [item.currency, item.monthlySpend]))
    : new Map([[displayCurrency, monthlySpendTotal]]);
  const categoryBreakdown = Array.from(categoryTotals.entries())
    .map(([key, cost], i) => {
      const [currency, name] = key.split("\u0000");
      const currencyTotal = monthlyTotalsByCurrency.get(currency) ?? 0;
      return {
        name,
        currency,
        cost,
        value: currencyTotal > 0 ? Math.round((cost / currencyTotal) * 100) : 0,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      };
    })
    .sort((a, b) => a.currency.localeCompare(b.currency) || b.cost - a.cost);
  const renewalsWithin30Days = summary.upcomingRenewals.filter((renewal) => {
    const daysUntil = getDaysUntil(renewal.renewalDate);
    return daysUntil !== null && daysUntil <= 30;
  }).length;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[#57534E]">Monthly recurring spend</p>
          {summary.monthlySpendByCurrency.length === 0 ? (
            <p className="mt-2 text-lg font-medium text-[#1C1917]">
              Add a subscription to see your totals.
            </p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2">
              {monthlySpendTotal !== null ? (
                <p className="text-4xl font-semibold tracking-tight text-[#1C1917]">
                  {formatCurrency(monthlySpendTotal, displayCurrency)}
                  <span className="ml-2 text-base font-normal text-[#57534E]">/ month</span>
                </p>
              ) : summary.monthlySpendByCurrency.map((item) => (
                <p key={item.currency} className="text-4xl font-semibold tracking-tight text-[#1C1917]">
                  {formatCurrency(item.monthlySpend, item.currency)}
                  <span className="ml-2 text-base font-normal text-[#57534E]">/ month</span>
                </p>
              ))}
            </div>
          )}
          {summary.monthlySpendByCurrency.length > 0 && <p className="mt-2 text-xs text-[#57534E]">
            {monthlySpendTotal === null ? "Exchange rates are unavailable; totals remain separated by currency." : exchangeRates ? `Converted to ${displayCurrency} using ${exchangeRates.date} reference rates.` : `Amounts are already in ${displayCurrency}; no conversion was needed.`}
          </p>}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#57534E]">
            <span>{summary.activeSubscriptionCount} active subscriptions</span>
            <span>{renewalsWithin30Days} renewing in the next 30 days</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CurrencyPreferenceSelect currency={displayCurrency} />
          <Link href="/import" className="inline-flex w-fit items-center rounded-lg bg-[#9A3412] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12]">
            Import a bank statement
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Main content: the subscriptions list itself, no card wrapper */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#57534E]">
              Subscriptions
            </h2>
            <span className="text-sm text-[#57534E]">{subscriptions.length} saved</span>
          </div>

          <SubscriptionList subscriptions={subscriptions} displayCurrency={displayCurrency} exchangeRates={exchangeRates} />
          <div className="mt-10">
            <SubscriptionForm categories={categories} />
          </div>
          <div className="mt-6">
            <CategoryManager categories={categories} />
          </div>
        </div>

        {/* Sidebar: filled background instead of another white bordered card */}
        <div className="space-y-8">
          <div className="rounded-xl bg-[#1C1917] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
                Upcoming renewals
              </h2>
              <Link href="/renewals" className="text-xs font-medium text-white underline decoration-white/50 underline-offset-4 hover:text-white/80">
                View schedule
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {summary.upcomingRenewals.length === 0 ? (
              <p className="text-sm text-white/90">No renewals on your list yet.</p>
              ) : (
                summary.upcomingRenewals.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="min-w-0 truncate">{r.name}</span>
                    <span className="shrink-0 text-white/90">
                      {formatDate(r.renewalDate)} · {displayAmount(r.cost, r.currency, displayCurrency, exchangeRates)}
                    {r.currency !== displayCurrency && <span className="block text-xs text-white/80">Original: {formatCurrency(r.cost, r.currency)}</span>}
                      </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {categoryBreakdown.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#57534E]">
                By category
              </h2>
              <div className="mt-4 space-y-3">
                {categoryBreakdown.map((item) => (
                  <div key={`${item.currency}:${item.name}`}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-[#1C1917]">{item.name}</span>
                      <span className="text-[#57534E]">
                        {formatCurrency(item.cost, item.currency)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1C1917]/8">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
