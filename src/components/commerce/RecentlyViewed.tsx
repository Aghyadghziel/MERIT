'use client';

import Image from 'next/image';
import Link from 'next/link';
import { fitClass, imageSrc } from '@/app/products/[slug]/_parts/media';
import { Price } from '@/components/commerce/Price';
import { useStore } from '@/components/providers/Store';
import { getProduct } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';
import { pad2 } from '@/lib/format';

/**
 * A small, quiet strip: the last few pieces looked at, as thumbnails. Renders
 * nothing until there is something to show, so no empty rule appears.
 */
export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const { recent, ready } = useStore();
  const items = ready
    ? recent
        .filter((s) => s !== exclude)
        .map(getProduct)
        .filter((p): p is Product => Boolean(p))
        .slice(0, 6)
    : [];
  if (items.length === 0) return null;

  return (
    <section className="page section-y-sm" aria-labelledby="recent-title">
      <div className="flex items-baseline gap-4 border-t border-line pt-4">
        <h2 id="recent-title" className="label">Recently viewed</h2>
        <span className="label-sm nums text-mute">{pad2(items.length)}</span>
      </div>
      <ul className="mt-8 grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 md:grid-cols-6 md:gap-x-(--gutter)">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/products/${p.slug}`} className="group block">
              <span className="relative block aspect-[4/5] overflow-hidden bg-bone-2">
                <Image
                  src={imageSrc(p.images[0])}
                  alt=""
                  fill
                  sizes="(min-width:768px) 15vw, 31vw"
                  className={`${fitClass(p.images[0])} transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]`}
                />
              </span>
              <span className="mt-2.5 block truncate text-[0.8125rem] leading-snug">{p.name}</span>
              <Price amount={p.price} compareAt={p.compareAt} size="xs" className="mt-0.5 text-mute" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
