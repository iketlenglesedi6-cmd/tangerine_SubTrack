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
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  const existing = await db.orm.public.Category.where({ id: numericId, userId }).first();
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const body: unknown = await request.json();
  const name =
    typeof body === "object" && body !== null && "name" in body && typeof body.name === "string"
      ? body.name.trim()
      : "";
  if (!name) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const duplicate = await db.orm.public.Category.where({ userId, name }).first();
  if (duplicate && duplicate.id !== numericId) {
    return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 });
  }

  const updated = await db.orm.public.Category.where({ id: numericId, userId }).update({ name });
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
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  const existing = await db.orm.public.Category.where({ id: numericId, userId }).first();
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const subscriptions = await db.orm.public.Subscription.where({ categoryId: numericId, userId }).all();
  if (subscriptions.length > 0) {
    return NextResponse.json(
      { error: "Move or delete this category's subscriptions before deleting the category" },
      { status: 409 }
    );
  }

  await db.orm.public.Category.where({ id: numericId, userId }).delete();
  return NextResponse.json({ success: true });
}