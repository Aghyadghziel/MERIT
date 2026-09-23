'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Price } from '@/components/commerce/Price';
import { FREE_SHIPPING, useStore } from '@/components/providers/Store';
import { Icon } from '@/components/ui/Icon';
import { getProduct } from '@/lib/catalog';
import { formatPrice, plural } from '@/lib/format';

export function CartView() {
  const { bag, subtotal, count, setQty, remove, currency, ready } = useStore();
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  if (!ready) {
    return <div className="page pt-(--nav-h)"><div className="section-y h-64" /></div>;
  }

  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm">
        <h1 className="display-lg">Shopping bag</h1>
        {count > 0 ? (
          <p className="label nums mt-4 text-mute">{plural(count, 'piece')}</p>
        ) : null}
      </header>

      {count === 0 ? (
        <div className="rule-t max-w-lg py-16">
          <p className="display-md">Your bag is empty.</p>
          <p className="mt-4 text-sm text-mute">
            Nothing here yet. The Index pieces are the place most people start — they are cut from
            the same patterns every year.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/collections/index" className="btn btn-solid">Shop Index</Link>
            <Link href="/new" className="btn">New arrivals</Link>
          </div>
        </div>
      ) : (
        <div className="grid-page pb-(--section)">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <ul className="rule-t">
              {bag.map((line, i) => {
                const p = getProduct(line.slug);
                if (!p) return null;
                return (
                  <li key={`${line.slug}-${line.colour}-${line.size}`} className="flex gap-5 border-b border-line py-6">
                    <Link href={`/products/${p.slug}`} className="w-24 shrink-0 sm:w-32">
                      <div className="frame frame-4-5">
                        <Image src={`/img/${p.images[0]}.webp`} alt="" width={300} height={375} sizes="128px" />
                      </div>
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-sm">
                            <Link href={`/products/${p.slug}`} className="link-rule">{p.name}</Link>
                          </h2>
                          <p className="label-sm mt-2 text-mute">{line.colour} · Size {line.size}</p>
                          <p className="label-sm mt-1.5 text-mute">{p.madeIn}</p>
                        </div>
                        <Price amount={p.price * line.qty} className="shrink-0" />
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-5">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center hover:bg-bone-2"
                            onClick={() => setQty(i, line.qty - 1)}
                            aria-label={line.qty === 1 ? `Remove ${p.name}` : `Decrease quantity of ${p.name}`}
                          >
                            <Icon name={line.qty === 1 ? 'trash' : 'minus'} className="h-3.5 w-3.5" />
                          </button>
                          <span className="nums w-9 text-center text-sm">{line.qty}</span>
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center hover:bg-bone-2 disabled:opacity-40"
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

            <Link href="/new" className="label link-rule mt-8 inline-flex items-center gap-2">
              <Icon name="arrowL" className="h-3.5 w-3.5" />
              Continue shopping
            </Link>
          </div>

          <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
            <div className="rule-t lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <h2 className="label pt-4">Summary</h2>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-mute">Subtotal</dt>
                  <dd><Price amount={subtotal} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mute">Delivery</dt>
                  <dd>{remaining > 0 ? 'Calculated at checkout' : 'Free'}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3">
                  <dt className="label">Total</dt>
                  <dd><Price amount={subtotal} size="lg" /></dd>
                </div>
              </dl>

              {remaining > 0 ? (
                <p className="label-sm mt-5 text-mute">
                  {formatPrice(remaining, currency)} from free delivery in the Gulf
                </p>
              ) : (
                <p className="label-sm mt-5 inline-flex items-center gap-1.5">
                  <Icon name="check" className="h-3.5 w-3.5" /> Free delivery in the Gulf
                </p>
              )}

              <Link href="/checkout" className="btn btn-solid mt-6 w-full">Checkout</Link>

              <ul className="mt-7 space-y-3 text-xs text-mute">
                <li className="flex gap-2.5"><Icon name="truck" className="h-4 w-4 shrink-0" /> Riyadh and Jeddah in two working days.</li>
                <li className="flex gap-2.5"><Icon name="arrowL" className="h-4 w-4 shrink-0" /> Returns within 30 days, unworn.</li>
                <li className="flex gap-2.5"><Icon name="leaf" className="h-4 w-4 shrink-0" /> Packed in unbleached cotton, no plastic.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
