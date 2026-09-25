import { cn } from '@/lib/cn';
import { PAYMENT_METHODS } from '@/lib/saudi';

/**
 * The payment methods a Saudi reader expects to see, for the Arabic pages.
 * Each is a name in a hairline box, and the row says in words that online
 * payment is not open yet.
 */
export function PaymentMethods({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'bone' }) {
  const bone = tone === 'bone';
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}>
      <ul aria-label="طرق الدفع" className="flex flex-wrap gap-1.5">
        {PAYMENT_METHODS.map((m) => (
          <li
            key={m}
            className={cn(
              'label-sm border px-2 py-1 normal-case leading-none',
              bone ? 'border-line-ink-2 text-bone/80' : 'border-line-2 text-mute',
            )}
            lang={/^[A-Za-z]/.test(m) ? 'en' : undefined}
          >
            {m}
          </li>
        ))}
      </ul>
      <p className={cn('label-sm', bone ? 'text-mute-ink' : 'text-mute')}>تتفعّل قريب</p>
    </div>
  );
}
