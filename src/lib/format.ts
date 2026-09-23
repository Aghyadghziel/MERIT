/**
 * Prices are held in SAR, the label's home currency. The other rates are
 * indicative only and are labelled as such wherever a converted price is shown
 * — a real store would price each market separately.
 */
export const CURRENCIES = {
  SAR: { label: 'SAR', name: 'Saudi riyal', rate: 1, locale: 'en-SA' },
  USD: { label: 'USD', name: 'US dollar', rate: 0.267, locale: 'en-US' },
  EUR: { label: 'EUR', name: 'Euro', rate: 0.246, locale: 'en-IE' },
  GBP: { label: 'GBP', name: 'Pound sterling', rate: 0.211, locale: 'en-GB' },
  AED: { label: 'AED', name: 'UAE dirham', rate: 0.98, locale: 'en-AE' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export const currencyCodes = Object.keys(CURRENCIES) as CurrencyCode[];

export function formatPrice(sar: number, code: CurrencyCode = 'SAR') {
  const { rate, locale } = CURRENCIES[code];
  const value = Math.round(sar * rate);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(value);
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;
