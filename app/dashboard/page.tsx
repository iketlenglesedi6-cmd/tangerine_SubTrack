import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SubscriptionForm } from "@/components/subscription-form";
import { calculateDashboardSummary } from "@/src/lib/dashboard";
import { db } from "@/src/prisma/db";

const CATEGORY_COLORS = ["#F97316", "#1C1917", "#059669", "#A8A29E", "#EA580C"];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

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

  const subscriptions = rows.map(normalizeSubscription);
  const summary = calculateDashboardSummary(subscriptions);
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const biggest = [...activeSubscriptions].sort((a, b) => b.cost - a.cost)[0];

  const categoryTotals = new Map<string, number>();
  for (const sub of activeSubscriptions) {
    categoryTotals.set(
      sub.categoryName,
      (categoryTotals.get(sub.categoryName) ?? 0) + monthlyCost(sub.cost, sub.billingCycle)
    );
  }
  const categoryBreakdown = Array.from(categoryTotals.entries())
    .map(([name, cost], i) => ({
      name,
      cost,
      value: summary.totalMonthlySpend > 0 ? Math.round((cost / summary.totalMonthlySpend) * 100) : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.cost - a.cost);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      {/* Hero number — the one bold moment on this page */}
      <div className="mb-10">
        <p className="text-sm text-[#78716C]">You're spending</p>
        <p className="mt-1 text-6xl font-semibold tracking-tight text-[#1C1917]">
          {currency(summary.totalMonthlySpend)}
          <span className="ml-2 text-2xl font-normal text-[#78716C]">/ month</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#78716C]">
          <span>{summary.activeSubscriptionCount} active plans</span>
          {biggest && (
            <span>
              biggest: <span className="text-[#1C1917]">{biggest.name}</span> ({currency(biggest.cost)})
            </span>
          )}
          <span>{summary.upcomingRenewals.length} renewing soon</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Main content: the subscriptions list itself, no card wrapper */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#78716C]">
              Subscriptions
            </h2>
            <span className="text-sm text-[#78716C]">{subscriptions.length} saved</span>
          </div>

          {subscriptions.length === 0 ? (
            <p className="border-t border-[#1C1917]/8 py-8 text-sm text-[#78716C]">
              Nothing added yet — use the form to track your first subscription.
            </p>
          ) : (
            <div className="divide-y divide-[#1C1917]/8 border-t border-[#1C1917]/8">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-[#1C1917]">{sub.name}</p>
                    <p className="text-sm text-[#78716C]">
                      {sub.categoryName} · {sub.billingCycle === "yearly" ? "yearly" : "monthly"}
                      {sub.status === "canceled" && " · canceled"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#1C1917]">{currency(sub.cost)}</p>
                    <p className="text-sm text-[#78716C]">{formatDate(sub.renewalDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10">
            <SubscriptionForm />
          </div>
        </div>

        {/* Sidebar: filled background instead of another white bordered card */}
        <div className="space-y-8">
          <div className="rounded-xl bg-[#1C1917] p-5 text-white">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
              Upcoming renewals
            </h2>
            <div className="mt-4 space-y-3">
              {summary.upcomingRenewals.length === 0 ? (
                <p className="text-sm text-white/60">Nothing due soon.</p>
              ) : (
                summary.upcomingRenewals.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span>{r.name}</span>
                    <span className="text-white/60">{formatDate(r.renewalDate)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {categoryBreakdown.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#78716C]">
                By category
              </h2>
              <div className="mt-4 space-y-3">
                {categoryBreakdown.map((item) => (
                  <div key={item.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-[#1C1917]">{item.name}</span>
                      <span className="text-[#78716C]">{currency(item.cost)}</span>
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
