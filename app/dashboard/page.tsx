import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SubTrack",
  description: "Track your active subscriptions, upcoming renewals, and monthly spend in one place.",
};

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SubscriptionForm } from "@/components/subscription-form";
import { SubscriptionRowActions } from "@/components/subscription-row-actions";
import { CategoryManager } from "@/components/category-manager";
import { calculateDashboardSummary } from "@/src/lib/dashboard";
import { formatCurrency } from "@/src/lib/currency";
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
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const categoryTotals = new Map<string, number>();
  for (const sub of activeSubscriptions) {
    const key = `${sub.currency}\u0000${sub.categoryName}`;
    categoryTotals.set(
      key,
      (categoryTotals.get(key) ?? 0) + monthlyCost(sub.cost, sub.billingCycle),
    );
  }
  const monthlyTotalsByCurrency = new Map(
    summary.monthlySpendByCurrency.map((item) => [item.currency, item.monthlySpend]),
  );
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
              {summary.monthlySpendByCurrency.map((item) => (
                <p key={item.currency} className="text-4xl font-semibold tracking-tight text-[#1C1917]">
                  {formatCurrency(item.monthlySpend, item.currency)}
                  <span className="ml-2 text-base font-normal text-[#57534E]">/ month</span>
                </p>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#57534E]">
            <span>{summary.activeSubscriptionCount} active subscriptions</span>
            <span>{renewalsWithin30Days} renewing in the next 30 days</span>
          </div>
        </div>
        <Link
          href="/import"
          className="inline-flex w-fit items-center rounded-lg bg-[#9A3412] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12]"
        >
          Import a bank statement
        </Link>
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

          {subscriptions.length === 0 ? (
            <p className="border-t border-[#1C1917]/8 py-8 text-sm text-[#57534E]">
              Nothing added yet — use the form to track your first subscription.
            </p>
          ) : (
            <div className="divide-y divide-[#1C1917]/8 border-t border-[#1C1917]/8">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
                  <div>
                    <p className="font-medium text-[#1C1917]">{sub.name}</p>
                    <p className="text-sm text-[#57534E]">
                      {sub.categoryName} · {sub.billingCycle === "yearly" ? "yearly" : "monthly"}
                      {sub.status === "canceled" && " · canceled"}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:gap-6">
                    <div className="text-right">
                      <p className="font-medium text-[#1C1917]">
                        {formatCurrency(sub.cost, sub.currency)}
                      </p>
                      <p className="text-sm text-[#57534E]">{formatDate(sub.renewalDate)}</p>
                    </div>
                    <SubscriptionRowActions id={sub.id} currentStatus={sub.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

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
                      {formatDate(r.renewalDate)} · {formatCurrency(r.cost, r.currency)}
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
