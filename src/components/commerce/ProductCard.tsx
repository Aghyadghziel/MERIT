'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ColourDots } from '@/components/commerce/ColourDots';
import { Price } from '@/components/commerce/Price';
import { StatusTag } from '@/components/commerce/StatusTag';
import { WishButton } from '@/components/commerce/WishButton';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import type { Product } from '@/lib/catalog';
import { isSoldOut } from '@/lib/catalog';
import { cn } from '@/lib/cn';

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
 * The card is deliberately quiet: no border, no shadow, no button until you
 * need one. Everything sits under one hairline that only appears on hover, and
 * the quick-add strip rises inside the image rather than pushing the grid.
 */
export function ProductCard({
  product, index, priority, sizes = '(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw', className, reveal = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const sold = isSoldOut(product);
  const href = `/products/${product.slug}`;

  return (
    <article
      className={cn('group relative', className)}
      onMouseLeave={() => setOpen(false)}
      {...(reveal ? { 'data-reveal': '' } : {})}
    >
      <div className="relative">
        <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
          <div className="frame frame-4-5">
            <Image
              src={`/img/${product.images[0]}.webp`}
              alt=""
              width={1400}
              height={1750}
              sizes={sizes}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              className={cn(
                'transition-opacity duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                product.images[1] && 'group-hover:opacity-0',
                sold && 'opacity-55',
              )}
            />
            {product.images[1] ? (
              <Image
                src={`/img/${product.images[1]}.webp`}
                alt=""
                width={1400}
                height={1750}
                sizes={sizes}
                loading="lazy"
                aria-hidden
                className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:opacity-100"
              />
            ) : null}
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <StatusTag product={product} className="pointer-events-auto bg-bone/85 px-1.5 py-0.5 backdrop-blur-[2px]" />
          <span className="pointer-events-auto ml-auto">
            <WishButton slug={product.slug} name={product.name} className="-m-1.5 bg-bone/80 backdrop-blur-[2px]" />
          </span>
        </div>

        <QuickAdd product={product} open={open} setOpen={setOpen} sold={sold} />
      </div>

      <div className="mt-3.5 flex items-start gap-3 border-t border-transparent pt-0 transition-colors group-hover:border-line">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-snug">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {product.name}
            </Link>
          </h3>
          <p className="label-sm mt-1.5 text-mute">
            {index !== undefined ? <span className="nums">{String(index + 1).padStart(2, '0')} · </span> : null}
            {product.category}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Price amount={product.price} compareAt={product.compareAt} />
          <ColourDots colours={product.colours} />
        </div>
      </div>
    </article>
  );
}

/**
 * Sizes appear inside the image on hover, on focus, or after a tap on the
 * plus. Picking one adds it straight to the bag and opens the drawer — no
 * interstitial, because the drawer is the confirmation.
 */
function QuickAdd({
  product, open, setOpen, sold,
}: { product: Product; open: boolean; setOpen: (v: boolean) => void; sold: boolean }) {
  const { add } = useStore();
  const { open: openOverlay } = useUi();
  const colour = product.colours[0];
  const single = product.sizes.length === 1;

  if (sold) {
    return (
      <div className="absolute inset-x-0 bottom-0 z-10 bg-bone/92 px-3 py-2.5 text-center backdrop-blur-[2px]">
        <span className="label-sm text-mute">Sold out</span>
      </div>
    );
  }

  const addSize = (size: string) => {
    add({ slug: product.slug, colour: colour.name, size, qty: 1 });
    openOverlay('cart');
    setOpen(false);
  };

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 translate-y-2 opacity-0 transition duration-200 ease-[cubic-bezier(.22,1,.36,1)]',
        'group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100',
        open && 'translate-y-0 opacity-100',
      )}
    >
      <div className="m-2 flex items-stretch bg-bone/94 backdrop-blur-[2px]">
        {single ? (
          <button
            type="button"
            className="label-sm flex-1 px-3 py-3 transition-colors hover:bg-ink hover:text-bone"
            onClick={() => addSize(product.sizes[0])}
          >
            Add to bag
          </button>
        ) : (
          product.sizes.map((size) => {
            const out = product.unavailable?.includes(`${colour.name}/${size}`);
            return (
              <button
                key={size}
                type="button"
                disabled={out}
                onClick={() => addSize(size)}
                aria-label={out ? `${size} — unavailable in ${colour.name}` : `Add ${product.name}, ${colour.name}, size ${size} to bag`}
                className={cn(
                  'label-sm flex-1 py-3 transition-colors',
                  out ? 'cursor-not-allowed text-stone line-through' : 'hover:bg-ink hover:text-bone',
                )}
              >
                {size}
              </button>
            );
          })
        )}
      </div>
      {/* Touch devices get an explicit control, since there is no hover. */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Hide sizes' : `Show sizes for ${product.name}`}
        className="absolute -top-12 right-2 hidden h-10 w-10 items-center justify-center bg-bone/90 backdrop-blur-[2px] max-[1024px]:flex"
      >
        <Icon name={open ? 'close' : 'plus'} className="h-4 w-4" />
      </button>
    </div>
  );
}
