"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionEditor, type DashboardSubscription } from "@/components/subscription-list";

export function SubscriptionRowActions({
  subscription,
}: {
  subscription: DashboardSubscription;
}) {
  const { id, status: currentStatus } = subscription;
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState("");

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
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this subscription? This can't be undone.")) return;
    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to delete subscription.");
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <SubscriptionEditor subscription={subscription} />
      <button
        onClick={toggleStatus}
        disabled={isWorking}
        className="text-[#78716C] underline decoration-dotted underline-offset-4 hover:text-[#1C1917] disabled:opacity-50"
      >
        {currentStatus === "active" ? "Mark canceled" : "Reactivate tracking"}
      </button>
      {message ? <span role="status" className="basis-full text-xs text-red-700">{message}</span> : null}
      <button
        onClick={handleDelete}
        disabled={isWorking}
        className="text-[#78716C] underline decoration-dotted underline-offset-4 hover:text-red-600 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
