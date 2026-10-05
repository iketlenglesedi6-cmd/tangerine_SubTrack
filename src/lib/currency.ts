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
