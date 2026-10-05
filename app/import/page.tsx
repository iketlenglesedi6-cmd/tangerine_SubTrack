import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { StatementImporter } from "@/components/statement-importer";
import { db } from "@/src/prisma/db";

export const metadata: Metadata = {
  title: "Import transactions | SubTrack",
  description: "Find recurring charges in your bank statement and add them to SubTrack.",
};

export default async function ImportPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const subscriptions = await db.orm.public.Subscription.where({ userId }).all();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-3 border-b border-[#1C1917]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#78716C]">Use your own transaction history</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#1C1917]">Find recurring charges</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#57534E]">
            SubTrack groups repeated bank transactions to find likely subscriptions. You review the matches and choose
            what to track; it never changes or cancels anything with a service provider.
          </p>
        </div>
        <Link href="/dashboard" className="w-fit text-sm font-medium text-[#9A3412] underline underline-offset-2">
          Back to dashboard
        </Link>
      </header>

      <StatementImporter
        alreadyTracked={subscriptions.map((subscription) => ({
          name: subscription.name,
          currency: subscription.currency,
        }))}
      />
    </main>
  );
}
