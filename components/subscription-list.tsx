"use client";

import { useMemo, useState } from "react";

import { SubscriptionRowActionsLazy } from "@/components/subscription-row-actions-lazy";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/src/lib/currency";
import { convertCurrencyAmount, type ExchangeRates, type SupportedCurrency } from "@/src/lib/currency";

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
                <SubscriptionRowActionsLazy subscription={subscription} existingSubscriptions={subscriptions} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
