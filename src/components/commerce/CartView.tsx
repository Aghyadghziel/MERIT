'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/commerce/ProductCard';
import { RecentlyViewed } from '@/components/commerce/RecentlyViewed';
import { FREE_SHIPPING, useStore, type Line } from '@/components/providers/Store';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { getCollection, getProduct, type Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { formatPrice, pad2, plural } from '@/lib/format';
import { EASE, reduced, setupGsap } from '@/lib/gsap';

/* ══════════════════════════════════════════════════════════════════════════
   Shared by the bag, the drawer, checkout, the account and the wishlist.
   ══════════════════════════════════════════════════════════════════════════ */

export const lineKey = (l: Line) => `${l.slug}|${l.colour}|${l.size}`;

/** A price in the reader's currency. Unlike <Price>, it takes its size from the parent. */
export function Amount({ value, className }: { value: number; className?: string }) {
  const { currency, ready } = useStore();
  return <span className={cn('nums whitespace-nowrap', className)}>{formatPrice(value, ready ? currency : 'SAR')}</span>;
}

/**
 * The house word-mask headline, with room under the baseline. Display type is
 * set at 0.86, and the shared mask trims the tail off a g or a y at that
 * leading. Keyed on its text, so a new headline mounts fresh and the reveal
 * system picks it up instead of leaving the new words below the mask.
 */
export function MaskHeadline({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <span key={text} data-reveal-line>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span style={{ paddingBottom: '0.2em', marginBottom: '-0.2em' }}>
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Rolls its figure in when the value changes — up when it grows, down when it
 * shrinks — inside a mask, so a total never simply snaps to a new number.
 */
function useRoll(value: number) {
  const inner = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useLayoutEffect(() => {
    if (prev.current === value) return;
    const up = value > prev.current;
    prev.current = value;
    const el = inner.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const t = gsap.fromTo(el, { yPercent: up ? 105 : -105 }, { yPercent: 0, duration: 0.75, ease: EASE.big });
    return () => { t.kill(); };
  }, [value]);
  return inner;
}

/** A price that rolls to its new figure. Takes its size from the parent. */
export function RollingAmount({ value, className }: { value: number; className?: string }) {
  const inner = useRoll(value);
  return (
    <span
      className={cn('inline-block overflow-hidden align-bottom', className)}
      style={{ padding: '0.1em 0.04em 0.06em', margin: '-0.1em -0.04em -0.06em' }}
    >
      <span ref={inner} className="block">
        <Amount value={value} />
      </span>
    </span>
  );
}

/**
 * A two-figure count at poster size that rolls when it changes: up when a
 * piece arrives, down when one leaves. Decorative — the count is always said
 * in words beside it.
 *
 * Beside a <MaskHeadline>, put it in a flex wrapper (so no line box of the
 * parent's text sits under it) and give it mb-[-0.04em] to take back its
 * bottom padding: the figures then share the headline's baseline exactly.
 */
export function Tally({ value, className }: { value: number; className?: string }) {
  const inner = useRoll(value);
  return (
    <span aria-hidden className={cn('inline-block overflow-hidden', className)} style={{ padding: '0.08em 0.02em 0.04em' }}>
      <span ref={inner} className="nums block">{pad2(value)}</span>
    </span>
  );
}

/**
 * Quantity, with 44px targets. It only ever changes the count: taking a piece
 * out is the row's own Remove, so a row never offers the same act twice. At
 * either end the step is dimmed with aria-disabled rather than disabled, so a
 * keyboard that has just pressed it keeps its place instead of being dropped.
 */
export function Stepper({ qty, name, onStep }: { qty: number; name: string; onStep: (delta: number) => void }) {
  const btn =
    'flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:bg-ink hover:text-bone aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-current';
  const floor = qty <= 1;
  const ceiling = qty >= 9;
  return (
    <div className="inline-flex items-center border border-line-2" role="group" aria-label={`Quantity of ${name}`}>
      <button
        type="button"
        className={btn}
        onClick={() => { if (!floor) onStep(-1); }}
        aria-disabled={floor || undefined}
        aria-label={`Decrease quantity of ${name}`}
      >
        <Icon name="minus" className="h-3.5 w-3.5" />
      </button>
      <span className="nums w-8 text-center text-sm" aria-live="polite">
        <span className="sr-only">Quantity </span>{qty}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => { if (!ceiling) onStep(1); }}
        aria-disabled={ceiling || undefined}
        aria-label={`Increase quantity of ${name}`}
      >
        <Icon name="plus" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * A line's price. A marked-down piece keeps its sale signal in the bag: the
 * figure charged in oxide, the full price struck through beside it (or under
 * it, where the column is narrow), as on the listing.
 */
export function LinePrice({
  product, qty = 1, stack = false, className,
}: { product: Product; qty?: number; stack?: boolean; className?: string }) {
  const total = product.price * qty;
  if (!product.compareAt) return <Amount value={total} className={className} />;
  return (
    <span className={cn('inline-flex', stack ? 'flex-col items-end gap-1' : 'flex-wrap items-baseline gap-x-2', className)}>
      <Amount value={total} className="text-oxide" />
      <span className="text-[0.8em] text-mute line-through">
        <span className="sr-only">Was </span>
        <Amount value={product.compareAt * qty} />
      </span>
    </span>
  );
}

/** How far the bag is from free Gulf delivery, as a rule that fills. */
export function DeliveryRule({ tone = 'bone', className }: { tone?: 'bone' | 'ink'; className?: string }) {
  const { subtotal, currency, ready } = useStore();
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);
  const dark = tone === 'ink';
  return (
    <div className={className}>
      <p className="label-sm flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {remaining > 0 ? (
          <>
            <span className="nums">{formatPrice(remaining, ready ? currency : 'SAR')}</span>
            <span>from free delivery in the Gulf</span>
          </>
        ) : (
          <>
            <Icon name="check" className="h-3.5 w-3.5" />
            <span>Free delivery in the Gulf</span>
          </>
        )}
      </p>
      <div aria-hidden className={cn('relative mt-3 h-[2px]', dark ? 'bg-line-ink' : 'bg-line')}>
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]',
            dark ? 'bg-bone' : 'bg-ink',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Removing a line folds its row shut before the bag lets go of it, so the
 * list closes up instead of jumping. Lines are found by key when the fold
 * ends, never by an index captured at click time, so two quick removals
 * cannot take the wrong piece.
 */
export function useBagActions(afterRemove?: () => void) {
  const { bag, wishlist, remove, setQty, toggleWish } = useStore();
  const latest = useRef(bag);
  const saved = useRef(wishlist);
  const busy = useRef(new Set<string>());
  useEffect(() => { latest.current = bag; }, [bag]);
  useEffect(() => { saved.current = wishlist; }, [wishlist]);

  const drop = useCallback((key: string, row: HTMLElement | null, keep = false) => {
    if (busy.current.has(key)) return;
    busy.current.add(key);
    const line = latest.current.find((l) => lineKey(l) === key);
    if (keep && line && !saved.current.includes(line.slug)) toggleWish(line.slug);

    const done = () => {
      busy.current.delete(key);
      const i = latest.current.findIndex((l) => lineKey(l) === key);
      if (i === -1) return;
      remove(i);
      afterRemove?.();
    };
    if (!row || reduced()) { done(); return; }

    const { gsap } = setupGsap();
    gsap.set(row, { overflow: 'hidden', pointerEvents: 'none' });
    gsap.to(row, { opacity: 0, x: 28, duration: 0.28, ease: EASE.ui });
    gsap.to(row, {
      height: 0, paddingTop: 0, paddingBottom: 0, borderBottomWidth: 0,
      duration: 0.5, delay: 0.14, ease: 'power3.inOut', onComplete: done,
    });
  }, [remove, toggleWish, afterRemove]);

  const step = useCallback((key: string, delta: number, row: HTMLElement | null) => {
    const i = latest.current.findIndex((l) => lineKey(l) === key);
    if (i === -1) return;
    const next = latest.current[i].qty + delta;
    if (next < 1) drop(key, row);
    else setQty(i, next);
  }, [drop, setQty]);

  return { drop, step };
}

/* ══════════════════════════════════════════════════════════════════════════
   The bag page.
   ══════════════════════════════════════════════════════════════════════════ */

/** Offered when the bag is empty: one of each kind of permanent piece. */
const START_WITH = ['quiet-poplin-shirt', 'column-wide-trouser', 'baseline-rib-knit', 'axis-structured-bag'];

export function CartView() {
  const { bag, count, subtotal, currency, ready, wishlist } = useStore();
  const heading = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const [summaryBelow, setSummaryBelow] = useState(false);
  const filled = ready && count > 0;

  // Removing a line removes the focused button with it. Once the bag has
  // re-rendered, keep the keyboard in the list without moving the page; if
  // that was the last piece, bring the top of the page back into view first,
  // so the title that takes focus is on screen above the empty state.
  const pendingFocus = useRef(false);
  const refocus = useCallback(() => { pendingFocus.current = true; }, []);
  const { drop, step } = useBagActions(refocus);
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    if (list.current) {
      list.current.focus({ preventScroll: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: reduced() ? 'instant' : 'smooth' });
    heading.current?.focus({ preventScroll: true });
  }, [bag]);

  // On a phone the summary sits under every line. Until it is on screen, a
  // slim bar carries the total and the way forward.
  useEffect(() => {
    const el = summary.current;
    if (!filled || !el) return;
    const io = new IntersectionObserver(([e]) => setSummaryBelow(!e.isIntersecting && e.boundingClientRect.top > 0));
    io.observe(el);
    return () => io.disconnect();
  }, [filled]);

  if (!ready) return <div className="page min-h-[80svh] pt-(--nav-h)" aria-busy="true" />;

  const code = currency;
  const free = subtotal >= FREE_SHIPPING;
  const suggestions = START_WITH.map(getProduct).filter((p): p is Product => Boolean(p));
  const bar = filled && summaryBelow;

  return (
    <>
      <div className="page pt-(--nav-h)">
        <header className="pt-[clamp(2.25rem,1rem+4vw,5.5rem)]">
          <div className="flex items-baseline justify-between gap-4" data-reveal>
            <p className="label">Shopping bag</p>
            <p className="label nums text-mute">{filled ? plural(count, 'piece') : 'Empty'}</p>
          </div>
          <div className="mt-[clamp(1.25rem,0.8rem+1.6vw,2.5rem)] flex items-end justify-between gap-6 border-b border-ink pb-[clamp(1.25rem,0.8rem+1.2vw,2rem)]">
            <h1 ref={heading} tabIndex={-1} className="display-xl" style={{ outline: 'none' }}>
              <MaskHeadline text="Your bag." />
            </h1>
            <span data-reveal className="flex shrink-0">
              <Tally value={count} className="display-xl mb-[-0.04em] text-line-2" />
            </span>
          </div>
        </header>

        {filled ? (
          <div className="grid-page items-start gap-y-12 pb-(--section)">
            <section aria-labelledby="bag-lines" className="col-span-4 md:col-span-6 lg:col-span-8">
              <h2 id="bag-lines" className="sr-only">Pieces in your bag</h2>
              <ol ref={list} tabIndex={-1} style={{ outline: 'none' }}>
                {bag.map((line, i) => (
                  <BagRow key={lineKey(line)} line={line} index={i} onStep={step} onDrop={drop} />
                ))}
              </ol>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2" data-reveal>
                <Link href="/new" className="label group inline-flex min-h-11 items-center gap-2.5">
                  <Icon name="arrowL" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                  Continue shopping
                </Link>
                <p className="text-xs text-mute">Kept in this browser. No account needed.</p>
              </div>
            </section>

            <aside
              aria-labelledby="summary-title"
              className="col-span-4 transition-[top] duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:col-span-4 md:col-start-3 lg:sticky lg:top-[calc(var(--header-offset,var(--nav-h))+1.5rem)] lg:col-span-4 lg:col-start-9 lg:mt-8"
            >
              <div ref={summary} className="on-ink bg-ink text-bone" data-reveal>
                {/* A size container, so the total is set from the column's
                    own width rather than the window's: at the narrowest
                    desktop a five- or six-figure total still fits. */}
                <div className="@container p-[clamp(1.375rem,0.8rem+1.6vw,2.25rem)]">
                  <div className="flex items-center justify-between gap-4">
                    <h2 id="summary-title" className="label">Summary</h2>
                    <Wordmark symbol className="h-[18px] w-auto text-bone/40" />
                  </div>

                  <dl className="mt-7 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-mute-ink">Subtotal · {plural(count, 'piece')}</dt>
                      <dd><Amount value={subtotal} /></dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-mute-ink">Delivery</dt>
                      <dd className="text-right">
                        {free ? 'Free in the Gulf' : <>Free in the Gulf over <Amount value={FREE_SHIPPING} /></>}
                      </dd>
                    </div>
                  </dl>

                  <DeliveryRule tone="ink" className="mt-6" />

                  <div className="mt-8 border-t border-line-ink pt-5">
                    {/* No destination is known here, so the figure is never
                        presented as a final, delivered price. */}
                    <p className="label text-mute-ink">Total before delivery</p>
                    <p className="mt-3 text-[clamp(2rem,14.5cqi,3.75rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
                      <RollingAmount value={subtotal} />
                    </p>
                    {code !== 'SAR' ? (
                      <p className="mt-3 text-xs text-mute-ink">
                        Shown in {code} at an indicative rate. Prices are set in SAR.
                      </p>
                    ) : null}
                  </div>

                  <Link href="/checkout" className="btn btn-solid group mt-7 w-full justify-between px-5">
                    <span>Checkout</span>
                    <Icon name="arrowR" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-3 text-xs leading-relaxed text-mute-ink">
                    MERIT is a concept store. Checkout shows what would happen next; nothing is charged.
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-mute" data-reveal>
                <li className="flex items-start gap-3"><Icon name="truck" className="h-4 w-4 shrink-0 text-ink" /> Riyadh and Jeddah in two working days.</li>
                <li className="flex items-start gap-3"><Icon name="arrowL" className="h-4 w-4 shrink-0 text-ink" /> Returns within thirty days, unworn.</li>
                <li className="flex items-start gap-3"><Icon name="leaf" className="h-4 w-4 shrink-0 text-ink" /> Packed in unbleached cotton, no plastic.</li>
                <li className="pl-7 pt-1">
                  <Link href="/shipping-returns" className="link-rule text-ink">Delivery and returns</Link>
                </li>
              </ul>
            </aside>
          </div>
        ) : (
          <div className="pb-(--section)">
            <div className="grid-page items-end gap-y-8 pt-[clamp(2rem,1rem+3vw,4rem)]">
              <div className="col-span-4 md:col-span-4 lg:col-span-6">
                <p className="display-md" data-reveal>Nothing in it yet.</p>
                <p className="body-lg mt-5 max-w-md text-mute" data-reveal>
                  Most people start with the Index: the pieces cut from the same patterns every year,
                  in the same cloth.
                </p>
              </div>
              <div className="col-span-4 flex flex-wrap gap-3 md:col-span-2 md:flex-col lg:col-span-5 lg:col-start-8 lg:flex-row lg:justify-end" data-reveal>
                <Link href="/collections/index" className="btn btn-solid">Shop the Index</Link>
                <Link href="/new" className="btn">New arrivals</Link>
              </div>
            </div>

            {wishlist.length > 0 ? (
              <Link
                href="/wishlist"
                className="group mt-12 flex items-center justify-between gap-4 border-y border-line py-5"
                data-reveal
              >
                <span className="flex items-center gap-3 text-sm">
                  <Icon name="heart" className="h-4 w-4" />
                  {plural(wishlist.length, 'piece')} waiting in your wishlist
                </span>
                <Icon name="arrowR" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ) : null}

            <section aria-labelledby="start-title" className="mt-[clamp(3.5rem,2rem+5vw,7rem)]">
              <div className="flex items-baseline justify-between gap-6 border-t border-ink pt-4" data-reveal>
                <h2 id="start-title" className="label">From the Index</h2>
                <Link href="/collections/index" className="label group inline-flex items-center gap-2">
                  All pieces <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-x-(--gutter) gap-y-12 lg:grid-cols-4">
                {suggestions.map((p, i) => (
                  <div key={p.slug} className={cn(i % 2 === 1 && 'mt-10 lg:mt-20')}>
                    <ProductCard product={p} index={i} sizes="(min-width:1024px) 23vw, 47vw" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <RecentlyViewed />

      {filled ? (
        <div
          className={cn(
            'fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-bone/95 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden',
            bar ? 'translate-y-0' : 'translate-y-full',
          )}
          inert={!bar}
          aria-hidden={!bar}
        >
          <div className="page flex items-center justify-between gap-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <div className="min-w-0">
              <p className="label-sm text-mute">Before delivery · {plural(count, 'piece')}</p>
              <p className="mt-1.5 text-xl font-semibold leading-none tracking-[-0.035em]"><RollingAmount value={subtotal} /></p>
            </div>
            <Link href="/checkout" className="btn btn-solid shrink-0 px-6">Checkout</Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

function BagRow({
  line, index, onStep, onDrop,
}: {
  line: Line;
  index: number;
  onStep: (key: string, delta: number, row: HTMLElement | null) => void;
  onDrop: (key: string, row: HTMLElement | null, keep?: boolean) => void;
}) {
  const row = useRef<HTMLLIElement>(null);
  const p = getProduct(line.slug);
  if (!p) return null;

  const key = lineKey(line);
  const href = `/products/${p.slug}`;
  const hex = p.colours.find((c) => c.name === line.colour)?.hex;
  const collection = getCollection(p.collection);

  return (
    <li
      ref={row}
      className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-4 border-b border-line py-6 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-6 md:grid-cols-[2.5rem_10rem_minmax(0,1fr)] md:py-8 lg:grid-cols-[3rem_11.5rem_minmax(0,1fr)] lg:gap-x-8"
      data-reveal
    >
      <span className="label-sm nums hidden pt-0.5 text-mute md:block">{pad2(index + 1)}</span>

      <Link href={href} className="group block self-start" tabIndex={-1} aria-hidden="true">
        <div className="frame frame-4-5">
          <Image
            src={`/img/${p.images[0]}.webp`}
            alt=""
            width={460}
            height={575}
            sizes="(min-width:1024px) 184px, (min-width:768px) 160px, (min-width:640px) 136px, 96px"
            className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="label-sm text-mute">
              {p.category}{collection ? ` · ${collection.name}` : ''}
            </p>
            <h3 className="mt-2 text-[clamp(1.0625rem,0.85rem+0.9vw,1.625rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
              <Link href={href} className="link-quiet">{p.name}</Link>
            </h3>
          </div>
          <LinePrice product={p} qty={line.qty} className="shrink-0 text-[0.9375rem] font-medium sm:pt-5 sm:text-right md:text-base" />
        </div>

        <dl className="mt-4 grid grid-cols-[3.75rem_minmax(0,1fr)] gap-y-1.5 text-sm md:mt-5 md:grid-cols-[4.5rem_minmax(0,1fr)]">
          <dt className="text-mute">Colour</dt>
          <dd className="flex items-center gap-2">
            {hex ? <span aria-hidden className="h-2.5 w-2.5 shrink-0 border border-ink/15" style={{ background: hex }} /> : null}
            {line.colour}
          </dd>
          <dt className="text-mute">Size</dt>
          <dd>{line.size}</dd>
          {line.qty > 1 ? (
            <>
              <dt className="text-mute">Each</dt>
              <dd><Amount value={p.price} /></dd>
            </>
          ) : null}
        </dl>
        <p className="label-sm mt-4 hidden text-mute sm:block">{p.madeIn}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-5">
          <Stepper qty={line.qty} name={p.name} onStep={(d) => onStep(key, d, row.current)} />
          <div className="flex items-center gap-x-4 sm:gap-x-5">
            <button
              type="button"
              className="label-sm inline-flex min-h-11 items-center text-mute transition-colors hover:text-ink"
              onClick={() => onDrop(key, row.current, true)}
              aria-label={`Move ${p.name} to your wishlist`}
            >
              <span className="sm:hidden">Save</span>
              <span className="hidden sm:inline">Move to wishlist</span>
            </button>
            <button
              type="button"
              className="label-sm inline-flex min-h-11 items-center text-mute transition-colors hover:text-ink"
              onClick={() => onDrop(key, row.current)}
              aria-label={`Remove ${p.name} from your bag`}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
