"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/src/lib/currency";

export function CurrencyPreferenceSelect({
  currency,
}: {
  currency: SupportedCurrency;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currency);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function updateCurrency(nextCurrency: SupportedCurrency) {
    setValue(nextCurrency);
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/currency-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: nextCurrency }),
      });
      if (!response.ok) throw new Error("Could not save the currency setting.");
      router.refresh();
    } catch (cause) {
      setValue(currency);
      setError(cause instanceof Error ? cause.message : "Could not save the currency setting.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <label className="inline-flex flex-wrap items-center gap-2 text-sm font-medium text-[#1C1917]">
      Display currency
      <select
        value={value}
        disabled={isSaving}
        onChange={(event) => updateCurrency(event.target.value as SupportedCurrency)}
        className="rounded-lg border border-[#1C1917]/20 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
      >
        {SUPPORTED_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
      </select>
      <span className="basis-full text-xs font-normal text-[#57534E]">Suggested from your region; change it any time.</span>
      {error && <span role="status" className="basis-full text-xs text-red-800">{error}</span>}
    </label>
  );
}
