"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscriptionForm({ categories }: { categories: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [status, setStatus] = useState("active");
  const [categoryName, setCategoryName] = useState(categories[0]?.name ?? "General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a subscription name.");
      return;
    }
    if (!renewalDate) {
      setMessage("Choose the next expected renewal date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          cost: Number(cost || 0),
          currency,
          billingCycle,
          renewalDate: new Date(`${renewalDate}T12:00:00`).toISOString(),
          status,
          categoryName,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to save subscription.");
      }

      setName("");
      setCost("");
      setCurrency("ZAR");
      setBillingCycle("monthly");
      setRenewalDate("");
      setStatus("active");
      setCategoryName(categories[0]?.name ?? "General");
      setMessage("Subscription saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[#1C1917]/8 bg-white p-5"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A3412]">
          Add subscription
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#1C1917]">
          Track a new recurring expense
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-[#1C1917]">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Netflix"
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#9A3412]"
          />
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            placeholder="12.99"
            onChange={(event) => setCost(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#9A3412]"
          />
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Currency
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#9A3412]"
          >
            <option value="ZAR">ZAR · South African rand</option>
            <option value="USD">USD · US dollar</option>
            <option value="EUR">EUR · Euro</option>
            <option value="GBP">GBP · British pound</option>
            <option value="CAD">CAD · Canadian dollar</option>
            <option value="AUD">AUD · Australian dollar</option>
            <option value="NZD">NZD · New Zealand dollar</option>
            <option value="JPY">JPY · Japanese yen</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Billing cycle
          <select
            value={billingCycle}
            onChange={(event) => setBillingCycle(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#9A3412]"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#9A3412]"
          >
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Renewal date
          <input
            type="date"
            required
            value={renewalDate}
            onChange={(event) => setRenewalDate(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#9A3412]"
          />
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Category
          <select
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#9A3412]"
          >
            <option value="General">General</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#9A3412] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save subscription"}
        </button>

        {message ? <p className="text-sm text-[#57534E]">{message}</p> : null}
      </div>
      <p className="text-xs text-[#57534E]">
        SubTrack tracks the subscription and its next renewal; it does not cancel or change your provider account.
      </p>
    </form>
  );
}
