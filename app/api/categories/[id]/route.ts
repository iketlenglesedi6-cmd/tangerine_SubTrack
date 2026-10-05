import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedCategory(id: string, userId: string) {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) return null;

  const category = await db.orm.public.Category.where({ id: numericId, userId }).first();
  return category ?? null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const category = await getOwnedCategory(id, userId);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const name =
    typeof body === "object" && body !== null && "name" in body && typeof body.name === "string"
      ? body.name.trim()
      : "";
  if (!name) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const duplicate = await db.orm.public.Category.where({ userId, name }).first();
  if (duplicate && duplicate.id !== category.id) {
    return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 });
  }

  const updated = await db.orm.public.Category.where({ id: category.id, userId }).update({ name });
  if (!updated) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: String(updated.id),
    name: updated.name,
    userId: updated.userId,
    createdAt: new Date(updated.createdAt).toISOString(),
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const category = await getOwnedCategory(id, userId);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const linkedSubscription = await db.orm.public.Subscription
    .where({ categoryId: category.id, userId })
    .first();
  if (linkedSubscription) {
    return NextResponse.json(
      { error: "Move or delete this category's subscriptions before deleting the category" },
      { status: 409 },
    );
  }

  await db.orm.public.Category.where({ id: category.id, userId }).delete();
  return NextResponse.json({ success: true });
}
