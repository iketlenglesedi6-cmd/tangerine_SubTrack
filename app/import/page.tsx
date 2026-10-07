import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { StatementImporter } from "@/components/statement-importer";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
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
    <PageShell className="max-w-4xl px-5 py-10 sm:px-6 sm:py-12">
      <PageHeader
        eyebrow="Use your own transaction history"
        title="Find recurring charges"
        description="SubTrack groups repeated bank transactions to find likely subscriptions. You review the matches and choose what to track; it never changes or cancels anything with a service provider."
        actions={<ActionLink href="/dashboard">Back to dashboard</ActionLink>}
        className="gap-3"
      />

      <StatementImporter
        alreadyTracked={subscriptions.map((subscription) => ({
          name: subscription.name,
        }))}
      />
    </PageShell>
  );
}
