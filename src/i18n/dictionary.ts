import type { Locale } from './config';
import { AR } from './ar';

/**
 * Strings are keyed by their English text, so the English source reads as
 * itself and a missing Arabic entry simply falls back to English.
 * Placeholders: {name} in both the key and the translation.
 */
export type Vars = Record<string, string | number>;

export function translate(locale: Locale, s: string, vars?: Vars): string {
  let out = locale === 'ar' ? AR[s] ?? s : s;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

export type T = (s: string, vars?: Vars) => string;
export const makeT = (locale: Locale): T => (s, vars) => translate(locale, s, vars);
