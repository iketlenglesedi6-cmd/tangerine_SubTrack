"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscriptionRowActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);

  async function toggleStatus() {
    setIsWorking(true);
    try {
      await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "active" ? "canceled" : "active",
        }),
      });
      router.refresh();
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this subscription? This can't be undone.")) return;
    setIsWorking(true);
    try {
      await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={toggleStatus}
        disabled={isWorking}
        className="text-[#78716C] underline decoration-dotted underline-offset-4 hover:text-[#1C1917] disabled:opacity-50"
      >
        {currentStatus === "active" ? "Cancel" : "Reactivate"}
      </button>
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
