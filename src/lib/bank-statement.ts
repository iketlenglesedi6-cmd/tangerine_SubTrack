import { getNextRenewalDate } from "./renewals";

export type StatementRow = Record<string, string>;

export type RecurringCharge = {
  key: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  lastChargedAt: string;
  renewalDate: string;
  transactionCount: number;
  categoryName: string;
};

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  const delimiterCounts = new Map([[",", 0], [";", 0], ["\t", 0]]);
  let inHeaderQuote = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"' && input[index + 1] === '"' && inHeaderQuote) {
      index += 1;
    } else if (character === '"') {
      inHeaderQuote = !inHeaderQuote;
    } else if (character === "\n" || character === "\r") {
      break;
    } else if (!inHeaderQuote && delimiterCounts.has(character)) {
      delimiterCounts.set(character, (delimiterCounts.get(character) ?? 0) + 1);
    }
  }
  const delimiter = [...delimiterCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? ",";

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

export function guessColumn(headers: string[], role: "date" | "description" | "amount") {
  const aliases = {
    date: ["date", "transaction date", "posted date", "posting date", "trans date"],
    description: ["description", "merchant", "details", "payee", "transaction description", "narrative"],
    amount: ["amount", "transaction amount", "value", "debit", "withdrawal"],
  }[role];
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase().replace(/[_-]+/g, " "));
  const exact = normalizedHeaders.findIndex((header) => aliases.includes(header));
  if (exact >= 0) return exact;

  return normalizedHeaders.findIndex((header) =>
    aliases.some((alias) => header.includes(alias)),
  );
}

function parseTransactionDate(value: string, dateOrder: "DMY" | "MDY") {
  const input = value.trim();
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(input);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return date;
  }

  const localMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(input);
  if (!localMatch) return null;
  const first = Number(localMatch[1]);
  const second = Number(localMatch[2]);
  const year = Number(localMatch[3]);
  const day = dateOrder === "DMY" ? first : second;
  const month = dateOrder === "DMY" ? second : first;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

function parseAmount(value: string) {
  const raw = value.trim();
  const isParenthesizedNegative = raw.startsWith("(") && raw.endsWith(")");
  let amountText = raw.replace(/[()\s]/g, "").replace(/[^\d,.-]/g, "");
  const lastComma = amountText.lastIndexOf(",");
  const lastDot = amountText.lastIndexOf(".");

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      amountText = amountText.replace(/\./g, "").replace(",", ".");
    } else {
      amountText = amountText.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    const decimals = amountText.length - lastComma - 1;
    amountText = decimals === 2 ? amountText.replace(",", ".") : amountText.replace(/,/g, "");
  }

  const amount = Number(amountText);
  if (!Number.isFinite(amount)) return null;
  return isParenthesizedNegative ? -Math.abs(amount) : amount;
}

function merchantKey(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/\b(visa|debit|card|purchase|payment|transaction|online|pos|pending)\b/g, " ")
    .replace(/\b\d{3,}\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function guessCategory(name: string) {
  const merchant = name.toLowerCase();
  if (/netflix|spotify|showmax|disney|youtube|prime video|apple music/.test(merchant)) {
    return "Entertainment";
  }
  if (/adobe|microsoft|google|dropbox|notion|github|canva/.test(merchant)) {
    return "Software";
  }
  if (/telkom|vodacom|mtn|cell c|fibre|internet/.test(merchant)) {
    return "Utilities";
  }
  return "Imported";
}

export function findRecurringCharges({
  rows,
  dateColumn,
  descriptionColumn,
  amountColumn,
  currency,
  expenseSign,
  dateOrder,
}: {
  rows: StatementRow[];
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  currency: string;
  expenseSign: "positive" | "negative";
  dateOrder: "DMY" | "MDY";
}) {
  const groups = new Map<string, Array<{ date: Date; amount: number; description: string }>>();

  for (const row of rows) {
    const date = parseTransactionDate(row[dateColumn] ?? "", dateOrder);
    const amount = parseAmount(row[amountColumn] ?? "");
    const description = (row[descriptionColumn] ?? "").trim();
    if (!date || amount === null || !description) continue;
    if (expenseSign === "positive" ? amount <= 0 : amount >= 0) continue;

    const key = merchantKey(description);
    if (key.length < 2) continue;
    const transactions = groups.get(key) ?? [];
    transactions.push({ date, amount: Math.abs(amount), description });
    groups.set(key, transactions);
  }

  const candidates: RecurringCharge[] = [];
  for (const [key, transactions] of groups) {
    if (transactions.length < 2) continue;
    transactions.sort((left, right) => left.date.getTime() - right.date.getTime());
    const intervals = transactions.slice(1).map((transaction, index) => {
      const previous = transactions[index];
      return (transaction.date.getTime() - previous.date.getTime()) / 86_400_000;
    });
    const isMonthly = intervals.every((days) => days >= 25 && days <= 40);
    const isYearly = intervals.every((days) => days >= 330 && days <= 400);
    if (!isMonthly && !isYearly) continue;

    const amounts = transactions.map((transaction) => transaction.amount).sort((left, right) => left - right);
    const medianAmount = amounts[Math.floor(amounts.length / 2)];
    if (medianAmount === 0) continue;
    const amountSpread = (amounts[amounts.length - 1] - amounts[0]) / medianAmount;
    if (amountSpread > 0.15) continue;

    const latest = transactions[transactions.length - 1];
    const billingCycle = isYearly ? "yearly" : "monthly";
    const renewalDate = getNextRenewalDate(latest.date.toISOString(), billingCycle);
    candidates.push({
      key,
      name: latest.description,
      cost: Number(latest.amount.toFixed(2)),
      currency,
      billingCycle,
      lastChargedAt: latest.date.toISOString(),
      renewalDate,
      transactionCount: transactions.length,
      categoryName: guessCategory(latest.description),
    });
  }

  return candidates.sort(
    (left, right) => new Date(left.renewalDate).getTime() - new Date(right.renewalDate).getTime(),
  );
}
