'use client';

import Image from 'next/image';
import Link from '@/i18n/link';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { MASK_ROOM } from '@/app/[lang]/products/[slug]/_parts/mask';
import { fitClass, imageSrc } from '@/app/[lang]/products/[slug]/_parts/media';
import { Price } from '@/components/commerce/Price';
import { StatusTag } from '@/components/commerce/StatusTag';
import { FREE_SHIPPING, useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import type { Product } from '@/lib/catalog';
import { isSoldOut, SIZE_SYSTEM_LABEL, sizeSystemOf } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';

const genderLabel = (p: Product) =>
  p.gender === 'unisex' ? 'Unisex' : p.gender === 'women' ? "Women's" : "Men's";

/**
 * The buying panel. On a desktop it is the right-hand page of the spread and
 * stays in view while the photographs pass; its top edge follows the header,
 * and if it is ever taller than the screen it pins by its foot instead, so
 * nothing in it is out of reach.
 *
 * Sizes that cannot be bought in the chosen colour are disabled and struck
 * through rather than hidden, so the choice is legible; adding without a size
 * says what is missing instead of doing nothing.
 *
 * On a phone, a compact bar takes over whenever the real button is off screen.
 * Without a size it opens a sheet with the sizes, so buying from anywhere on
 * the page is three taps and never a scroll back up.
 */
export function ProductPanel({
  product, lead, kicker,
}: {
  product: Product;
  /** Rendered above everything else: the breadcrumb. */
  lead?: React.ReactNode;
  /** The line over the name. Defaults to the category and who it is cut for. */
  kicker?: string;
}) {
  const single = product.sizes.length === 1;
  const [colour, setColour] = useState(product.colours[0].name);
  const [size, setSize] = useState<string | null>(single ? product.sizes[0] : null);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const stick = useRef<HTMLDivElement>(null);
  const sizeGroup = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const sheetSizes = useRef<HTMLDivElement>(null);
  const sheetTitle = useId();
  const { add, toggleWish, wishlist, markViewed, ready } = useStore();
  const { open } = useUi();

  const sold = isSoldOut(product);
  const saved = ready && wishlist.includes(product.slug);
  const isOut = (c: string, s: string) => product.unavailable?.includes(`${c}/${s}`) ?? false;
  const unavailable = (s: string) => isOut(colour, s);
  const low = (s: string) => product.low?.includes(`${colour}/${s}`) ?? false;
  const inStock = product.sizes.filter((s) => !unavailable(s)).length;
  const colourSold = !sold && inStock === 0;
  const blocked = sold || colourSold;
  const system = sizeSystemOf(product);

  // Only once the saved state has been read back: the store's hydrate would
  // otherwise land after this and overwrite the list, so a page opened by a
  // direct link, a refresh or a new tab was never recorded.
  useEffect(() => {
    if (ready) markViewed(product.slug);
  }, [ready, product.slug, markViewed]);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2600);
    return () => window.clearTimeout(t);
  }, [added]);

  // The panel's own height, for the sticky top that pins a tall panel by its foot.
  useLayoutEffect(() => {
    const el = stick.current;
    if (!el) return;
    const set = () => el.style.setProperty('--panel-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The phone bar shows while the real button is off screen, and stands down
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

  const pickColour = (c: string) => {
    setColour(c);
    // A size that does not exist in the new colour is not a choice any more.
    if (!single && size && isOut(c, size)) setSize(null);
  };

  const pickSize = (s: string) => {
    setSize(s);
    setError(false);
  };

  const openSheet = () => {
    const d = sheet.current;
    if (!d || d.open) return;
    d.showModal();
    if (!reduced()) {
      const { gsap } = setupGsap();
      gsap.fromTo(d, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'expo.out' });
    }
    // The first size that can be chosen; with none left in this colour, the
    // first other colour.
    requestAnimationFrame(() => {
      const first =
        sheetSizes.current?.querySelector<HTMLButtonElement>('button:not(:disabled)') ??
        d.querySelector<HTMLButtonElement>('[role="group"] button[aria-pressed="false"]');
      first?.focus();
    });
  };

  const closeSheet = (then?: () => void) => {
    const d = sheet.current;
    if (!d?.open) return;
    const done = () => { d.close(); then?.(); };
    if (reduced()) { done(); return; }
    const { gsap } = setupGsap();
    gsap.to(d, {
      yPercent: 100, duration: 0.3, ease: 'power2.in',
      onComplete: () => { done(); gsap.set(d, { clearProps: 'transform' }); },
    });
  };

  const commit = (from: 'panel' | 'sheet') => {
    if (blocked) return;
    if (!size) {
      setError(true);
      // Send them to the thing that is missing rather than just refusing.
      const group = from === 'sheet' ? sheetSizes.current : sizeGroup.current;
      if (from === 'panel') group?.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
      group?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
      return;
    }
    setError(false);
    add({ slug: product.slug, colour, size, qty: 1 });
    setAdded(true);
    if (from === 'sheet') closeSheet(() => open('cart'));
    else open('cart');
  };

  // The small oxide mark on a size cell, said in words for everyone.
  const lowSizes = single || blocked ? [] : product.sizes.filter((s) => !unavailable(s) && low(s));
  const lowNote = lowSizes.length > 0 && !(size && low(size))
    ? `Three or fewer left in ${listOf(lowSizes)}.`
    : null;

  const availability = sold
    ? 'Every size is sold out.'
    : colourSold
      ? `Sold out in ${colour}. Another colour may still be available.`
      : size && !single && low(size)
        ? 'Three or fewer left in this size.'
        : single
          ? low(product.sizes[0]) ? `Three or fewer left in ${colour}.` : `In stock in ${colour}.`
          : `${inStock} of ${product.sizes.length} sizes available in ${colour}.`;

  // A finished piece has nothing to offer from a bar, so it never shows; a
  // colour that has sold out opens the sheet, where another can be chosen.
  const bar = showBar && !sold;

  const ctaLabel = sold ? 'Sold out' : colourSold ? `Sold out in ${colour}` : added ? 'Added to bag' : 'Add to bag';

  return (
    <>
      <div
        ref={stick}
        className="lg:sticky lg:transition-[top] lg:duration-[560ms] lg:ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ top: 'min(var(--header-offset, var(--nav-h)), calc(100svh - var(--panel-h, 0px)))' }}
      >
        <div className="px-(--gutter) pb-14 pt-7 md:pb-20 md:pt-10 lg:flex lg:min-h-[calc(100svh-var(--nav-h))] lg:flex-col lg:justify-center lg:py-[clamp(1.5rem,4vh,3rem)]">
          <div className="w-full max-w-[36rem] lg:mx-auto lg:max-w-[28rem] xl:max-w-[29.5rem]">
            {lead}

            <div className="flex items-center justify-between gap-4" data-reveal>
              <p className="label-sm text-mute">
                {kicker ?? `${product.category} — ${genderLabel(product)}`}
              </p>
              <StatusTag product={product} className="shrink-0" />
            </div>

            <h1 className={cn('mt-4 lg:mt-[clamp(0.75rem,2vh,1.25rem)] text-[clamp(2.5rem,1.1rem+3.3vw,4.75rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-balance', MASK_ROOM)}>
              <Lines text={product.name} />
            </h1>

            <div className="mt-5 flex items-baseline gap-3 lg:mt-[clamp(0.75rem,2.2vh,1.25rem)]" data-reveal>
              <Price amount={product.price} compareAt={product.compareAt} size="xl" />
              {product.compareAt ? (
                <span className="label-sm text-oxide">
                  −{Math.round((1 - product.price / product.compareAt) * 100)}%
                </span>
              ) : null}
            </div>

            <p className="mt-5 max-w-[26rem] text-[0.9375rem] leading-relaxed text-mute lg:mt-[clamp(0.75rem,2.2vh,1.25rem)]" data-reveal>
              {product.summary}
            </p>

            <div className="mt-8 space-y-7 lg:mt-[clamp(1.25rem,3.4vh,2rem)] lg:space-y-[clamp(1rem,2.8vh,1.75rem)]" data-reveal>
              <Colours product={product} colour={colour} onPick={pickColour} isOut={isOut} />

              {single ? (
                <div>
                  <p className="label-sm text-mute">Size</p>
                  <p className="mt-2.5 flex items-baseline gap-3 text-sm">
                    <span className="label shrink-0">One size</span>
                    <span className="text-mute">{product.fit}</span>
                  </p>
                </div>
              ) : (
                <Sizes
                  groupRef={sizeGroup}
                  sizes={product.sizes}
                  size={size}
                  colour={colour}
                  system={system === 'apparel' ? null : SIZE_SYSTEM_LABEL[system]}
                  unavailable={unavailable}
                  low={low}
                  error={error}
                  onPick={pickSize}
                  guide
                />
              )}
            </div>

            <div aria-live="polite" className="mt-3 min-h-5">
              {error ? (
                <p role="alert" className="flex items-center gap-2 text-xs text-oxide">
                  <Icon name="alert" className="h-4 w-4 shrink-0" />
                  Choose a size to continue.
                </p>
              ) : (
                <p className="text-xs text-mute">
                  {availability}
                  {lowNote ? <LowNote text={lowNote} /> : null}
                </p>
              )}
            </div>

            {/* Actions */}
            <div ref={primary} className="mt-5 flex gap-2" data-reveal>
              <button
                type="button"
                onClick={() => commit('panel')}
                disabled={blocked}
                aria-describedby={sold ? 'sold-note' : undefined}
                className={cn(
                  'btn h-14 flex-1 justify-between gap-4 px-5',
                  blocked ? 'border-line bg-bone-2 text-mute opacity-100!' : 'btn-solid',
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {ctaLabel}
                  {added && !blocked ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
                </span>
                {!blocked ? <Price amount={product.price} className="text-bone" /> : null}
              </button>
              <button
                type="button"
                onClick={() => toggleWish(product.slug)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                className={cn('btn btn-ghost h-14 w-14 shrink-0 px-0', saved && 'border-ink')}
              >
                <Icon name="heart" filled={saved} />
              </button>
            </div>

            {sold ? (
              <p id="sold-note" className="mt-3 text-xs text-mute">
                This piece is finished. Made in a count of a few hundred and not re-cut.
              </p>
            ) : null}

            <ul className="mt-7 border-t border-line text-[0.8125rem] leading-snug lg:mt-[clamp(1rem,2.8vh,1.75rem)]" data-reveal>
              <li className="flex items-start gap-3.5 border-b border-line py-3.5 lg:py-[clamp(0.625rem,1.5vh,0.875rem)]">
                <Icon name="truck" className="mt-px h-4 w-4 shrink-0" />
                <span>
                  Two working days to Riyadh and Jeddah.{' '}
                  <span className="text-mute">Free Gulf delivery over {FREE_SHIPPING.toLocaleString('en')} SAR.</span>
                </span>
              </li>
              <li className="flex items-start gap-3.5 border-b border-line py-3.5 lg:py-[clamp(0.625rem,1.5vh,0.875rem)]">
                <Icon name="arrowL" className="mt-px h-4 w-4 shrink-0" />
                <span>
                  Returns within 30 days.{' '}
                  <span className="text-mute">Unworn, with the tag attached.</span>
                </span>
              </li>
            </ul>

            <a href="#details" className="label-sm group mt-6 inline-flex min-h-11 lg:mt-[clamp(0.25rem,1.6vh,1.25rem)] items-center gap-2.5 text-mute transition-colors hover:text-ink">
              Fit, materials and care
              <Icon name="arrowR" className="h-3.5 w-3.5 rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Phone quick-buy bar ───────────────────────────────────────── */}
      <div
        inert={!bar}
        role="region"
        aria-label="Quick add to bag"
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bone/95 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:hidden',
          bar ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex items-center gap-3 px-(--gutter) pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5">
          <span className="relative h-12 w-[2.4rem] shrink-0 overflow-hidden bg-bone-2">
            <Image src={imageSrc(product.images[0])} alt="" fill sizes="40px" className={fitClass(product.images[0])} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-medium leading-tight">{product.name}</p>
            <p className="mt-1 flex min-w-0 items-baseline gap-1.5 text-xs text-mute">
              <Price amount={product.price} compareAt={product.compareAt} size="xs" className="shrink-0 text-ink" />
              <span aria-hidden>·</span>
              <span className="truncate">{colour}{size && !single ? `, ${size}` : ''}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => (size && !colourSold ? commit('panel') : openSheet())}
            className={cn('btn h-12 min-h-12 shrink-0 px-5', colourSold ? 'btn-ghost' : 'btn-solid')}
          >
            {colourSold ? 'Choose colour' : !size ? 'Select size' : added ? 'Added' : 'Add to bag'}
          </button>
        </div>
      </div>

      {/* ── Phone size sheet ──────────────────────────────────────────── */}
      <dialog
        ref={sheet}
        aria-labelledby={sheetTitle}
        onCancel={(e) => { e.preventDefault(); closeSheet(); }}
        onClick={(e) => { if (e.target === e.currentTarget) closeSheet(); }}
        className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto border-0 border-t border-line bg-bone p-0 text-ink backdrop:bg-ink/45 lg:hidden"
      >
        <div className="px-(--gutter) pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          <span aria-hidden className="mx-auto block h-[3px] w-10 bg-line-2" />
          <div className="mt-4 flex items-start gap-3.5">
            <span className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden bg-bone-2">
              <Image src={imageSrc(product.images[0])} alt="" fill sizes="56px" className={fitClass(product.images[0])} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id={sheetTitle} className="text-[0.9375rem] font-medium leading-snug">{product.name}</h2>
              <Price amount={product.price} compareAt={product.compareAt} className="mt-1" />
            </div>
            <button type="button" onClick={() => closeSheet()} className="icon-btn m-0 -mr-2.5 -mt-1.5" aria-label="Close">
              <Icon name="close" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {product.colours.length > 1 ? (
              <Colours product={product} colour={colour} onPick={pickColour} isOut={isOut} />
            ) : null}
            {!single ? (
              <Sizes
                groupRef={sheetSizes}
                sizes={product.sizes}
                size={size}
                colour={colour}
                system={system === 'apparel' ? null : SIZE_SYSTEM_LABEL[system]}
                unavailable={unavailable}
                low={low}
                error={error}
                onPick={pickSize}
              />
            ) : null}
          </div>

          <p className={cn('mt-3 min-h-5 text-xs', error ? 'text-oxide' : 'text-mute')} aria-live="polite">
            {error ? 'Choose a size to continue.' : availability}
            {!error && lowNote ? <LowNote text={lowNote} /> : null}
          </p>

          <button
            type="button"
            onClick={() => commit('sheet')}
            disabled={blocked}
            className="btn btn-solid mt-4 h-14 w-full justify-between px-5"
          >
            <span>{blocked ? 'Sold out' : 'Add to bag'}</span>
            {!blocked ? <Price amount={product.price} className="text-bone" /> : null}
          </button>
          <p className="mt-3 text-center text-xs text-mute">
            Free Gulf delivery over {FREE_SHIPPING.toLocaleString('en')} SAR · Returns within 30 days
          </p>
        </div>
      </dialog>
    </>
  );
}

/** Colour as named chips: the swatch alone does not say "Fog" or "Camel". */
function Colours({
  product, colour, onPick, isOut,
}: { product: Product; colour: string; onPick: (c: string) => void; isOut: (c: string, s: string) => boolean }) {
  const id = useId();
  return (
    <div>
      <p id={id} className="label-sm text-mute">
        Colour
        <span className="sr-only">, {colour} selected</span>
      </p>
      <div role="group" aria-labelledby={id} className="mt-3 flex flex-wrap gap-2">
        {product.colours.map((c) => {
          const gone = product.sizes.every((s) => isOut(c.name, s));
          const on = c.name === colour;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onPick(c.name)}
              aria-pressed={on}
              className={cn(
                'inline-flex h-11 items-center gap-2.5 border pl-3 pr-4 text-[0.8125rem] transition-colors duration-200',
                on ? 'border-ink' : 'border-line hover:border-line-2',
                gone && 'text-mute',
              )}
            >
              <span aria-hidden className="block h-3.5 w-3.5 ring-1 ring-inset ring-black/15" style={{ background: c.hex }} />
              <span className={cn(gone && 'line-through')}>{c.name}</span>
              {gone ? <span className="sr-only">, sold out</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Sizes on a hairline grid, so a row of them reads as one ruled table. */
function Sizes({
  groupRef, sizes, size, colour, system, unavailable, low, error, onPick, guide = false,
}: {
  groupRef: React.RefObject<HTMLDivElement | null>;
  sizes: string[];
  size: string | null;
  colour: string;
  system: string | null;
  unavailable: (s: string) => boolean;
  low: (s: string) => boolean;
  error: boolean;
  onPick: (s: string) => void;
  guide?: boolean;
}) {
  const id = useId();
  const cols = Math.min(sizes.length, 6);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p id={id} className="label-sm text-mute">
          Size{system ? <span> · {system}</span> : null}
          {size ? <span className="text-ink"> — {size}</span> : null}
        </p>
        {guide ? (
          <Link href="/size-guide" className="label-sm link-quiet inline-flex items-center gap-1.5 text-mute transition-colors hover:text-ink">
            <Icon name="ruler" className="h-3.5 w-3.5" />
            Size guide
          </Link>
        ) : null}
      </div>
      <div
        ref={groupRef}
        role="group"
        aria-labelledby={id}
        className={cn('mt-3 grid border-l border-t transition-colors', error ? 'border-oxide' : 'border-line')}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {sizes.map((s) => {
          const out = unavailable(s);
          const on = size === s;
          return (
            <button
              key={s}
              type="button"
              disabled={out}
              onClick={() => onPick(s)}
              aria-pressed={on}
              aria-label={out ? `Size ${s}, unavailable in ${colour}` : `Size ${s}${low(s) ? ', low stock' : ''}`}
              className={cn(
                'label-sm nums relative flex h-12 items-center justify-center border-b border-r transition-colors duration-200',
                error ? 'border-oxide' : 'border-line',
                out && 'cursor-not-allowed text-stone [background:linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--color-line)_calc(50%-0.5px),var(--color-line)_calc(50%+0.5px),transparent_calc(50%+0.5px))]',
                !out && on && 'bg-ink text-bone',
                !out && !on && 'hover:bg-bone-2',
              )}
            >
              {s}
              {!out && low(s) ? (
                <span aria-hidden className={cn('absolute right-1.5 top-1.5 block h-1 w-1', on ? 'bg-bone' : 'bg-oxide')} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** "XL", "S and XL", "S, M and XL". */
const listOf = (xs: string[]) =>
  xs.length < 2 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

/** The legend for the low-stock mark on the size grid, drawn in the same oxide square. */
function LowNote({ text }: { text: string }) {
  return (
    <span className="ml-2 inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span aria-hidden className="block h-1 w-1 shrink-0 -translate-y-px self-center bg-oxide" />
      {text}
    </span>
  );
}
