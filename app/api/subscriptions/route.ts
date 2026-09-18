import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
];

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(subscriptions.filter((sub) => sub.userId === userId || sub.userId === "demo-user"));
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const next = {
    id: `sub_${Date.now()}`,
    name: String(body.name ?? "Untitled subscription"),
    cost: Number(body.cost ?? 0),
    billingCycle: String(body.billingCycle ?? "monthly"),
    renewalDate: new Date(body.renewalDate ?? Date.now()).toISOString(),
    status: String(body.status ?? "active"),
    userId,
    categoryId: String(body.categoryId ?? "uncategorized"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  subscriptions.push(next);

  return NextResponse.json(next, { status: 201 });
}
