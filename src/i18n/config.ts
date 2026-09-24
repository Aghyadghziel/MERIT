/** The two languages. English is served without a prefix, Arabic under /ar. */
export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);
export const dirOf = (l: Locale) => (l === 'ar' ? 'rtl' : 'ltr');

/** A path in the given language: '/women' → '/ar/women' for Arabic. */
export function localePath(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const bare = stripLocale(href);
  if (locale === DEFAULT_LOCALE) return bare;
  return bare === '/' ? '/ar' : `/ar${bare}`;
}

/** The path without its language prefix: '/ar/women?x=1' → '/women?x=1'. */
export function stripLocale(path: string): string {
  const m = path.match(/^\/(ar|en)(?=\/|\?|#|$)/);
  if (!m) return path;
  const rest = path.slice(m[0].length);
  return rest === '' || rest.startsWith('?') || rest.startsWith('#') ? `/${rest}` : rest;
}
