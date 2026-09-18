import test from "node:test";
import assert from "node:assert/strict";

import { calculateDashboardSummary } from "./dashboard";

test("dashboard summary totals active subscriptions and sorts upcoming renewals", () => {
  const summary = calculateDashboardSummary([
    {
      id: "sub_1",
      name: "Spotify",
      cost: 15,
      billingCycle: "monthly",
      renewalDate: "2026-09-15T00:00:00.000Z",
      status: "active",
      userId: "user_1",
      categoryId: "cat_1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "sub_2",
      name: "Adobe",
      cost: 300,
      billingCycle: "yearly",
      renewalDate: "2026-09-20T00:00:00.000Z",
      status: "active",
      userId: "user_1",
      categoryId: "cat_2",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "sub_3",
      name: "Old Service",
      cost: 9,
      billingCycle: "monthly",
      renewalDate: "2026-08-10T00:00:00.000Z",
      status: "canceled",
      userId: "user_1",
      categoryId: "cat_3",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]);

  assert.equal(summary.totalMonthlySpend, 40);
  assert.equal(summary.activeSubscriptionCount, 2);
  assert.deepEqual(
    summary.upcomingRenewals.map((item) => item.name),
    ["Spotify", "Adobe"]
  );
});
