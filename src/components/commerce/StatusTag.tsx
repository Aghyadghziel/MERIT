import type { Product } from '@/lib/catalog';
import { statusLabel } from '@/lib/catalog';
import { cn } from '@/lib/cn';

/** A word on a rule, not a badge. No pill, no fill, no colour except on sale. */
export function StatusTag({ product, className }: { product: Product; className?: string }) {
  const status = statusLabel(product);
  if (!status) return null;
  return (
    <span
      className={cn(
        'label-sm border-b pb-0.5',
        status.tone === 'oxide' && 'border-oxide text-oxide',
        status.tone === 'ink' && 'border-ink text-ink',
        status.tone === 'mute' && 'border-mute text-mute',
        className,
      )}
    >
      {status.text}
    </span>
  );
}
