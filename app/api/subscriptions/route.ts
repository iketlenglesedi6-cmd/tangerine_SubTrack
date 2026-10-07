import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { isSupportedCurrency } from "@/src/lib/currency";
import {
  getDateInputToday,
  isDateInputInPast,
  isValidDateInput,
  PAST_RENEWAL_DATE_MESSAGE,
} from "@/src/lib/date-input";

function serializeSubscription(record: {
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

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const name = String(body.name ?? "Untitled subscription").trim();

  if (!name) {
    return NextResponse.json({ error: "Subscription name is required" }, { status: 400 });
  }

  const cost = Number(body.cost ?? 0);
  if (!Number.isFinite(cost) || cost < 0) {
    return NextResponse.json({ error: "Cost must be a non-negative number" }, { status: 400 });
  }

  const currency = String(body.currency ?? "USD").toUpperCase();
  if (!isSupportedCurrency(currency)) {
    return NextResponse.json({ error: "Choose a supported currency" }, { status: 400 });
  }

  const billingCycle = String(body.billingCycle ?? "monthly");
  if (billingCycle !== "monthly" && billingCycle !== "yearly") {
    return NextResponse.json({ error: "Billing cycle must be monthly or yearly" }, { status: 400 });
  }

  const status = String(body.status ?? "active");
  if (status !== "active" && status !== "canceled") {
    return NextResponse.json({ error: "Status must be active or canceled" }, { status: 400 });
  }

  const renewalDateInput = String(body.renewalDate ?? getDateInputToday()).slice(0, 10);
  if (!isValidDateInput(renewalDateInput)) {
    return NextResponse.json({ error: "Choose a valid renewal date." }, { status: 400 });
  }
  if (isDateInputInPast(renewalDateInput)) {
    return NextResponse.json({ error: PAST_RENEWAL_DATE_MESSAGE }, { status: 400 });
  }
  const renewalDate = new Date(`${renewalDateInput}T12:00:00.000Z`);

  const categoryName = String(body.categoryName ?? body.category ?? "General").trim() || "General";
  const categoryValue = Number(body.categoryId ?? 0);

  if (body.categoryId !== undefined && (!Number.isSafeInteger(categoryValue) || categoryValue < 1)) {
    return NextResponse.json({ error: "Category id must be a positive integer" }, { status: 400 });
  }

  let categoryId: number | null = body.categoryId === undefined ? null : categoryValue;

  if (categoryId) {
    const ownedCategory = await db.orm.public.Category.where({ id: categoryId, userId }).first();
    if (!ownedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
  }

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
    cost,
    currency,
    billingCycle,
    renewalDate: renewalDate.toISOString(),
    status,
    userId,
    categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json(serializeSubscription(record), { status: 201 });
}
