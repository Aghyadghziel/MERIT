'use client';

import { useStore } from '@/components/providers/Store';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * Prices render in SAR on the server and re-render in the chosen currency once
 * the store has hydrated, so the first paint is never blank.
 */
export function Price({
  amount, compareAt, className, size = 'sm',
}: { amount: number; compareAt?: number; className?: string; size?: 'sm' | 'lg' }) {
  const { currency, ready } = useStore();
  const code = ready ? currency : 'SAR';
  return (
    <span className={cn('nums inline-flex items-baseline gap-2', size === 'lg' ? 'text-base' : 'text-sm', className)}>
      <span className={cn(compareAt ? 'text-oxide' : null)}>{formatPrice(amount, code)}</span>
      {compareAt ? (
        <span className="text-mute line-through">
          <span className="sr-only">Was </span>
          {formatPrice(compareAt, code)}
        </span>
      ) : null}
    </span>
  );
}
