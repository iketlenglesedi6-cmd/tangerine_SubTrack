import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userSubscriptions = subscriptions.filter((sub) => sub.userId === userId || sub.userId === "demo-user");

  return NextResponse.json(calculateDashboardSummary(userSubscriptions));
}
