'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ProductCard } from '@/components/commerce/ProductCard';
import { Icon } from '@/components/ui/Icon';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { pad2 } from '@/lib/format';
import { reduced } from '@/lib/gsap';

/**
 * A rail that starts on the page's left edge and runs off the right one, so
 * it reads as more to see. Swipe on touch; arrows on a desktop, which grey out
 * at either end.
 */
export function Rail({ title, products }: { title: string; products: Product[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const id = useId();

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const measure = () =>
      setEdge({ start: t.scrollLeft < 4, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 4 });
    const frame = requestAnimationFrame(measure);
    t.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      t.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const t = track.current;
    if (!t) return;
    const card = t.querySelector('li');
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    const w = card ? card.getBoundingClientRect().width + gap : t.clientWidth;
    const per = Math.max(1, Math.floor((t.clientWidth + gap) / w));
    t.scrollBy({ left: dir * w * per, behavior: reduced() ? 'auto' : 'smooth' });
  };

  const pad = 'max(var(--gutter), calc((100% - var(--page)) / 2))';

  return (
    <section aria-labelledby={id} className="section-y-sm">
      <div className="page flex items-center justify-between gap-6 border-t border-line pt-4">
        <div className="flex items-baseline gap-4">
          <h2 id={id} className="label">{title}</h2>
          <span className="label-sm nums text-mute">{pad2(products.length)}</span>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {([-1, 1] as const).map((dir) => {
            const off = dir === -1 ? edge.start : edge.end;
            return (
              <button
                key={dir}
                type="button"
                onClick={() => step(dir)}
                disabled={off}
                aria-label={dir === -1 ? 'Previous pieces' : 'Next pieces'}
                className={cn(
                  'flex h-11 w-11 items-center justify-center border transition-[border-color,opacity] duration-200',
                  off ? 'cursor-default border-line opacity-35' : 'border-line hover:border-ink',
                )}
              >
                <Icon name={dir === -1 ? 'arrowL' : 'arrowR'} className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <ul
        ref={track}
        className="no-bar mt-8 flex snap-x snap-mandatory gap-(--gutter) overflow-x-auto pb-2 md:mt-10"
        style={{ paddingInline: pad, scrollPaddingInline: pad }}
        data-reveal
      >
        {products.map((p, i) => (
          <li
            key={p.slug}
            className="w-[68%] shrink-0 snap-start md:w-[calc((100%-2*var(--gutter))/2.6)] lg:w-[calc((100%-3*var(--gutter))/4)]"
          >
            <ProductCard
              product={p}
              index={i}
              reveal={false}
              sizes="(min-width:1024px) 23vw, (min-width:768px) 36vw, 66vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
