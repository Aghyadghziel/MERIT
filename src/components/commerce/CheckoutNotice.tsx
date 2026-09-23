'use client';

import { Price } from '@/components/commerce/Price';
import { useStore } from '@/components/providers/Store';
import { getProduct } from '@/lib/catalog';
import { plural } from '@/lib/format';

/** The order that would have been placed, shown for completeness. */
export function CheckoutNotice() {
  const { bag, subtotal, count, ready } = useStore();
  if (!ready || count === 0) return null;

  return (
    <div className="rule-t">
      <h2 className="label pt-4">What is in the bag</h2>
      <ul className="mt-6 space-y-4 text-sm">
        {bag.map((line) => {
          const p = getProduct(line.slug);
          if (!p) return null;
          return (
            <li key={`${line.slug}-${line.colour}-${line.size}`} className="flex justify-between gap-4">
              <span className="min-w-0">
                <span className="block">{p.name}</span>
                <span className="label-sm mt-1 block text-mute">
                  {line.colour} · {line.size} · <span className="nums">{line.qty}</span>
                </span>
              </span>
              <Price amount={p.price * line.qty} className="shrink-0" />
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex justify-between border-t border-line pt-4">
        <span className="label">{plural(count, 'piece')}</span>
        <Price amount={subtotal} size="lg" />
      </div>
    </div>
  );
}
