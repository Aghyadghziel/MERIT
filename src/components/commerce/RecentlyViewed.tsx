'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Price } from '@/components/commerce/Price';
import { useStore } from '@/components/providers/Store';
import { getProduct } from '@/lib/catalog';

/** Renders nothing until there is something to show, so no empty rule appears. */
export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const { recent, ready } = useStore();
  const items = ready ? recent.filter((s) => s !== exclude).map(getProduct).filter(Boolean).slice(0, 5) : [];
  if (items.length === 0) return null;

  return (
    <section className="page section-y-sm" aria-labelledby="recent-title">
      <div className="rule-t pt-4">
        <h2 id="recent-title" className="label">Recently viewed</h2>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-(--gutter) gap-y-8 md:grid-cols-5">
        {items.map((p) => (
          <Link key={p!.slug} href={`/products/${p!.slug}`} className="group">
            <div className="frame frame-4-5">
              <Image
                src={`/img/${p!.images[0]}.webp`}
                alt=""
                width={400}
                height={500}
                sizes="(min-width:768px) 18vw, 45vw"
                className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
              />
            </div>
            <p className="mt-2.5 text-sm">{p!.name}</p>
            <Price amount={p!.price} compareAt={p!.compareAt} className="mt-1 text-mute" />
          </Link>
        ))}
      </div>
    </section>
  );
}
