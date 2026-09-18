export type DashboardSubscription = {
  id: string;
  name: string;
  cost: number;
  billingCycle: string;
  renewalDate: string;
  status: string;
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  totalMonthlySpend: number;
  activeSubscriptionCount: number;
  upcomingRenewals: Array<{
    id: string;
    name: string;
    cost: number;
    renewalDate: string;
  }>;
};

export function calculateDashboardSummary(
  subscriptions: DashboardSubscription[]
): DashboardSummary {
  const activeSubscriptions = subscriptions.filter((item) => item.status === "active");

  const totalMonthlySpend = activeSubscriptions.reduce((sum, subscription) => {
    const normalizedCost = Number(subscription.cost) || 0;

    if (subscription.billingCycle === "yearly") {
      return sum + normalizedCost / 12;
    }

    return sum + normalizedCost;
  }, 0);

  const upcomingRenewals = [...activeSubscriptions]
    .sort(
      (left, right) =>
        new Date(left.renewalDate).getTime() - new Date(right.renewalDate).getTime()
    )
    .map((subscription) => ({
      id: subscription.id,
      name: subscription.name,
      cost: Number(subscription.cost) || 0,
      renewalDate: subscription.renewalDate,
    }));

  return {
    totalMonthlySpend: Number(totalMonthlySpend.toFixed(2)),
    activeSubscriptionCount: activeSubscriptions.length,
    upcomingRenewals,
  };
}
