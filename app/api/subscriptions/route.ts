import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";

function serializeSubscription(record: {
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
    category: record.category ?? null,
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.orm.public.Subscription
    .where({ userId })
    .include("category", (category) => category.select("id", "name"))
    .all();

  return NextResponse.json(rows.map(serializeSubscription));
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "Untitled subscription").trim();

  if (!name) {
    return NextResponse.json({ error: "Subscription name is required" }, { status: 400 });
  }

  const categoryName = String(body.categoryName ?? body.category ?? "General").trim() || "General";
  const categoryValue = Number(body.categoryId ?? 0);

  let categoryId = Number.isFinite(categoryValue) && categoryValue > 0 ? categoryValue : null;

  if (!categoryId) {
    const existingCategory = await db.orm.public.Category.where({ userId, name: categoryName }).first();

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const createdCategory = await db.orm.public.Category.create({
        name: categoryName,
        userId,
        createdAt: new Date().toISOString(),
      });
      categoryId = createdCategory.id;
    }
  }

  const record = await db.orm.public.Subscription.create({
    name,
    cost: Number(body.cost ?? 0),
    billingCycle: String(body.billingCycle ?? "monthly"),
    renewalDate: new Date(body.renewalDate ?? Date.now()).toISOString(),
    status: String(body.status ?? "active"),
    userId,
    categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json(serializeSubscription(record), { status: 201 });
}
