import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { calculateDashboardSummary } from "@/src/lib/dashboard";

const subscriptions = [
  {
    id: "sub_1",
    name: "Netflix",
    cost: 15.99,
    billingCycle: "monthly",
    renewalDate: "2026-09-18T00:00:00.000Z",
    status: "active",
    userId: "demo-user",
    categoryId: "cat_1",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "sub_2",
    name: "Adobe Creative Cloud",
    cost: 59.99,
    billingCycle: "monthly",
    renewalDate: "2026-09-22T00:00:00.000Z",
    status: "active",
    userId: "demo-user",
    categoryId: "cat_2",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "sub_3",
    name: "Gym Membership",
    cost: 35,
    billingCycle: "monthly",
    renewalDate: "2026-09-28T00:00:00.000Z",
    status: "canceled",
    userId: "demo-user",
    categoryId: "cat_3",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "sub_4",
    name: "Spotify Family",
    cost: 16.99,
    billingCycle: "monthly",
    renewalDate: "2026-09-27T00:00:00.000Z",
    status: "active",
    userId: "demo-user",
    categoryId: "cat_4",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
];

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
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const summary = calculateDashboardSummary(
    subscriptions.filter(
      (sub) => sub.userId === userId || sub.userId === "demo-user"
    )
  );

  const activeSubscriptions = subscriptions.filter(
    (sub) => (sub.userId === userId || sub.userId === "demo-user") && sub.status === "active"
  );
  const biggestSubscription = [...activeSubscriptions].sort(
    (left, right) => right.cost - left.cost
  )[0];
  const watchList = activeSubscriptions.filter((sub) => sub.cost >= 25);

  const categoryBreakdown = [
    { name: "Entertainment", value: 42, cost: 105, color: "bg-[#d9a35d]" },
    { name: "Productivity", value: 33, cost: 82, color: "bg-[#4f6c87]" },
    { name: "Fitness", value: 18, cost: 46, color: "bg-[#7aa07c]" },
    { name: "Other", value: 7, cost: 18, color: "bg-[#d9c7b7]" },
  ];

  const actions = [
    "Netflix and Spotify are small individually but add up fast.",
    "Adobe is your single highest monthly cost and deserves a quick review.",
    "You have 4 renewals coming soon; plan your budget before they hit.",
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8 md:px-8 md:py-10">
      <header className="rounded-[1.75rem] border border-[#e7ddd2] bg-[#fbf8f4] p-6 shadow-[0_10px_28px_rgba(31,26,23,0.03)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#7a5b3a]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-zinc-900 sm:text-4xl">
              Your subscriptions are under control.
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2d6c8] bg-white px-3 py-2 text-sm text-zinc-600">
            <span className="h-2 w-2 rounded-full bg-[#7a5b3a]" />
            Updated today
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Monthly spend
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-zinc-900">
            {currency(summary.totalMonthlySpend)}
          </p>
          <p className="mt-2 text-sm text-zinc-600">Across {summary.activeSubscriptionCount} active plans</p>
        </div>

        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Biggest cost
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-zinc-900">
            {biggestSubscription ? currency(biggestSubscription.cost) : "$0.00"}
          </p>
          <p className="mt-2 text-sm text-zinc-600">{biggestSubscription ? biggestSubscription.name : "No active plans"}</p>
        </div>

        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Watchlist
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-zinc-900">
            {watchList.length}
          </p>
          <p className="mt-2 text-sm text-zinc-600">Subscriptions over $25</p>
        </div>

        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Renewals soon
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-zinc-900">
            {summary.upcomingRenewals.length}
          </p>
          <p className="mt-2 text-sm text-zinc-600">Due in this cycle</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[1.75rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Upcoming renewals</h2>
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-zinc-500">
              By date
            </span>
          </div>

          <div className="space-y-3">
            {summary.upcomingRenewals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dcc9b4] bg-white p-6 text-center text-zinc-600">
                No upcoming renewals yet.
              </div>
            ) : (
              summary.upcomingRenewals.map((renewal) => (
                <div
                  key={renewal.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#e7ddd2] bg-white p-4"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{renewal.name}</p>
                    <p className="text-sm text-zinc-500">{formatDate(renewal.renewalDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#3b2d23]">{currency(renewal.cost)}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-zinc-500">Due</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[#e7ddd2] bg-white p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <h2 className="text-xl font-bold text-zinc-900">Smart summary</h2>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#f0e6dc] pb-3">
              <span className="text-sm text-zinc-600">Recurring total</span>
              <strong className="text-base font-bold text-zinc-900">
                {currency(summary.totalMonthlySpend)}
              </strong>
            </div>
            <div className="flex items-center justify-between border-b border-[#f0e6dc] pb-3">
              <span className="text-sm text-zinc-600">Current plan count</span>
              <strong className="text-base font-bold text-zinc-900">
                {summary.activeSubscriptionCount}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Next renewal</span>
              <strong className="text-base font-bold text-zinc-900">
                {summary.upcomingRenewals[0]
                  ? new Date(summary.upcomingRenewals[0].renewalDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#f6f1ea] p-4 text-sm leading-6 text-zinc-700">
            {watchList.length > 0
              ? `Your biggest cost is ${biggestSubscription?.name ?? "an active subscription"}. It is worth reviewing before the next renewal window.`
              : "Your recurring spend is balanced and predictable right now."}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.75rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <h2 className="text-xl font-bold text-zinc-900">Spend by category</h2>
          <div className="mt-5 space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
                  <span>{item.name}</span>
                  <span>{currency(item.cost)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#f0e7df]">
                  <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <h2 className="text-xl font-bold text-zinc-900">Actionable insights</h2>
          <div className="mt-5 space-y-3">
            {actions.map((action) => (
              <div key={action} className="flex gap-3 rounded-2xl border border-[#e7ddd2] bg-white p-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3d9a7] text-xs font-bold text-[#3d2b1e]">
                  ✓
                </div>
                <p className="text-sm leading-6 text-zinc-700">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
