'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Price } from '@/components/commerce/Price';
import { StatusTag } from '@/components/commerce/StatusTag';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import type { Product } from '@/lib/catalog';
import { isSoldOut } from '@/lib/catalog';
import { cn } from '@/lib/cn';

/**
 * The buying panel. Sizes that cannot be bought in the chosen colour are
 * disabled and struck through rather than hidden, so the choice is legible;
 * trying to add without a size says what is missing instead of doing nothing.
 */
export function ProductPanel({ product }: { product: Product }) {
  const [colour, setColour] = useState(product.colours[0].name);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const sizeGroup = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const { add, toggleWish, wishlist, markViewed, ready } = useStore();
  const { open } = useUi();

  const sold = isSoldOut(product);
  const saved = ready && wishlist.includes(product.slug);
  const unavailable = (s: string) => product.unavailable?.includes(`${colour}/${s}`) ?? false;
  const low = (s: string) => product.low?.includes(`${colour}/${s}`) ?? false;
  const inStock = product.sizes.filter((s) => !unavailable(s)).length;

  useEffect(() => { markViewed(product.slug); }, [product.slug, markViewed]);

  // Changing colour can invalidate the chosen size.
  useEffect(() => {
    if (size && unavailable(size)) setSize(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colour]);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2600);
    return () => window.clearTimeout(t);
  }, [added]);

  // On a phone the buying controls scroll away long before the page ends, so a
  // compact bar takes over once they leave the screen — and stands down again
  // at the footer, which it would otherwise sit on top of.
  useEffect(() => {
    const el = primary.current;
    const footer = document.querySelector('footer');
    if (!el) return;

    let controlsAway = true;
    let atFooter = false;
    const update = () => setShowBar(controlsAway && !atFooter);

    const io = new IntersectionObserver(([entry]) => {
      controlsAway = !entry.isIntersecting;
      update();
    }, { rootMargin: '0px 0px -72px 0px' });
    io.observe(el);

    let footerIo: IntersectionObserver | undefined;
    if (footer) {
      footerIo = new IntersectionObserver(([entry]) => {
        atFooter = entry.isIntersecting;
        update();
      }, { rootMargin: '0px 0px -8% 0px' });
      footerIo.observe(footer);
    }

    return () => { io.disconnect(); footerIo?.disconnect(); };
  }, []);

  const submit = () => {
    if (!size) {
      setError(true);
      // Send them to the thing that is missing rather than just refusing.
      sizeGroup.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      sizeGroup.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
      return;
    }
    setError(false);
    add({ slug: product.slug, colour, size, qty: 1 });
    setAdded(true);
    open('cart');
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="label-sm text-mute">
            {product.category} · {product.gender === 'unisex' ? 'Unisex' : product.gender === 'women' ? "Women's" : "Men's"}
          </p>
          <h1 className="display-md mt-3">{product.name}</h1>
        </div>
        <StatusTag product={product} className="mt-1 shrink-0" />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <Price amount={product.price} compareAt={product.compareAt} size="lg" />
        {product.compareAt ? (
          <span className="label-sm text-oxide">
            −{Math.round((1 - product.price / product.compareAt) * 100)}%
          </span>
        ) : null}
      </div>

      <p className="mt-5 max-w-md text-sm text-mute">{product.summary}</p>

      {/* Colour */}
      <fieldset className="mt-9">
        <legend className="label-sm text-mute">
          Colour — <span className="text-ink">{colour}</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {product.colours.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColour(c.name)}
              aria-pressed={colour === c.name}
              aria-label={c.name}
              title={c.name}
              className={cn(
                'flex h-11 w-11 items-center justify-center border transition-colors',
                colour === c.name ? 'border-ink' : 'border-line hover:border-line-2',
              )}
            >
              <span aria-hidden className="block h-6 w-6 ring-1 ring-black/10 ring-inset" style={{ background: c.hex }} />
            </button>
          ))}
        </div>
      </fieldset>

      {/* Size */}
      {product.sizes.length > 1 ? (
        <fieldset className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <legend className="label-sm text-mute">
              Size{size ? <span className="text-ink"> — {size}</span> : null}
            </legend>
            <Link href="/size-guide" className="label-sm link-rule inline-flex items-center gap-1.5">
              <Icon name="ruler" className="h-3.5 w-3.5" />
              Size guide
            </Link>
          </div>

          <div ref={sizeGroup} className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Size">
            {product.sizes.map((s) => {
              const out = unavailable(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  onClick={() => { setSize(s); setError(false); }}
                  aria-pressed={size === s}
                  aria-label={out ? `Size ${s}, unavailable in ${colour}` : `Size ${s}${low(s) ? ', low stock' : ''}`}
                  className={cn(
                    'label-sm relative min-w-14 border px-3 py-3.5 transition-colors',
                    out && 'cursor-not-allowed border-line text-stone line-through',
                    !out && size === s && 'border-ink bg-ink text-bone',
                    !out && size !== s && 'border-line hover:border-ink',
                  )}
                >
                  {s}
                  {!out && low(s) ? (
                    <span aria-hidden className="absolute right-1 top-1 block h-1 w-1 rounded-full bg-oxide" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {error ? (
            <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-oxide">
              <Icon name="alert" className="h-4 w-4 shrink-0" />
              Choose a size to continue.
            </p>
          ) : (
            <p className="mt-3 text-xs text-mute">
              {sold
                ? 'Every size is sold out in this colour.'
                : size && low(size)
                  ? 'Three or fewer left in this size.'
                  : `${inStock} of ${product.sizes.length} sizes available in ${colour}.`}
            </p>
          )}
        </fieldset>
      ) : (
        <p className="mt-8 text-sm text-mute">{product.fit}</p>
      )}

      {/* Actions */}
      <div ref={primary} className="mt-8 flex gap-2.5">
        <button
          type="button"
          onClick={submit}
          disabled={sold}
          className="btn btn-solid flex-1"
          aria-describedby={sold ? 'sold-note' : undefined}
        >
          {sold ? 'Sold out' : added ? 'Added to bag' : 'Add to bag'}
          {added && !sold ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
        </button>
        <button
          type="button"
          onClick={() => toggleWish(product.slug)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={cn('btn btn-ghost w-12 shrink-0 px-0', saved && 'border-oxide text-oxide hover:bg-oxide hover:text-bone')}
        >
          <Icon name="heart" filled={saved} />
        </button>
      </div>

      {sold ? (
        <p id="sold-note" className="mt-3 text-xs text-mute">
          This piece is finished. Made in a count of a few hundred and not re-cut.
        </p>
      ) : (
        <p className="mt-3 text-xs text-mute">
          Free delivery in the Gulf over 1,500 SAR. Returns within 30 days.
        </p>
      )}

      {/* The phone's sticky bar. Hidden from assistive tech, because it is a
          duplicate of the controls above rather than new content. */}
      <div
        aria-hidden
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bone/97 px-(--gutter) py-3 backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden',
          showBar ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{product.name}</p>
            <p className="label-sm mt-0.5 text-mute">
              {colour}{size ? ` · ${size}` : ''}
            </p>
          </div>
          <Price amount={product.price} compareAt={product.compareAt} className="shrink-0" />
          <button
            type="button"
            onClick={submit}
            disabled={sold}
            tabIndex={-1}
            className="btn btn-solid h-11 min-h-11 shrink-0 px-5"
          >
            {sold ? 'Sold out' : size ? 'Add' : 'Select size'}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mt-12">
        <Detail title="Description" open>
          <p>{product.description}</p>
        </Detail>
        <Detail title="Fit">
          <p>{product.fit}</p>
          {product.modelNote ? <p className="mt-2 text-mute">{product.modelNote}</p> : null}
        </Detail>
        <Detail title="Materials">
          <ul className="space-y-1.5">
            {product.materials.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <p className="mt-3 text-mute">{product.madeIn}</p>
        </Detail>
        <Detail title="Care">
          <ul className="space-y-1.5">
            {product.care.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </Detail>
        <Detail title="Delivery and returns">
          <ul className="space-y-1.5">
            <li>Riyadh and Jeddah — two working days.</li>
            <li>Gulf — three to five working days, free over 1,500 SAR.</li>
            <li>International — five to eight working days, duties paid at checkout.</li>
            <li>Returns accepted within 30 days, unworn and with the tag attached.</li>
          </ul>
          <Link href="/shipping-returns" className="link-rule mt-3 inline-block text-mute">Full policy</Link>
        </Detail>
      </div>
    </div>
  );
}

function Detail({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-t border-line" open={open}>
      <summary className="label flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="plus" className="h-4 w-4 transition-transform duration-200 group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-sm leading-relaxed">{children}</div>
    </details>
  );
}
