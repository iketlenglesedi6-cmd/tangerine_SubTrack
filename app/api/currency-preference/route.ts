import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isSupportedCurrency } from "@/src/lib/currency";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let currency: unknown;
  try {
    currency = (await request.json()).currency;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  if (typeof currency !== "string" || !isSupportedCurrency(currency)) {
    return NextResponse.json({ error: "Choose a supported currency" }, { status: 400 });
  }

  const response = NextResponse.json({ currency });
  response.cookies.set("subtrack-display-currency", currency, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
