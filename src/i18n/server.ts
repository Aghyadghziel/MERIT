import { lang } from 'next/root-params';
import { DEFAULT_LOCALE, isLocale, type Locale } from './config';
import { makeT } from './dictionary';

/** The current language, in any Server Component. */
export async function getLocale(): Promise<Locale> {
  const l = await lang();
  return l && isLocale(l) ? l : DEFAULT_LOCALE;
}

/** A translate function for the current language, in any Server Component. */
export async function getT() {
  return makeT(await getLocale());
}
