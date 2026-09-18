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
        headers: {
          "Content-Type": "application/json",
        },
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
      setMessage("Subscription saved successfully.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-[#e7ddd2] bg-[#fbf8f4] p-5 shadow-[0_10px_20px_rgba(31,26,23,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7a5b3a]">
            Add subscription
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.05em] text-zinc-900">
            Track a new recurring expense
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          Subscription name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Netflix"
            className="mt-2 w-full rounded-2xl border border-[#e3d4c0] bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-[#8c6a4b]"
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e3d4c0] bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-[#8c6a4b]"
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Billing cycle
          <select
            value={billingCycle}
            onChange={(event) => setBillingCycle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e3d4c0] bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-[#8c6a4b]"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e3d4c0] bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-[#8c6a4b]"
          >
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Renewal date
          <input
            type="date"
            value={renewalDate}
            onChange={(event) => setRenewalDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e3d4c0] bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-[#8c6a4b]"
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Category
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Entertainment"
            className="mt-2 w-full rounded-2xl border border-[#e3d4c0] bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-[#8c6a4b]"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-[#171513] px-5 py-2.5 text-sm font-semibold text-[#f8f2ee] transition hover:bg-[#2a221f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save subscription"}
        </button>

        {message ? (
          <p className="text-sm text-zinc-700">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
