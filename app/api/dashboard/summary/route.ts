import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { calculateDashboardSummary } from "@/src/lib/dashboard";
import { db } from "@/src/prisma/db";

function toDashboardRecord(record: {
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
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.orm.public.Subscription.where({ userId }).all();
  const summary = calculateDashboardSummary(rows.map(toDashboardRecord));

  return NextResponse.json(summary);
}
