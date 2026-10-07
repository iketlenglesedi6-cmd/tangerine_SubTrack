import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { isSupportedCurrency } from "@/src/lib/currency";
import {
  isDateInputInPast,
  isValidDateInput,
  PAST_RENEWAL_DATE_MESSAGE,
} from "@/src/lib/renewals";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) {
    return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });
  }

  const existing = await db.orm.public.Subscription.where({ id: numericId, userId }).first();
  if (!existing) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
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
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (body.cost !== undefined) {
    const cost = Number(body.cost);
    if (!Number.isFinite(cost) || cost < 0) {
      return NextResponse.json({ error: "Cost must be a non-negative number" }, { status: 400 });
    }
    updates.cost = cost;
  }
  if (body.currency !== undefined) {
    const currency = String(body.currency).toUpperCase();
    if (!isSupportedCurrency(currency)) {
      return NextResponse.json({ error: "Choose a supported currency" }, { status: 400 });
    }
    updates.currency = currency;
  }
  if (typeof body.billingCycle === "string") {
    if (body.billingCycle !== "monthly" && body.billingCycle !== "yearly") {
      return NextResponse.json({ error: "Billing cycle must be monthly or yearly" }, { status: 400 });
    }
    updates.billingCycle = body.billingCycle;
  }
  if (body.renewalDate) {
    const renewalDateInput = String(body.renewalDate).slice(0, 10);
    if (!isValidDateInput(renewalDateInput)) {
      return NextResponse.json({ error: "Choose a valid renewal date." }, { status: 400 });
    }
    if (isDateInputInPast(renewalDateInput)) {
      return NextResponse.json({ error: PAST_RENEWAL_DATE_MESSAGE }, { status: 400 });
    }
    updates.renewalDate = new Date(`${renewalDateInput}T12:00:00.000Z`).toISOString();
  }
  if (typeof body.status === "string") {
    if (body.status !== "active" && body.status !== "canceled") {
      return NextResponse.json({ error: "Status must be active or canceled" }, { status: 400 });
    }
    updates.status = body.status;
  }

  const updated = await db.orm.public.Subscription.where({ id: numericId, userId }).update(updates);

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) {
    return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });
  }

  const existing = await db.orm.public.Subscription.where({ id: numericId, userId }).first();
  if (!existing) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  await db.orm.public.Subscription.where({ id: numericId, userId }).delete();

  return NextResponse.json({ success: true });
}
