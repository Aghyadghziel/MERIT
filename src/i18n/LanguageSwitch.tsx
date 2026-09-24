'use client';

import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { cn } from '@/lib/cn';
import { usePath, useLocale } from './client';
import { localePath } from './config';

/**
 * The other language, same page: on /women it links to /ar/women and back.
 * Reads as the language it switches to, in that language's own script.
 */
function Switch({ className }: { className?: string }) {
  const locale = useLocale();
  const path = usePath();
  const q = useSearchParams()?.toString();
  const other = locale === 'ar' ? 'en' : 'ar';
  const href = localePath(path, other) + (q ? `?${q}` : '');
  return (
    <NextLink href={href} hrefLang={other} lang={other} prefetch={false}
      className={cn('label inline-flex min-h-11 items-center transition-opacity hover:opacity-60', className)}
      aria-label={other === 'ar' ? 'العربية — Arabic' : 'English'}>
      {other === 'ar' ? <span className="font-[family-name:var(--font-arabic)] text-[0.95em] tracking-normal normal-case">العربية</span> : 'English'}
    </NextLink>
  );
}

export function LanguageSwitch(props: { className?: string }) {
  return <Suspense fallback={null}><Switch {...props} /></Suspense>;
}
