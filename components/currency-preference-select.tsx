"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/src/lib/currency";
import { InlineFeedback } from "@/components/ui/inline-feedback";

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
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]">
        Currency <span className="text-[#57534E]">{value}</span><span aria-hidden="true" className="text-xs">⌄</span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-[#1C1917]/15 bg-white p-4 shadow-lg">
        <label className="block text-sm font-medium text-[#1C1917]">
          Display currency
          <select
            value={value}
            disabled={isSaving}
            onChange={(event) => updateCurrency(event.target.value as SupportedCurrency)}
            className="mt-2 w-full rounded-lg border border-[#1C1917]/20 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
          >
            {SUPPORTED_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        </label>
        <p className="mt-2 text-xs leading-5 text-[#57534E]">Suggested from your region; change it any time.</p>
        {error && <InlineFeedback message={error} tone="error" className="mt-2 text-xs" />}
      </div>
    </details>
  );
}
