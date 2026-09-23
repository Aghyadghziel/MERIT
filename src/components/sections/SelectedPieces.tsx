'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Price } from '@/components/commerce/Price';
import { ProductCard } from '@/components/commerce/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Four pieces, hung like a rail. On a wide screen the price list stays in the
 * margin, typed like a catalogue page, while the pictures pass beside it in two
 * columns that drift against each other. On a phone the pieces become a rail
 * you swipe, each one almost the width of the screen.
 */
export function SelectedPieces({ products }: { products: Product[] }) {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const grid = el.querySelector('[data-sp="grid"]');
      const drift = (sel: string, from: number, to: number) =>
        gsap.fromTo(el.querySelectorAll(sel), { y: from }, {
          y: to, ease: 'none',
          scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      drift('[data-sp-drift="a"]', 40, -40);
      drift('[data-sp-drift="b"]', 110, -110);
    });
    return () => mm.revert();
  }, []);

  // The phone rail's hairline fills as it is swiped.
  const onRail = () => {
    const r = rail.current;
    if (!r || !bar.current) return;
    const seen = r.scrollWidth > 0 ? (r.scrollLeft + r.clientWidth) / r.scrollWidth : 1;
    bar.current.style.transform = `scaleX(${Math.min(1, seen)})`;
  };
  useEffect(onRail, []);

  return (
    <section ref={root} className="section-y" aria-labelledby="selected-title">
      <div className="page grid-page items-end gap-y-8">
        <div className="col-span-4 md:col-span-6 lg:col-span-9">
          <p className="label text-mute" data-reveal>
            Selected <span className="nums">— {pad(products.length)}</span> pieces
          </p>
          <h2 id="selected-title" className="display-xl mt-5 max-w-[12ch] text-balance">
            <Lines text="Built to be worn for years." />
          </h2>
        </div>
        <p className="col-span-4 max-w-[34ch] text-mute md:col-span-4 lg:col-span-3 lg:pb-3" data-reveal>
          A coat, a jacket, the trouser the whole range is proportioned against, and a bag with
          nothing on it.
        </p>
      </div>

      <div className="page grid-page mt-12 md:mt-20 lg:mt-24">
        {/* The margin: a catalogue page that stays put while the rail passes. */}
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Selected pieces, with prices">
          <div className="sticky top-[calc(var(--header-offset,var(--nav-h))+2.5rem)] transition-[top] duration-500 ease-[cubic-bezier(.16,1,.3,1)]">
            <ol className="rule-t">
              {products.map((p, i) => (
                <li key={p.slug} className="rule-b">
                  <Link href={`/products/${p.slug}`} className="group grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 py-4">
                    <span className="label-sm nums text-mute">{pad(i + 1)}</span>
                    <span className="text-sm leading-snug transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1">
                      {p.name}
                      <span className="label-sm mt-1 block text-mute">{p.category}</span>
                    </span>
                    <Price amount={p.price} compareAt={p.compareAt} />
                  </Link>
                </li>
              ))}
            </ol>
            <Link href="/new" className="btn btn-solid mt-8 w-full justify-between">
              Shop everything new <Icon name="arrowR" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>

        <div className="col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-5">
          <div
            ref={rail}
            onScroll={onRail}
            data-sp="grid"
            className={cn(
              'no-bar -mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-3 overflow-x-auto px-(--gutter)',
              'md:mx-0 md:grid md:grid-cols-2 md:gap-x-(--gutter) md:gap-y-20 md:overflow-visible md:px-0 md:pb-[9%]',
            )}
          >
            {products.map((p, i) => (
              <div key={p.slug} className={cn('w-[78vw] shrink-0 snap-start md:w-auto', i % 2 === 1 && 'md:translate-y-[26%]')}>
                <div data-sp-drift={i % 2 === 1 ? 'b' : 'a'}>
                  <ProductCard product={p} index={i} sizes="(min-width:1024px) 30vw, (min-width:768px) 46vw, 78vw" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center gap-5 md:hidden" aria-hidden>
            <span className="relative h-px flex-1 bg-line">
              <span ref={bar} className="absolute inset-0 origin-left bg-ink transition-transform duration-200" style={{ transform: 'scaleX(0.25)' }} />
            </span>
            <span className="label-sm nums text-mute">{pad(products.length)} pieces</span>
          </div>

          <Link href="/new" className="btn btn-solid mt-8 w-full justify-between md:mt-4 md:w-auto md:gap-10 lg:hidden">
            Shop everything new <Icon name="arrowR" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
