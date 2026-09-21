"use client";

import { useState } from "react";

export function SubscriptionForm() {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("9.99");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [status, setStatus] = useState("active");
  const [categoryName, setCategoryName] = useState("Entertainment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a subscription name.");
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
          billingCycle,
          renewalDate: renewalDate || new Date().toISOString(),
          status,
          categoryName,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to save subscription.");
      }

      setName("");
      setCost("9.99");
      setBillingCycle("monthly");
      setRenewalDate("");
      setStatus("active");
      setCategoryName("Entertainment");
      setMessage("Subscription saved.");
      window.location.reload();
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F97316]">
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
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#F97316]"
          />
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#F97316]"
          />
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Billing cycle
          <select
            value={billingCycle}
            onChange={(event) => setBillingCycle(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#F97316]"
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
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#F97316]"
          >
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Renewal date
          <input
            type="date"
            value={renewalDate}
            onChange={(event) => setRenewalDate(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#F97316]"
          />
        </label>

        <label className="block text-sm font-medium text-[#1C1917]">
          Category
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Entertainment"
            className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none transition focus:border-[#F97316]"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#F97316] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save subscription"}
        </button>

        {message ? <p className="text-sm text-[#78716C]">{message}</p> : null}
      </div>
    </form>
  );
}
