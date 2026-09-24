'use client';

import { useStore } from '@/components/providers/Store';
import { useLocale, useT } from '@/i18n/client';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';

const SIZE = {
  xs: 'text-xs',
  sm: 'text-sm',
  lg: 'text-base',
  /** The product page: the price reads as the second line of the name. */
  xl: 'text-lg md:text-xl tracking-[-0.015em]',
} as const;

/**
 * Prices render in SAR on the server and re-render in the chosen currency once
 * the store has hydrated, so the first paint is never blank.
 */
export function Price({
  amount, compareAt, className, size = 'sm',
}: { amount: number; compareAt?: number; className?: string; size?: keyof typeof SIZE }) {
  const { currency, ready } = useStore();
  const locale = useLocale();
  const t = useT();
  const code = ready ? currency : 'SAR';
  return (
    <span className={cn('nums inline-flex items-baseline gap-2', SIZE[size], className)}>
      <span className={cn(compareAt ? 'text-oxide' : null)}>{formatPrice(amount, code, locale)}</span>
      {compareAt ? (
        <span className="text-[0.8em] text-mute line-through">
          <span className="sr-only">{t('Was')} </span>
          {formatPrice(compareAt, code, locale)}
        </span>
      ) : null}
    </span>
  );
}
