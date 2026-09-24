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

/** Arabic pages print the currency in Arabic but keep Western digits. */
export function formatPrice(sar: number, code: CurrencyCode = 'SAR', lang: 'en' | 'ar' = 'en') {
  const { rate, locale: fmt } = CURRENCIES[code];
  const value = Math.round(sar * rate);
  const locale = lang === 'ar' ? 'ar-SA-u-nu-latn' : fmt;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(value);
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Arabic counts take four forms: one and two are words of their own
 * ("قطعة وحدة", "قطعتين"), 3–10 take the plural, and 0 and 11 up take the
 * singular after the number. Keyed by the English singular passed to plural().
 */
type ArCount = { one: string; two: string; few: string; many: string };
const AR_COUNT: Record<string, ArCount> = {
  piece: { one: 'قطعة وحدة', two: 'قطعتين', few: 'قطع', many: 'قطعة' },
  collection: { one: 'مجموعة وحدة', two: 'مجموعتين', few: 'مجموعات', many: 'مجموعة' },
  story: { one: 'قصة وحدة', two: 'قصتين', few: 'قصص', many: 'قصة' },
  colour: { one: 'لون واحد', two: 'لونين', few: 'ألوان', many: 'لونًا' },
  size: { one: 'مقاس واحد', two: 'مقاسين', few: 'مقاسات', many: 'مقاسًا' },
  look: { one: 'إطلالة وحدة', two: 'إطلالتين', few: 'إطلالات', many: 'إطلالة' },
  result: { one: 'نتيجة وحدة', two: 'نتيجتين', few: 'نتائج', many: 'نتيجة' },
  item: { one: 'قطعة وحدة', two: 'قطعتين', few: 'قطع', many: 'قطعة' },
  minute: { one: 'دقيقة وحدة', two: 'دقيقتين', few: 'دقايق', many: 'دقيقة' },
  day: { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا' },
};

export function pluralAr(n: number, f: ArCount) {
  const m = n % 100;
  if (n === 1) return f.one;
  if (n === 2) return f.two;
  if (m >= 3 && m <= 10) return `${n} ${f.few}`;
  return `${n} ${f.many}`;
}

/**
 * "3 pieces". Pass the page's language as the fourth argument for Arabic;
 * a noun without Arabic forms above falls back to the English.
 */
export const plural = (n: number, one: string, many = `${one}s`, lang: 'en' | 'ar' = 'en') => {
  const ar = lang === 'ar' ? AR_COUNT[one] : undefined;
  return ar ? pluralAr(n, ar) : `${n} ${n === 1 ? one : many}`;
};
