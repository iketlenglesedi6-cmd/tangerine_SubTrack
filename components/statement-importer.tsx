"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ActionLink } from "@/components/ui/action-link";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { SectionHeading } from "@/components/ui/section-heading";

import { findRecurringCharges, guessColumn, parseCsv, type StatementRow } from "@/src/lib/bank-statement";
import { formatCurrency, SUPPORTED_CURRENCIES } from "@/src/lib/currency";
import { normalizeSubscriptionName } from "@/src/lib/subscription-name";

type TrackedSubscription = { name: string };

const DATE_ORDER_OPTIONS = [
  { value: "DMY", label: "Day / month / year" },
  { value: "MDY", label: "Month / day / year" },
] as const;

export function StatementImporter({
  alreadyTracked,
}: {
  alreadyTracked: TrackedSubscription[];
}) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [dateColumn, setDateColumn] = useState("");
  const [descriptionColumn, setDescriptionColumn] = useState("");
  const [amountColumn, setAmountColumn] = useState("");
  const [currencyColumn, setCurrencyColumn] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [expenseSign, setExpenseSign] = useState<"positive" | "negative">("positive");
  const [dateOrder, setDateOrder] = useState<"DMY" | "MDY">("DMY");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");

  const candidates = useMemo(
    () => findRecurringCharges({ rows, dateColumn, descriptionColumn, amountColumn, currencyColumn, currency, expenseSign, dateOrder }),
    [rows, dateColumn, descriptionColumn, amountColumn, currencyColumn, currency, expenseSign, dateOrder],
  );
  const trackedKeys = new Set(
    alreadyTracked.map((subscription) => normalizeSubscriptionName(subscription.name)),
  );

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setRows([]);
    setHeaders([]);
    setSelected(new Set());
    setSaved(new Set());

    if (file.size > 2_000_000) {
      setMessage("Choose a CSV smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    try {
      const parsed = parseCsv(await file.text());
      const headerRow = parsed[0]?.map((header) => header.trim()) ?? [];
      if (headerRow.length < 2 || parsed.length < 2) {
        throw new Error("This file needs a header row and at least one transaction.");
      }

      const dateIndex = guessColumn(headerRow, "date");
      const descriptionIndex = guessColumn(headerRow, "description");
      const amountIndex = guessColumn(headerRow, "amount");
      const currencyIndex = guessColumn(headerRow, "currency");

      const statementRows = parsed.slice(1).map((record) =>
        Object.fromEntries(headerRow.map((header, index) => [header, record[index] ?? ""])),
      );
      setFileName(file.name);
      setHeaders(headerRow);
      setRows(statementRows);
      setDateColumn(dateIndex >= 0 ? headerRow[dateIndex] : "");
      setDescriptionColumn(descriptionIndex >= 0 ? headerRow[descriptionIndex] : "");
      setAmountColumn(amountIndex >= 0 ? headerRow[amountIndex] : "");
      setCurrencyColumn(currencyIndex >= 0 ? headerRow[currencyIndex] : "");
      if (dateIndex < 0 || descriptionIndex < 0 || amountIndex < 0) {
        setMessage("I couldn’t identify every column automatically. Choose the date, description, and amount columns below.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to read this CSV file.");
      event.target.value = "";
    }
  }

  function toggleSelection(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectNewCandidates() {
    setSelected(new Set(candidates.filter((candidate) => {
      const trackedKey = normalizeSubscriptionName(candidate.name);
      return !trackedKeys.has(trackedKey) && !saved.has(candidate.key);
    }).map((candidate) => candidate.key)));
  }

  async function importSelected() {
    const toImport = candidates.filter((candidate) => selected.has(candidate.key));
    if (toImport.length === 0) {
      setMessage("Select at least one new recurring charge to import.");
      return;
    }

    setIsImporting(true);
    setMessage("");
    let importedCount = 0;
    let failedCount = 0;

    for (const candidate of toImport) {
      try {
        const response = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: candidate.name,
            cost: candidate.cost,
            currency: candidate.currency,
            billingCycle: candidate.billingCycle,
            renewalDate: candidate.renewalDate,
            status: "active",
            categoryName: candidate.categoryName,
          }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to save a subscription.");
        }
        setSaved((current) => new Set(current).add(candidate.key));
        importedCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    setSelected(new Set());
    setMessage(
      failedCount > 0
        ? `Imported ${importedCount}; ${failedCount} could not be saved. Check your dashboard and try again.`
        : `Imported ${importedCount} recurring ${importedCount === 1 ? "charge" : "charges"}.`,
    );
    setIsImporting(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#1C1917]/10 bg-white p-5 sm:p-7">
        <SectionHeading title="Choose a bank statement" variant="card" />
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57534E]">
          Upload a CSV export with transaction dates, descriptions, and amounts. SubTrack looks for repeated charges
          on monthly or yearly cycles, then lets you review each one before saving it. Imported charges keep their
          original currency; the dashboard can convert the display totals. Many banks offer CSV or Excel downloads
          alongside PDFs; this importer currently accepts CSV files only.
        </p>
        <label className="mt-5 block text-sm font-medium text-[#1C1917]" htmlFor="statement-file">
          CSV statement
        </label>
        <input
          id="statement-file"
          type="file"
          accept=".csv,text/csv"
          onChange={readFile}
          className="mt-2 block w-full max-w-xl rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm text-[#1C1917] file:mr-3 file:rounded-md file:border-0 file:bg-[#9A3412] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#57534E]">
          {fileName ? <span>Loaded: {fileName}</span> : <span>Maximum file size: 2 MB.</span>}
          <a
            href="data:text/csv;charset=utf-8,date%2Cdescription%2Camount%0A"
            download="subtrack-statement-template.csv"
            className="font-medium text-[#9A3412] underline underline-offset-2"
          >
            Download the column template
          </a>
          <a href="/sample-bank-statement.csv" download className="font-medium text-[#9A3412] underline underline-offset-2">
            Download fictional sample statement
          </a>
        </div>
        <p className="mt-4 rounded-lg bg-[#FAFAF9] p-3 text-xs leading-5 text-[#57534E]">
          Your statement is read in this browser and is never uploaded. Only the recurring charges you approve are
          sent to SubTrack. Don’t upload a statement you don’t want processed.
        </p>
        <p className="mt-2 text-xs leading-5 text-[#57534E]">
          The sample uses fictional transactions in ZAR and contains no bank account details.
        </p>
      </section>

      {headers.length > 0 && (
        <section className="rounded-2xl border border-[#1C1917]/10 bg-white p-5 sm:p-7">
          <SectionHeading title="Match your statement columns" variant="card" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ColumnPicker label="Date column" value={dateColumn} headers={headers} onChange={setDateColumn} />
            <ColumnPicker label="Description column" value={descriptionColumn} headers={headers} onChange={setDescriptionColumn} />
            <ColumnPicker label="Amount column" value={amountColumn} headers={headers} onChange={setAmountColumn} />
            <ColumnPicker label="Currency column (optional)" value={currencyColumn} headers={headers} onChange={setCurrencyColumn} optional />
            <label className="block text-sm font-medium text-[#1C1917]">
              Fallback currency
              <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm">
                {SUPPORTED_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-[#1C1917]">
              Expense sign
              <select value={expenseSign} onChange={(event) => setExpenseSign(event.target.value as "positive" | "negative")} className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm">
                <option value="positive">Expenses are positive amounts</option>
                <option value="negative">Expenses are negative amounts</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-[#1C1917]">
              Date format
              <select value={dateOrder} onChange={(event) => setDateOrder(event.target.value as "DMY" | "MDY")} className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm">
                {DATE_ORDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div>
            <SectionHeading title="Detected recurring charges" variant="card" />
              <p className="mt-1 text-sm text-[#57534E]">
                Found {candidates.length} possible {candidates.length === 1 ? "subscription" : "subscriptions"}. Currency codes are detected when available; otherwise the fallback is used.
              </p>
            </div>
            {candidates.length > 0 && (
              <button type="button" onClick={selectNewCandidates} className="text-sm font-medium text-[#9A3412] underline underline-offset-2">
                Select all new
              </button>
            )}
          </div>

          {candidates.length === 0 ? (
            <EmptyState
              title="No monthly or yearly repeats found yet"
              description="Detection needs at least two similar charges, 25–40 days apart or 330–400 days apart. You can adjust the columns, currency, date format, or expense sign above."
              className="text-sm leading-6"
            />
          ) : (
            <div className="mt-4 space-y-3">
              {candidates.map((candidate) => {
                const trackedKey = normalizeSubscriptionName(candidate.name);
                const isTracked = trackedKeys.has(trackedKey);
                const isSaved = saved.has(candidate.key);
                return (
                  <label key={candidate.key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${isTracked || isSaved ? "border-emerald-900/20 bg-emerald-50/50" : "border-[#1C1917]/10 hover:border-[#9A3412]/50"}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(candidate.key)}
                      disabled={isTracked || isSaved || isImporting}
                      onChange={() => toggleSelection(candidate.key)}
                      className="mt-1 h-4 w-4 accent-[#9A3412]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <span className="truncate font-medium text-[#1C1917]">{candidate.name}</span>
                        <span className="font-semibold text-[#1C1917]">{formatCurrency(candidate.cost, candidate.currency)}</span>
                      </span>
                      <span className="mt-1 block text-sm text-[#57534E]">
                        {candidate.billingCycle} · {candidate.transactionCount} charges · next expected {new Date(candidate.renewalDate).toLocaleDateString()}
                      </span>
                      <span className="mt-1 block text-xs text-[#57534E]">
                        {isSaved ? "Imported" : isTracked ? "Already tracked" : `${candidate.categoryName} category`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={importSelected}
              disabled={isImporting || selected.size === 0}
              className="rounded-lg bg-[#9A3412] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7C2D12] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImporting ? "Importing…" : `Import ${selected.size} selected`}
            </button>
            <ActionLink href="/dashboard">
              Return to dashboard
            </ActionLink>
          </div>
        </section>
      )}

      {message && <InlineFeedback message={message} className="rounded-lg bg-[#FAFAF9] p-3" />}
    </div>
  );
}

function ColumnPicker({
  label,
  value,
  headers,
  onChange,
  optional = false,
}: {
  label: string;
  value: string;
  headers: string[];
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-[#1C1917]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm"
      >
        <option value="">{optional ? "No currency column" : "Choose column"}</option>
        {headers.map((header, index) => (
          <option key={`${header}-${index}`} value={header}>{header || `Column ${index + 1}`}</option>
        ))}
      </select>
    </label>
  );
}
