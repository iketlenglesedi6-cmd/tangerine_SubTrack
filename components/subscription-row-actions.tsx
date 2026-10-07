"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionEditor, type DashboardSubscription } from "@/components/subscription-list";
import { InlineFeedback } from "@/components/ui/inline-feedback";

export function SubscriptionRowActions({
  subscription,
  existingSubscriptions,
}: {
  subscription: DashboardSubscription;
  existingSubscriptions: DashboardSubscription[];
}) {
  const { id, status: currentStatus } = subscription;
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<"cancel" | "delete" | null>(null);

  async function toggleStatus() {
    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "active" ? "canceled" : "active",
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to update subscription.");
      }
      setConfirmation(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete() {
    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to delete subscription.");
      }
      setConfirmation(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <SubscriptionEditor subscription={subscription} existingSubscriptions={existingSubscriptions} />
      <button
        onClick={() => currentStatus === "active" ? setConfirmation("cancel") : void toggleStatus()}
        disabled={isWorking}
        className="text-[#57534E] underline decoration-dotted underline-offset-4 hover:text-[#1C1917] disabled:opacity-50"
      >
        {currentStatus === "active" ? "Mark canceled" : "Reactivate tracking"}
      </button>
      {message ? <InlineFeedback message={message} tone="error" className="basis-full text-xs" /> : null}
      <button
        onClick={() => setConfirmation("delete")}
        disabled={isWorking}
        className="text-[#57534E] underline decoration-dotted underline-offset-4 hover:text-red-600 disabled:opacity-50"
      >
        Delete
      </button>
      {confirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/35 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isWorking) setConfirmation(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="subscription-confirm-title"
            aria-describedby="subscription-confirm-description"
            className="w-full max-w-md rounded-3xl border border-[#fed7aa] bg-[#fffaf5] p-6 shadow-2xl"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isWorking) setConfirmation(null);
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ffedd5] p-2">
                <img src="/tangerine-subtrack-logo.webp" alt="Tangerine SubTrack mascot" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c2410c]">Quick check</p>
                <h2 id="subscription-confirm-title" className="mt-1 text-xl font-semibold text-[#1C1917]">
                  {confirmation === "delete" ? "Remove this subscription?" : "Mark this as canceled?"}
                </h2>
              </div>
            </div>
            <p id="subscription-confirm-description" className="mt-4 text-sm leading-6 text-[#57534E]">
              {confirmation === "delete"
                ? `“${subscription.name}” will be removed from your SubTrack list. This won't cancel it with the provider.`
                : `“${subscription.name}” will move to your canceled subscriptions. This only updates SubTrack; it doesn't contact the provider.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={isWorking}
                onClick={() => setConfirmation(null)}
                className="rounded-xl border border-[#d6d3d1] px-4 py-2.5 text-sm font-medium text-[#44403c] hover:bg-white disabled:opacity-60"
              >
                Keep it
              </button>
              <button
                type="button"
                disabled={isWorking}
                onClick={() => void (confirmation === "delete" ? handleDelete() : toggleStatus())}
                className="rounded-xl bg-[#9A3412] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7C2D12] disabled:opacity-60"
              >
                {isWorking ? "One sec…" : confirmation === "delete" ? "Yes, remove it" : "Mark canceled"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
