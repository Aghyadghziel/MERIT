'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE, stripLocale, type Locale } from './config';
import { makeT, type T } from './dictionary';

const Ctx = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);

/** A translate function for the current language, in any Client Component. */
export function useT(): T {
  const locale = useLocale();
  return useMemo(() => makeT(locale), [locale]);
}

/** The current path without its language prefix, for comparing with hrefs. */
export function usePath(): string {
  return stripLocale(usePathname() ?? '/');
}
