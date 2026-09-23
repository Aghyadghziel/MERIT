'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { WishButton } from '@/components/commerce/WishButton';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import type { Product } from '@/lib/catalog';
import { isSoldOut, statusLabel } from '@/lib/catalog';
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

/**
 * One card, three sizes. The card is its own container, so the same markup
 * sets a phone's two-up grid, a desktop's four-up and the two-up "large" view
 * without the parent having to say which it is:
 *
 *   narrow   name, price and colour stacked under the picture
 *   regular  a catalogue line — number, name, category — with the price opposite
 *   large    the regular line at reading size, plus the one-line summary
 *
 * On a pointer, the second photograph is drawn up over the first by the house
 * mask, and the sizes rise inside the picture. On touch, a plus opens them.
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
  const [first, second] = product.images;
  const code = ready ? currency : 'SAR';

  return (
    <article
      className={cn('group/card @container relative', className)}
      onMouseLeave={() => setOpen(false)}
      {...(reveal ? { 'data-reveal': '' } : {})}
    >
      <div className="relative">
        <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
          <div className="frame frame-4-5">
            <Image
              src={`/img/${first}.webp`}
              alt=""
              width={1400}
              height={1750}
              sizes={sizes}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
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

      {/* The catalogue line. */}
      <div className="mt-3 grid grid-cols-1 gap-y-1 @min-[14rem]:mt-3.5 @min-[14rem]:grid-cols-[minmax(0,1fr)_auto] @min-[14rem]:gap-x-4 @min-[30rem]:mt-5">
        <h3 className="text-[0.8125rem] font-medium leading-[1.3] tracking-[-0.01em] @min-[14rem]:col-start-1 @min-[14rem]:row-start-1 @min-[14rem]:text-sm @min-[30rem]:text-xl @min-[30rem]:leading-tight @min-[30rem]:tracking-[-0.025em]">
          <Link
            href={href}
            className={cn(
              'bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-px',
              'transition-[background-size] duration-500 ease-expo group-hover/card:bg-[length:100%_1px]',
              "after:absolute after:inset-0 after:content-['']",
            )}
          >
            {product.name}
          </Link>
        </h3>

        <p className="nums text-[0.8125rem] leading-[1.3] @min-[14rem]:col-start-2 @min-[14rem]:row-start-1 @min-[14rem]:text-right @min-[14rem]:text-sm @min-[30rem]:text-base">
          <span className={cn(product.compareAt ? 'text-oxide' : null)}>{formatPrice(product.price, code)}</span>
          {product.compareAt ? (
            <span className="ml-2 text-mute line-through">
              <span className="sr-only">Was </span>
              {formatPrice(product.compareAt, code)}
            </span>
          ) : null}
        </p>

        <p className="label-sm hidden text-mute @min-[14rem]:col-start-1 @min-[14rem]:row-start-2 @min-[14rem]:block">
          {index !== undefined ? <span className="nums">{pad2(index + 1)} — </span> : null}
          {product.category}
        </p>

        <Swatches product={product} />

        <p className="mt-1.5 hidden max-w-[44ch] text-sm leading-relaxed text-mute @min-[30rem]:col-span-2 @min-[30rem]:block">
          {product.summary}
        </p>
      </div>
    </article>
  );
}

/** Small squares, not circles: the grid has no curves anywhere else. */
function Swatches({ product }: { product: Product }) {
  const { colours } = product;
  return (
    <span className="mt-1 flex items-center gap-1.5 @min-[14rem]:col-start-2 @min-[14rem]:row-start-2 @min-[14rem]:mt-0 @min-[14rem]:justify-self-end">
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
 * Sizes rise inside the picture on hover, on focus, or after a tap on the
 * plus. The bar says which colour it adds — the first — so nothing lands in
 * the bag by surprise; the drawer opening is the confirmation.
 */
function QuickAdd({
  product, open, setOpen,
}: { product: Product; open: boolean; setOpen: (v: boolean) => void }) {
  const { add } = useStore();
  const { open: openOverlay } = useUi();
  const colour = product.colours[0];
  const single = product.sizes.length === 1;

  const addSize = (size: string) => {
    add({ slug: product.slug, colour: colour.name, size, qty: 1 });
    openOverlay('cart');
    setOpen(false);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 p-1.5 @min-[14rem]:p-2.5">
      <div
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
          {/* Touch only: the bar's own way out. */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Hide sizes"
            tabIndex={open ? 0 : -1}
            className="-my-1 flex h-9 w-9 items-center justify-center [@media(hover:hover)]:hidden"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
        {single ? (
          <button
            type="button"
            className="label-sm flex min-h-11 w-full items-center justify-center gap-2 transition-colors hover:bg-ink hover:text-bone"
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
                  disabled={out}
                  onClick={() => addSize(size)}
                  aria-label={out ? `${size}, unavailable in ${colour.name}` : `Add ${product.name}, ${colour.name}, size ${size} to bag`}
                  className={cn(
                    'label-sm nums min-h-11 flex-1 px-1 text-center transition-colors duration-200',
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

      {/* Touch devices get an explicit control, since there is no hover. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label={`Show sizes for ${product.name}`}
        className={cn(
          'absolute bottom-1 right-1 h-11 w-11 items-center justify-center transition-opacity duration-200',
          'before:absolute before:inset-[6px] before:bg-bone/90 before:content-[""]',
          'hidden [@media(hover:none)]:flex',
          open && 'pointer-events-none opacity-0',
        )}
      >
        <Icon name="plus" className="relative h-4 w-4" />
      </button>
    </div>
  );
}
