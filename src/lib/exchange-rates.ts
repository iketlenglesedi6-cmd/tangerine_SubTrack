import { SUPPORTED_CURRENCIES, type ExchangeRates, type SupportedCurrency } from "@/src/lib/currency";

type FrankfurterRate = { date: string; base: string; quote: string; rate: number };

export async function getExchangeRates(): Promise<ExchangeRates | null> {
  const quotes = SUPPORTED_CURRENCIES.filter((currency) => currency !== "EUR").join(",");
  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?base=EUR&quotes=${quotes}`,
      { next: { revalidate: 21_600 } },
    );
    if (!response.ok) return null;
    const result: unknown = await response.json();
    if (!Array.isArray(result)) return null;
    const rates: Partial<Record<SupportedCurrency, number>> = { EUR: 1 };
    let date = "";
    for (const entry of result as FrankfurterRate[]) {
      if (!entry || typeof entry.quote !== "string" || typeof entry.rate !== "number") continue;
      if (SUPPORTED_CURRENCIES.includes(entry.quote as SupportedCurrency) && entry.rate > 0) {
        rates[entry.quote as SupportedCurrency] = entry.rate;
        date = entry.date;
      }
    }
    if (SUPPORTED_CURRENCIES.some((currency) => !rates[currency])) return null;
    return { date, rates };
  } catch {
    return null;
  }
}
