"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SubscriptionRowActions } from "@/components/subscription-row-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { formatCurrency, SUPPORTED_CURRENCIES } from "@/src/lib/currency";
import { convertCurrencyAmount, type ExchangeRates, type SupportedCurrency } from "@/src/lib/currency";
import { getDateInputToday, isDateInputInPast, PAST_RENEWAL_DATE_MESSAGE } from "@/src/lib/date-input";
import { getNextRenewalDate } from "@/src/lib/renewals";
import { duplicateSubscriptionMessage, normalizeSubscriptionName } from "@/src/lib/subscription-name";

export type DashboardSubscription = {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: string;
  renewalDate: string;
  status: string;
  categoryName: string;
};

export function SubscriptionList({
  subscriptions,
  displayCurrency,
  exchangeRates,
}: {
  subscriptions: DashboardSubscription[];
  displayCurrency: SupportedCurrency;
  exchangeRates: ExchangeRates | null;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => [...new Set(subscriptions.map((subscription) => subscription.categoryName))].sort(),
    [subscriptions],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return subscriptions.filter((subscription) => {
      const matchesQuery = !query ||
        subscription.name.toLocaleLowerCase().includes(query) ||
        subscription.categoryName.toLocaleLowerCase().includes(query);
      const matchesStatus = status === "all" || subscription.status === status;
      const matchesCategory = category === "all" || subscription.categoryName === category;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [subscriptions, search, status, category]);
  const activeFilterCount = Number(status !== "all") + Number(category !== "all");

  function exportCsv() {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const lines = [
      ["Name", "Price", "Currency", "Billing cycle", "Next renewal", "Status", "Category"].map(escape).join(","),
      ...filtered.map((subscription) => [
        subscription.name,
        subscription.cost,
        subscription.currency,
        subscription.billingCycle,
        subscription.renewalDate.slice(0, 10),
        subscription.status,
        subscription.categoryName,
      ].map(escape).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "subtrack-subscriptions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="subscription-search">Search subscriptions</label>
        <input
          id="subscription-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or category"
          className="min-w-0 flex-1 rounded-lg border border-[#1C1917]/20 bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#57534E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
        />
        <details className="group relative">
          <summary className="flex h-full cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-[#1C1917]/20 bg-white px-3 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9]">
            Filters{activeFilterCount > 0 && <span className="rounded-full bg-[#FAFAF9] px-1.5 text-xs">{activeFilterCount}</span>}
          </summary>
          <div className="absolute right-0 z-10 mt-2 grid w-60 gap-3 rounded-xl border border-[#1C1917]/15 bg-white p-4 shadow-lg">
            <label className="text-xs font-medium text-[#57534E]" htmlFor="subscription-status">Status
              <select id="subscription-status" value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 bg-white px-3 py-2 text-sm text-[#1C1917]">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="canceled">Canceled</option>
              </select>
            </label>
            <label className="text-xs font-medium text-[#57534E]" htmlFor="subscription-category">Category
              <select id="subscription-category" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 bg-white px-3 py-2 text-sm text-[#1C1917]">
                <option value="all">All categories</option>
                {categories.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
          </div>
        </details>
        <button type="button" onClick={exportCsv} disabled={filtered.length === 0} className="rounded-lg border border-[#1C1917]/20 px-3 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50">
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          compact
          className="border-t border-[#1C1917]/10"
          title={subscriptions.length === 0 ? "Nothing added yet" : "No matching subscriptions"}
          description={subscriptions.length === 0 ? "Use the form below to track your first subscription." : "Try changing your search or filters."}
        />
      ) : (
        <div className="divide-y divide-[#1C1917]/10 border-t border-[#1C1917]/10">
          {filtered.map((subscription) => (
            <div key={subscription.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1C1917]">{subscription.name}</p>
                <p className="text-sm text-[#57534E]">
                  {subscription.categoryName} · {subscription.billingCycle === "yearly" ? "yearly" : "monthly"}
                  {subscription.status === "canceled" && " · canceled"}
                </p>
              </div>
              <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:gap-6">
                <div className="text-right">
                  {(() => {
                    const converted = convertCurrencyAmount(subscription.cost, subscription.currency, displayCurrency, exchangeRates);
                    return <>
                      <p className="font-medium text-[#1C1917]">{formatCurrency(converted ?? subscription.cost, converted === null ? subscription.currency : displayCurrency)}</p>
                      {converted !== null && subscription.currency !== displayCurrency && <p className="text-xs text-[#57534E]">Original: {formatCurrency(subscription.cost, subscription.currency)}</p>}
                    </>;
                  })()}
                  <p className="text-sm text-[#57534E]">{new Date(subscription.renewalDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                </div>
                <SubscriptionRowActions subscription={subscription} existingSubscriptions={subscriptions} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

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
          {duplicate && (
            <div className="sm:col-span-2">
              <InlineFeedback message={duplicateSubscriptionMessage(duplicate.name)} tone="error" />
            </div>
          )}
          <label className="text-sm font-medium text-[#1C1917]">Price<input required type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2" /></label>
          <label className="text-sm font-medium text-[#1C1917]">Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2">{SUPPORTED_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
          <label className="text-sm font-medium text-[#1C1917]">Billing cycle<select value={billingCycle} onChange={(event) => setBillingCycle(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2"><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label>
          <label className="text-sm font-medium text-[#1C1917] sm:col-span-2">
            Next renewal
            <input
              required
              type="date"
              min={getDateInputToday()}
              value={renewalDate}
              onChange={(event) => {
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
              }}
              className="mt-1 block w-full rounded-lg border border-[#1C1917]/20 px-3 py-2"
            />
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
