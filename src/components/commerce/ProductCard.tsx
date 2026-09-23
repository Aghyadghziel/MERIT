'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { WishButton } from '@/components/commerce/WishButton';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import type { Product } from '@/lib/catalog';
import { isSoldOut, products, statusLabel } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { formatPrice, pad2 } from '@/lib/format';

type Props = {
  product: Product;
  /** Card index, used for the catalogue number and the image priority hint. */
  index?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Off for carousels, which run their own entrance for the visible cards. */
  reveal?: boolean;
};

// ─── The hover photograph ──────────────────────────────────────────────────

/** Each piece's main photograph, by file, and the piece it belongs to. */
const MAIN = new Map(products.map((p) => [p.images[0], p.slug]));

/**
 * Placeholder files that are byte-for-byte another piece's main photograph
 * under a different name. Until the catalogue has its own pictures for these,
 * a card never shows one on hover: the grid would show the same photograph as
 * two different pieces. Remove an entry once its file is replaced.
 */
const SAME_FILE: Record<string, string> = {
  'dress-plane-2': 'vest-stone-1',
  'jacket-field-2': 'scarf-signal-1',
  'material-silk': 'scarf-signal-1',
  'shirt-quiet-4': 'scarf-signal-1',
};

/** The first of a piece's other photographs that is not some other piece. */
function hoverOf(p: Product) {
  return p.images.slice(1).find((img) => {
    const owner = MAIN.get(SAME_FILE[img] ?? img);
    return !owner || owner === p.slug;
  });
}

/**
 * One card, three sizes. The card is its own container, so the same markup
 * sets a phone's two-up grid, a desktop's four-up and the two-up "large" view
 * without the parent having to say which it is:
 *
 *   narrow   name, price and colour stacked under the picture
 *   regular  a catalogue line — number, name, category — with the price opposite
 *   large    the regular line at reading size, plus the one-line summary
 *
 * The name comes first in the source and is drawn under the picture, so it is
 * the card's first stop for a keyboard and its first words for a screen
 * reader; the heart and the quick add follow it.
 *
 * On a pointer, the second photograph is drawn up over the first by the house
 * mask, and the sizes rise inside the picture. On touch, and from the
 * keyboard, a plus opens them.
 */
export function ProductCard({
  product, index, priority, sizes = '(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw', className, reveal = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const { wishlist, ready, currency } = useStore();
  const saved = ready && wishlist.includes(product.slug);
  const sold = isSoldOut(product);
  const status = statusLabel(product);
  const href = `/products/${product.slug}`;
  const first = product.images[0];
  const second = hoverOf(product);
  const code = ready ? currency : 'SAR';
  const load = priority ? ({ loading: 'eager', fetchPriority: 'high' } as const) : ({ loading: 'lazy' } as const);

  return (
    <article
      className={cn('group/card @container relative flex flex-col', className)}
      onMouseLeave={() => setOpen(false)}
      {...(reveal ? { 'data-reveal': '' } : {})}
    >
      {/* The catalogue line: first in the source, drawn under the picture. */}
      <div className="order-2 mt-3 grid grid-cols-1 gap-y-1 @min-[17rem]:mt-3.5 @min-[17rem]:grid-cols-[minmax(0,1fr)_auto] @min-[17rem]:gap-x-4 @min-[30rem]:mt-5">
        <h3 className="text-[0.8125rem] font-medium leading-[1.3] tracking-[-0.01em] @min-[17rem]:col-start-1 @min-[17rem]:row-start-1 @min-[17rem]:text-sm @min-[30rem]:text-xl @min-[30rem]:leading-tight @min-[30rem]:tracking-[-0.025em]">
          <Link
            href={href}
            className={cn(
              'bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-px',
              'transition-[background-size] duration-500 ease-expo group-hover/card:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]',
              "after:absolute after:inset-0 after:content-['']",
            )}
          >
            {product.name}
          </Link>
        </h3>

        <p className="nums text-[0.8125rem] leading-[1.3] @min-[17rem]:col-start-2 @min-[17rem]:row-start-1 @min-[17rem]:text-right @min-[17rem]:text-sm @min-[30rem]:text-base">
          <span className={cn(product.compareAt ? 'text-oxide' : null)}>{formatPrice(product.price, code)}</span>
          {product.compareAt ? (
            <span className="ml-2 text-mute line-through">
              <span className="sr-only">Was </span>
              {formatPrice(product.compareAt, code)}
            </span>
          ) : null}
        </p>

        <p className="label-sm hidden text-mute @min-[17rem]:col-start-1 @min-[17rem]:row-start-2 @min-[17rem]:block">
          {index !== undefined ? <span className="nums">{pad2(index + 1)} — </span> : null}
          {product.category}
        </p>

        <Swatches product={product} />

        <p className="mt-1.5 hidden max-w-[44ch] text-sm leading-relaxed text-mute @min-[30rem]:col-span-2 @min-[30rem]:block">
          {product.summary}
        </p>
      </div>

      <div className="relative order-1">
        <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
          <div className="frame frame-4-5">
            <Image
              src={`/img/${first}.webp`}
              alt=""
              width={1400}
              height={1750}
              sizes={sizes}
              {...load}
              className={cn(
                'transition-transform duration-[1400ms] ease-expo group-hover/card:scale-[1.03]',
                sold && 'opacity-50',
              )}
            />
            {second && !sold ? (
              // The second photograph is drawn up over the first by the same
              // mask the page uses to reveal images, so hover reads as the house
              // moving rather than a slideshow. It sits on its own well: some
              // product shots are cut-outs, and would show the first through.
              <div
                aria-hidden
                className={cn(
                  'absolute inset-0 bg-bone-2 [clip-path:inset(100%_0_0_0)]',
                  'transition-[clip-path] duration-[800ms] ease-expo group-hover/card:[clip-path:inset(0_0_0_0)]',
                )}
              >
                <Image
                  src={`/img/${second}.webp`}
                  alt=""
                  width={1400}
                  height={1750}
                  sizes={sizes}
                  loading="lazy"
                  className="scale-[1.08] transition-transform duration-[1400ms] ease-expo group-hover/card:scale-100"
                />
              </div>
            ) : null}
          </div>
        </Link>

        {/* The marks on the picture: the status word, and the heart. The heart
            waits for the pointer unless the piece is already saved. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-2 @min-[14rem]:p-2.5">
          {status ? (
            <span
              className={cn(
                'label-sm bg-bone px-1.5 py-[0.3125rem] leading-none',
                status.tone === 'oxide' && 'text-oxide',
                status.tone === 'mute' && 'text-mute',
              )}
            >
              {status.text}
            </span>
          ) : <span />}
          <span
            className={cn(
              'pointer-events-auto -m-1.5 transition-opacity duration-300',
              !saved && '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:hover)]:group-focus-within/card:opacity-100',
            )}
          >
            <WishButton
              slug={product.slug}
              name={product.name}
              className="relative isolate before:absolute before:inset-[7px] before:-z-10 before:bg-bone/90 before:content-['']"
            />
          </span>
        </div>

        {sold ? null : <QuickAdd product={product} open={open} setOpen={setOpen} />}
      </div>
    </article>
  );
}

/** Small squares, not circles: the grid has no curves anywhere else. */
function Swatches({ product }: { product: Product }) {
  const { colours } = product;
  return (
    <span className="mt-1 flex items-center gap-1.5 @min-[17rem]:col-start-2 @min-[17rem]:row-start-2 @min-[17rem]:mt-0 @min-[17rem]:justify-self-end">
      <span className="sr-only">
        {colours.length === 1 ? 'One colour: ' : `${colours.length} colours: `}
        {colours.map((c) => c.name).join(', ')}
      </span>
      {colours.map((c) => (
        <span
          key={c.name}
          aria-hidden
          className="block h-2 w-2 ring-1 ring-line-2 ring-inset @min-[30rem]:h-2.5 @min-[30rem]:w-2.5"
          style={{ background: c.hex }}
        />
      ))}
      {colours.length > 1 ? (
        <span aria-hidden className="label-sm nums ml-1 hidden text-mute @min-[30rem]:inline">
          {colours.length} colours
        </span>
      ) : null}
    </span>
  );
}

/**
 * Sizes rise inside the picture on hover, or after the plus is pressed — the
 * plus is always there on touch, and appears on a pointer device when the
 * keyboard reaches it. The sizes join the tab order only while the bar is
 * open, so a keyboard crosses a card in three stops, not seven. The bar says
 * which colour it adds — the first — so nothing lands in the bag by surprise;
 * the drawer opening is the confirmation.
 */
function QuickAdd({
  product, open, setOpen,
}: { product: Product; open: boolean; setOpen: (v: boolean) => void }) {
  const { add } = useStore();
  const { open: openOverlay } = useUi();
  const colour = product.colours[0];
  const single = product.sizes.length === 1;
  const barId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const addSize = (size: string) => {
    add({ slug: product.slug, colour: colour.name, size, qty: 1 });
    openOverlay('cart');
    setOpen(false);
  };

  const show = () => {
    setOpen(true);
    // Straight to the first size that can be bought, once the bar can take focus.
    requestAnimationFrame(() => bar.current?.querySelector<HTMLButtonElement>('button[data-size]:not(:disabled)')?.focus());
  };
  const hide = () => {
    setOpen(false);
    toggle.current?.focus();
  };

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 p-1.5 @min-[14rem]:p-2.5"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); hide(); }
      }}
      onBlur={(e) => {
        // Tabbing on to the next card closes the bar. A tap that moves no
        // focus (Safari) has no related target, and is left alone.
        const next = e.relatedTarget as Node | null;
        if (open && next && !e.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <div
        ref={bar}
        id={barId}
        role="group"
        aria-label={`Sizes for ${product.name}`}
        className={cn(
          'bg-bone transition-[opacity,transform] duration-300 ease-expo',
          'pointer-events-none translate-y-2 opacity-0',
          'group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100',
          'focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100',
          open && 'pointer-events-auto translate-y-0 opacity-100',
        )}
      >
        <div className="flex min-h-8 items-center justify-between gap-2 border-b border-line pl-2.5 pr-1 @min-[14rem]:pl-3">
          <p className="label-sm truncate text-mute">
            <span className="hidden @min-[14rem]:inline">Quick add — </span>
            {colour.name}
          </p>
          {/* The bar's own way out, once it has been opened by the plus. */}
          <button
            type="button"
            onClick={hide}
            aria-label="Hide sizes"
            tabIndex={open ? 0 : -1}
            className={cn('-my-1 h-9 w-9 items-center justify-center', open ? 'flex' : 'hidden')}
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
        {single ? (
          <button
            type="button"
            data-size
            tabIndex={open ? 0 : -1}
            className="label-sm flex min-h-11 w-full items-center justify-center gap-2 transition-colors hover:bg-ink hover:text-bone focus-visible:-outline-offset-2"
            onClick={() => addSize(product.sizes[0])}
            aria-label={`Add ${product.name}, ${colour.name}, to bag`}
          >
            Add to bag
            <Icon name="plus" className="h-3 w-3" />
          </button>
        ) : (
          <div className="grid grid-cols-3 @min-[14rem]:flex">
            {product.sizes.map((size) => {
              const out = product.unavailable?.includes(`${colour.name}/${size}`);
              return (
                <button
                  key={size}
                  type="button"
                  data-size
                  disabled={out}
                  tabIndex={open ? 0 : -1}
                  onClick={() => addSize(size)}
                  aria-label={out ? `${size}, unavailable in ${colour.name}` : `Add ${product.name}, ${colour.name}, size ${size} to bag`}
                  className={cn(
                    'label-sm nums min-h-11 flex-1 px-1 text-center transition-colors duration-200 focus-visible:-outline-offset-2',
                    out ? 'cursor-not-allowed text-stone line-through' : 'hover:bg-ink hover:text-bone',
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* The plus: always there on touch; on a pointer device it waits,
          invisible and out of the pointer's way, until the keyboard lands on it. */}
      <button
        ref={toggle}
        type="button"
        onClick={show}
        tabIndex={open ? -1 : 0}
        aria-expanded={open}
        aria-controls={barId}
        aria-label={`Quick add: ${product.name}`}
        className={cn(
          'absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center transition-opacity duration-200 focus-visible:-outline-offset-4',
          'before:absolute before:inset-[6px] before:bg-bone/90 before:content-[""]',
          '[@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0',
          open
            ? 'pointer-events-none opacity-0'
            : '[@media(hover:hover)]:focus-visible:pointer-events-auto [@media(hover:hover)]:focus-visible:opacity-100',
        )}
      >
        <Icon name="plus" className="relative h-4 w-4" />
      </button>
    </div>
  );
}
