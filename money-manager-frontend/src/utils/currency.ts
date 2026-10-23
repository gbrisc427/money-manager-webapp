export type SupportedCurrency = "EUR" | "USD";

export const SUPPORTED_CURRENCIES: {
  code: SupportedCurrency;
  symbol: string;
  label: string;
}[] = [
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "USD", symbol: "$", label: "USD ($) - Dólar estadounidense" },
];

export const getCurrencySymbol = (currency?: string): string => {
  return currency?.toUpperCase() === "USD" ? "$" : "€";
};

export const formatCurrency = (
  amount: number | string | undefined | null,
  currency?: string
): string => {
  const numericValue = Number(amount ?? 0);
  const safeValue = Number.isNaN(numericValue) ? 0 : numericValue;
  const symbol = getCurrencySymbol(currency);
  return `${safeValue.toFixed(2)} ${symbol}`;
};
