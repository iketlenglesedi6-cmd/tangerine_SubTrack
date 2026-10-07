import { cookies, headers } from "next/headers";

import { currencyForCountry, currencyForLocale, isSupportedCurrency } from "@/src/lib/currency";

export async function getDisplayCurrency() {
  const cookieStore = await cookies();
  const savedCurrency = cookieStore.get("subtrack-display-currency")?.value;
  if (savedCurrency && isSupportedCurrency(savedCurrency)) return savedCurrency;

  const requestHeaders = await headers();
  const country = requestHeaders.get("x-vercel-ip-country");
  if (country) return currencyForCountry(country);
  const firstLocale = requestHeaders.get("accept-language")?.split(",")[0]?.split(";")[0];
  return currencyForLocale(firstLocale);
}
