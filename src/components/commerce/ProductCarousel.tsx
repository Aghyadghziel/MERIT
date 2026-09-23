'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/commerce/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';

/**
 * A scroll-snapped rail rather than a slider: the browser keeps doing the
 * scrolling, so momentum, trackpads and screen readers all behave. Pointer
 * drag is layered on top for mouse users, and the arrows move by one card.
 */
export function ProductCarousel({ products, label }: { products: Product[]; label: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Entrance: only the cards that can actually be seen are animated.
  useEffect(() => {
    const el = rail.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      const cards = [...el.querySelectorAll<HTMLElement>('[data-card]')];
      const visible = cards.filter((c) => c.offsetLeft < el.clientWidth + 40);
      gsap.fromTo(
        visible,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DUR.reveal,
          ease: EASE.reveal,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const by = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: by * dir, behavior: reduced() ? 'auto' : 'smooth' });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = rail.current;
    if (!el || e.pointerType === 'touch') return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0 };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = rail.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(dx);
    el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = rail.current;
    if (!el || !drag.current.active) return;
    drag.current.active = false;
    el.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="relative">
      <ul
        ref={rail}
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // A drag should not follow the link underneath it.
        onClickCapture={(e) => { if (drag.current.moved > 6) { e.preventDefault(); e.stopPropagation(); } }}
        className={cn(
          'no-bar -mx-(--gutter) flex snap-x snap-mandatory gap-6 overflow-x-auto px-(--gutter) pb-1',
          'cursor-grab active:cursor-grabbing',
        )}
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((p, i) => (
          <li
            key={p.slug}
            data-card
            className="w-[63vw] shrink-0 snap-start sm:w-[42vw] md:w-[31vw] lg:w-[23vw] xl:w-[21rem]"
          >
            <ProductCard product={p} index={i} reveal={false} sizes="(min-width:1024px) 23vw, (min-width:640px) 42vw, 63vw" />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center gap-6">
        <div className="h-px flex-1 bg-line" role="presentation">
          <div
            className="h-px w-1/3 origin-left bg-ink transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${progress * 200}%)` }}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous garments"
            className="flex h-11 w-11 items-center justify-center border border-line transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-line"
          >
            <Icon name="arrowL" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="More garments"
            className="flex h-11 w-11 items-center justify-center border border-line transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-line"
          >
            <Icon name="arrowR" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
