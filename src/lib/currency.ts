export const SUPPORTED_CURRENCIES = ["AUD", "CAD", "EUR", "GBP", "JPY", "NZD", "USD", "ZAR"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

export function formatCurrency(value: number, currency: string) {
  const safeCurrency = isSupportedCurrency(currency) ? currency : "USD";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 2,
  }).format(value);
}

const REGION_CURRENCY: Record<string, SupportedCurrency> = {
  AU: "AUD", CA: "CAD", GB: "GBP", JP: "JPY", NZ: "NZD", ZA: "ZAR", US: "USD",
  AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR", ES: "EUR", FI: "EUR",
  FR: "EUR", GR: "EUR", HR: "EUR", IE: "EUR", IT: "EUR", LT: "EUR", LU: "EUR",
  LV: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SI: "EUR", SK: "EUR",
};

export function currencyForLocale(locale: string | null | undefined): SupportedCurrency {
  if (!locale) return "ZAR";
  try {
    const region = new Intl.Locale(locale).maximize().region;
    return currencyForCountry(region);
  } catch {
    return "ZAR";
  }
}

export function currencyForCountry(country: string | null | undefined): SupportedCurrency {
  return REGION_CURRENCY[(country ?? "").toUpperCase()] ?? "ZAR";
}

export type ExchangeRates = {
  date: string;
  rates: Partial<Record<SupportedCurrency, number>>;
};

export function convertCurrencyAmount(
  amount: number,
  from: string,
  to: string,
  exchangeRates: ExchangeRates | null,
) {
  if (from === to) return amount;
  if (!exchangeRates || !isSupportedCurrency(from) || !isSupportedCurrency(to)) return null;
  const fromRate = from === "EUR" ? 1 : exchangeRates.rates[from];
  const toRate = to === "EUR" ? 1 : exchangeRates.rates[to];
  if (!fromRate || !toRate) return null;
  return amount / fromRate * toRate;
}
