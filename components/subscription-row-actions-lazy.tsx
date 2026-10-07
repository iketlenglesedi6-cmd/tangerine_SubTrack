"use client";

import dynamic from "next/dynamic";
import { useState, type SyntheticEvent } from "react";
import type { DashboardSubscription } from "@/components/subscription-list";

const SubscriptionRowActions = dynamic(
  () => import("@/components/subscription-row-actions").then((module) => module.SubscriptionRowActions),
  { loading: () => <span className="text-xs text-[#57534E]">Loading actions…</span> },
);

export function SubscriptionRowActionsLazy({
  subscription,
  existingSubscriptions,
}: {
  subscription: DashboardSubscription;
  existingSubscriptions: DashboardSubscription[];
}) {
  const [hasOpened, setHasOpened] = useState(false);

  function loadWhenOpened(event: SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open) setHasOpened(true);
  }

  return (
    <details className="group shrink-0" onToggle={loadWhenOpened}>
      <summary className="min-h-10 cursor-pointer list-none rounded-lg border border-[#1C1917]/20 px-3 py-2 text-sm font-medium text-[#7C2D12] transition hover:border-[#9A3412] hover:bg-[#FFF7ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]">
        Actions
      </summary>
      {hasOpened && (
        <div className="mt-3 rounded-xl border border-[#1C1917]/10 bg-white p-3">
          <SubscriptionRowActions subscription={subscription} existingSubscriptions={existingSubscriptions} />
        </div>
      )}
    </details>
  );
}
