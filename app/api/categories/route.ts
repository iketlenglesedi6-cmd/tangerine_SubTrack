import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.orm.public.Category.where({ userId }).all();

  return NextResponse.json(rows.map((category) => ({
    id: String(category.id),
    name: category.name,
    userId: category.userId,
    createdAt: new Date(category.createdAt).toISOString(),
  })));
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const value = String(body.name ?? "").trim();

  if (!value) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const existing = await db.orm.public.Category.where({ userId, name: value }).first();

  if (existing) {
    return NextResponse.json({
      id: String(existing.id),
      name: existing.name,
      userId: existing.userId,
      createdAt: new Date(existing.createdAt).toISOString(),
    });
  }

  const created = await db.orm.public.Category.create({
    name: value,
    userId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    id: String(created.id),
    name: created.name,
    userId: created.userId,
    createdAt: new Date(created.createdAt).toISOString(),
  }, { status: 201 });
}
