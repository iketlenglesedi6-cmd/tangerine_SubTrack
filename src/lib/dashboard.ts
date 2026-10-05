import { getNextRenewalDate } from "@/src/lib/renewals";

export type DashboardSubscription = {
  id: string;
  name: string;
  cost: number;
  currency?: string;
  billingCycle: string;
  renewalDate: string;
  status: string;
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  activeSubscriptionCount: number;
  monthlySpendByCurrency: Array<{
    currency: string;
    monthlySpend: number;
    activeSubscriptionCount: number;
  }>;
  upcomingRenewals: Array<{
    id: string;
    name: string;
    cost: number;
    currency: string;
    renewalDate: string;
  }>;
};

export function calculateDashboardSummary(
  subscriptions: DashboardSubscription[]
): DashboardSummary {
  const now = new Date();
  const activeSubscriptions = subscriptions.filter((item) => item.status === "active");

  const monthlySpend = new Map<string, { total: number; count: number }>();
  for (const subscription of activeSubscriptions) {
    const normalizedCost = Number(subscription.cost) || 0;
    const currency = subscription.currency ?? "USD";
    const current = monthlySpend.get(currency) ?? { total: 0, count: 0 };

    current.total += subscription.billingCycle === "yearly" ? normalizedCost / 12 : normalizedCost;
    current.count += 1;
    monthlySpend.set(currency, current);
  }

  const monthlySpendByCurrency = Array.from(monthlySpend.entries())
    .map(([currency, values]) => ({
      currency,
      monthlySpend: Number(values.total.toFixed(2)),
      activeSubscriptionCount: values.count,
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));

  const upcomingRenewals = [...activeSubscriptions]
    .map((subscription) => ({
      id: subscription.id,
      name: subscription.name,
      cost: Number(subscription.cost) || 0,
      currency: subscription.currency ?? "USD",
      renewalDate: getNextRenewalDate(subscription.renewalDate, subscription.billingCycle, now),
    }));

  upcomingRenewals.sort(
    (left, right) => new Date(left.renewalDate).getTime() - new Date(right.renewalDate).getTime(),
  );

  return {
    activeSubscriptionCount: activeSubscriptions.length,
    monthlySpendByCurrency,
    upcomingRenewals,
  };
}
