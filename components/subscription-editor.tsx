"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardSubscription } from "@/components/subscription-list";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { SUPPORTED_CURRENCIES } from "@/src/lib/currency";
import { getDateInputToday, isDateInputInPast, PAST_RENEWAL_DATE_MESSAGE } from "@/src/lib/date-input";
import { getNextRenewalDate } from "@/src/lib/renewals";
import { duplicateSubscriptionMessage, normalizeSubscriptionName } from "@/src/lib/subscription-name";

export function SubscriptionEditor({
  subscription,
  existingSubscriptions,
}: {
  subscription: DashboardSubscription;
  existingSubscriptions: DashboardSubscription[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"neutral" | "error" | "success">("neutral");
  const [name, setName] = useState(subscription.name);
  const [cost, setCost] = useState(String(subscription.cost));
  const [currency, setCurrency] = useState(subscription.currency);
  const [billingCycle, setBillingCycle] = useState(subscription.billingCycle);
  const [renewalDate, setRenewalDate] = useState(
    getNextRenewalDate(subscription.renewalDate, subscription.billingCycle).slice(0, 10),
  );
  const duplicate = existingSubscriptions.find(
    (item) => item.id !== subscription.id && normalizeSubscriptionName(item.name) === normalizeSubscriptionName(name),
  );

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setMessageTone("neutral");
    if (duplicate) {
      setMessageTone("error");
      setMessage(duplicateSubscriptionMessage(duplicate.name));
      setIsSaving(false);
      return;
    }
    if (isDateInputInPast(renewalDate)) {
      setMessageTone("error");
      setMessage(PAST_RENEWAL_DATE_MESSAGE);
      setIsSaving(false);
      return;
    }
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cost: Number(cost), currency, billingCycle, renewalDate }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to update subscription.");
      setMessageTone("success");
      setMessage("Saved.");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Unable to update subscription.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className="text-sm font-medium text-[#9A3412] underline underline-offset-2">
        {isOpen ? "Close edit" : "Edit"}
      </button>
      {isOpen && (
        <form onSubmit={save} className="mt-3 grid gap-3 rounded-xl border border-[#1C1917]/15 bg-white p-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#1C1917]">Name<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2" /></label>
          {duplicate && <div className="sm:col-span-2"><InlineFeedback message={duplicateSubscriptionMessage(duplicate.name)} tone="error" /></div>}
          <label className="text-sm font-medium text-[#1C1917]">Price<input required type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2" /></label>
          <label className="text-sm font-medium text-[#1C1917]">Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2">{SUPPORTED_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
          <label className="text-sm font-medium text-[#1C1917]">Billing cycle<select value={billingCycle} onChange={(event) => setBillingCycle(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2"><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label>
          <label className="text-sm font-medium text-[#1C1917] sm:col-span-2">
            Next renewal
            <input required type="date" min={getDateInputToday()} value={renewalDate} onChange={(event) => {
              const nextDate = event.target.value;
              setRenewalDate(nextDate);
              const isPastDate = isDateInputInPast(nextDate);
              event.currentTarget.setCustomValidity(isPastDate ? PAST_RENEWAL_DATE_MESSAGE : "");
              if (isPastDate) {
                setMessageTone("error");
                setMessage(PAST_RENEWAL_DATE_MESSAGE);
              } else if (message === PAST_RENEWAL_DATE_MESSAGE) {
                setMessage("");
                setMessageTone("neutral");
              }
            }} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2" />
          </label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={isSaving || Boolean(duplicate)} className="rounded-lg bg-[#9A3412] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C2D12] disabled:opacity-60">{duplicate ? "Already on your list" : isSaving ? "Saving..." : "Save changes"}</button>
            {message && <InlineFeedback message={message} tone={messageTone} />}
          </div>
        </form>
      )}
    </div>
  );
}
