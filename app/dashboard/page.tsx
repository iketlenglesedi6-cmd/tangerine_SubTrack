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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8 md:px-8 md:py-10">
      <header className="rounded-[1.75rem] border border-[#e7ddd2] bg-[#fbf8f4] p-6 shadow-[0_10px_28px_rgba(31,26,23,0.03)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#7a5b3a]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-zinc-900 sm:text-4xl">
              Monthly spend overview
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2d6c8] bg-white px-3 py-2 text-sm text-zinc-600">
            <span className="h-2 w-2 rounded-full bg-[#7a5b3a]" />
            Updated today
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Monthly spend
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-zinc-900">
            {currency(summary.totalMonthlySpend)}
          </p>
          <p className="mt-2 text-sm text-zinc-600">Across active subscriptions</p>
        </div>

        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Active
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-zinc-900">
            {summary.activeSubscriptionCount}
          </p>
          <p className="mt-2 text-sm text-zinc-600">Currently running</p>
        </div>

        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Renewals
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-zinc-900">
            {summary.upcomingRenewals.length}
          </p>
          <p className="mt-2 text-sm text-zinc-600">Due this cycle</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
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
          <h2 className="text-xl font-bold text-zinc-900">Summary</h2>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#f0e6dc] pb-3">
              <span className="text-sm text-zinc-600">Recurring total</span>
              <strong className="text-base font-bold text-zinc-900">
                {currency(summary.totalMonthlySpend)}
              </strong>
            </div>
            <div className="flex items-center justify-between border-b border-[#f0e6dc] pb-3">
              <span className="text-sm text-zinc-600">Active items</span>
              <strong className="text-base font-bold text-zinc-900">
                {summary.activeSubscriptionCount}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Next due</span>
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
            Most recurring costs are steady and manageable this month.
          </div>
        </aside>
      </section>
    </main>
  );
}
