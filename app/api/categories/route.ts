import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const categories = [
  { id: "cat_1", name: "Entertainment", userId: "demo-user" },
  { id: "cat_2", name: "Productivity", userId: "demo-user" },
  { id: "cat_3", name: "Health", userId: "demo-user" },
];

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(categories.filter((category) => category.userId === userId || category.userId === "demo-user"));
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

  const next = { id: `cat_${Date.now()}`, name: value, userId };
  categories.push(next);

  return NextResponse.json(next, { status: 201 });
}
