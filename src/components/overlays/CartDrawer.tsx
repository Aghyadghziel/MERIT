'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Panel } from '@/components/overlays/Panel';
import { Price } from '@/components/commerce/Price';
import { FREE_SHIPPING, useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { getProduct } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';

export function CartDrawer() {
  const { overlay, close } = useUi();
  const { bag, subtotal, count, setQty, remove, currency, ready } = useStore();
  const isOpen = overlay === 'cart';
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  return (
    <Panel open={isOpen} onClose={close} label="Shopping bag" from="right">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-(--gutter) pr-2">
        <h2 className="label">
          Shopping bag {count > 0 ? <span className="nums text-mute">({count})</span> : null}
        </h2>
        <button type="button" className="icon-btn mr-2" onClick={close} aria-label="Close bag">
          <Icon name="close" />
        </button>
      </div>

      {count === 0 ? (
        <div className="flex flex-1 flex-col justify-center px-(--gutter) py-16" data-panel-item>
          <p className="display-md">Your bag is empty.</p>
          <p className="mt-4 max-w-xs text-sm text-mute">
            Nothing saved yet. Start with the pieces that set the proportions for the rest of the
            range.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/new" className="btn btn-solid" onClick={close}>New arrivals</Link>
            <Link href="/collections/foundation" className="btn" onClick={close}>Foundation AW26</Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="no-bar flex-1 overflow-y-auto px-(--gutter)">
            {bag.map((line, i) => {
              const p = getProduct(line.slug);
              if (!p) return null;
              return (
                <li key={`${line.slug}-${line.colour}-${line.size}`} className="flex gap-4 border-b border-line py-5" data-panel-item>
                  <Link href={`/products/${p.slug}`} onClick={close} className="w-20 shrink-0">
                    <div className="frame frame-4-5">
                      <Image src={`/img/${p.images[0]}.webp`} alt="" width={200} height={250} sizes="80px" />
                    </div>
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm">
                          <Link href={`/products/${p.slug}`} onClick={close} className="link-rule">{p.name}</Link>
                        </h3>
                        <p className="label-sm mt-1.5 text-mute">
                          {line.colour} · Size {line.size}
                        </p>
                      </div>
                      <Price amount={p.price * line.qty} className="shrink-0" />
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-bone-2 disabled:opacity-40"
                          onClick={() => setQty(i, line.qty - 1)}
                          aria-label={line.qty === 1 ? `Remove ${p.name}` : `Decrease quantity of ${p.name}`}
                        >
                          <Icon name={line.qty === 1 ? 'trash' : 'minus'} className="h-3.5 w-3.5" />
                        </button>
                        <span className="nums w-8 text-center text-sm" aria-label={`Quantity ${line.qty}`}>
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-bone-2 disabled:opacity-40"
                          onClick={() => setQty(i, line.qty + 1)}
                          disabled={line.qty >= 9}
                          aria-label={`Increase quantity of ${p.name}`}
                        >
                          <Icon name="plus" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button type="button" className="label-sm text-mute hover:text-ink" onClick={() => remove(i)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="shrink-0 border-t border-line px-(--gutter) py-5">
            <div data-panel-item>
              {remaining > 0 ? (
                <p className="label-sm text-mute">
                  {formatPrice(remaining, ready ? currency : 'SAR')} from free delivery in the Gulf
                </p>
              ) : (
                <p className="label-sm inline-flex items-center gap-1.5 text-ink">
                  <Icon name="check" className="h-3.5 w-3.5" /> Free delivery in the Gulf
                </p>
              )}
              <div className="mt-2 h-px w-full bg-line" role="presentation">
                <div
                  className="h-px bg-ink transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between" data-panel-item>
              <span className="label">Subtotal</span>
              <Price amount={subtotal} size="lg" />
            </div>
            <p className="mt-1.5 text-xs text-mute" data-panel-item>
              Duties and taxes calculated at checkout. Delivery in Riyadh within two working days.
            </p>

            <div className="mt-5 flex flex-col gap-2.5" data-panel-item>
              <Link href="/checkout" className="btn btn-solid" onClick={close}>Checkout</Link>
              <div className="flex gap-2.5">
                <Link href="/cart" className="btn btn-ghost flex-1" onClick={close}>View bag</Link>
                <button type="button" className="btn btn-ghost flex-1" onClick={close}>Continue</button>
              </div>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
