import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";

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
  if (!Number.isInteger(numericId) || numericId < 1) {
    return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });
  }

  const existing = await db.orm.public.Subscription.where({ id: numericId, userId }).first();
  if (!existing) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (body.cost !== undefined) {
    updates.cost = Number(body.cost);
  }
  if (typeof body.billingCycle === "string") {
    updates.billingCycle = body.billingCycle;
  }
  if (body.renewalDate) {
    updates.renewalDate = new Date(body.renewalDate).toISOString();
  }
  if (typeof body.status === "string") {
    updates.status = body.status;
  }

  const updated = await db.orm.public.Subscription.where({ id: numericId }).update(updates);

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
  if (!Number.isInteger(numericId) || numericId < 1) {
    return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });
  }

  const existing = await db.orm.public.Subscription.where({ id: numericId, userId }).first();
  if (!existing) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  await db.orm.public.Subscription.where({ id: numericId }).delete();

  return NextResponse.json({ success: true });
}
