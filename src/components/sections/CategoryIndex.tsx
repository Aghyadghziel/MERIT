'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { products, type Category } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';

const ROWS: { name: Category; img: string }[] = [
  { name: 'Outerwear', img: 'coat-meridian-1' },
  { name: 'Tailoring', img: 'cat-tailoring' },
  { name: 'Knitwear', img: 'knit-margin-1' },
  { name: 'Shirting', img: 'shirt-quiet-2' },
  { name: 'Trousers', img: 'trouser-column-3' },
  { name: 'Accessories', img: 'cat-accessories' },
];

/** Counted from the catalogue, so the index can never promise what is not there. */
const countOf = (c: Category) => products.filter((p) => p.category === c).length;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The shop as an index: six rows of type at poster size, each counted from the
 * catalogue. On a pointer, a picture follows the cursor with a little weight,
 * leaning into the direction of travel, and wipes upward from one category to
 * the next. On touch, each row carries its picture inline.
 */
export function CategoryIndex() {
  const [active, setActive] = useState<number | null>(null);
  const [prev, setPrev] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: (v: number) => void; y: (v: number) => void; r: (v: number) => void } | null>(null);
  const lastX = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = float.current;
    if (!el) return;
    const { gsap } = setupGsap();
    const calm = reduced();
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    // Reduced motion: the picture still sits under the cursor, but it is set
    // there directly, with no glide and no lean.
    if (calm) {
      const x = gsap.quickSetter(el, 'x', 'px') as (v: number) => void;
      const y = gsap.quickSetter(el, 'y', 'px') as (v: number) => void;
      follow.current = { x, y, r: () => {} };
    } else {
      follow.current = {
        x: gsap.quickTo(el, 'x', { duration: 0.65, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.65, ease: 'power3.out' }),
        r: gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3.out' }),
      };
    }
    return () => {
      follow.current = null;
      gsap.set(el, { clearProps: 'transform' });
    };
  }, []);

  const move = (e: React.PointerEvent) => {
    const f = follow.current;
    const box = area.current;
    if (!f || !box || e.pointerType !== 'mouse') return;
    const rect = box.getBoundingClientRect();
    f.x(e.clientX - rect.left);
    f.y(e.clientY - rect.top);
    const dx = lastX.current === null ? 0 : e.clientX - lastX.current;
    lastX.current = e.clientX;
    f.r(Math.max(-7, Math.min(7, dx * 0.35)));
  };

  const enter = (i: number) => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };
  // Keyboard focus has no cursor to follow: hang the picture off the row.
  const focusRow = (row: HTMLElement, i: number) => {
    const box = area.current;
    const f = follow.current;
    if (box && f) {
      const a = box.getBoundingClientRect();
      const b = row.getBoundingClientRect();
      f.x(a.width * 0.7);
      f.y(b.top - a.top + b.height / 2);
    }
    enter(i);
  };
  const leave = () => {
    setPrev(null);
    setActive(null);
    lastX.current = null;
    follow.current?.r(0);
  };

  const total = ROWS.reduce((n, r) => n + countOf(r.name), 0);

  return (
    <section className="page section-y" aria-labelledby="index-title">
      <div className="grid-page items-end gap-y-6">
        <div className="col-span-4 md:col-span-4 lg:col-span-8">
          <p className="label text-mute" data-reveal>
            The index <span className="nums">— {pad(ROWS.length)} categories, {pad(total)} pieces</span>
          </p>
          <h2 id="index-title" className="display-lg mt-4" data-reveal>Shop by category</h2>
        </div>
        <div className="col-span-4 md:col-span-2 lg:col-span-4 md:justify-self-end">
          <Link href="/collections/index" className="label group inline-flex min-h-11 items-center gap-3 border-b border-ink" data-reveal>
            Everything in the index
            <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div ref={area} className="relative mt-10 md:mt-14" onPointerMove={move} onPointerLeave={leave}>
        <ul>
          {ROWS.map((r, i) => {
            const dim = active !== null && active !== i;
            return (
              <li key={r.name} className="border-t border-ink last:border-b">
                <Link
                  href={`/collections/index?category=${encodeURIComponent(r.name)}`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && enter(i)}
                  onFocus={(e) => focusRow(e.currentTarget, i)}
                  onBlur={leave}
                  className="group flex items-center gap-3 py-[clamp(0.85rem,0.45rem+1.3vw,1.6rem)] md:gap-6"
                >
                  <span aria-hidden className="label-sm nums w-7 shrink-0 self-start pt-[0.35em] text-mute md:w-10">{pad(i + 1)}</span>
                  <span
                    data-reveal-line
                    className={cn(
                      'min-w-0 flex-1 whitespace-nowrap text-[clamp(2.1rem,0.5rem+7.4vw,9rem)] font-semibold uppercase leading-[0.84] tracking-[-0.06em]',
                      'transition-[color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:group-hover:translate-x-5',
                      dim ? 'text-stone-brand' : 'text-ink',
                    )}
                  >
                    <span className="pr-[0.12em]"><span>{r.name}</span></span>
                  </span>
                  <span aria-hidden className="label-sm nums hidden shrink-0 text-mute md:inline">
                    {pad(countOf(r.name))} pieces
                  </span>
                  <span className="hidden h-10 w-10 shrink-0 items-center justify-center border border-ink opacity-0 transition-[opacity,background-color,color] duration-300 group-hover:bg-ink group-hover:text-bone group-hover:opacity-100 group-focus-visible:opacity-100 md:inline-flex" aria-hidden>
                    <Icon name="arrowR" className="h-4 w-4" />
                  </span>
                  <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-bone-2 md:hidden">
                    <Image src={`/img/${r.img}.webp`} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="sr-only">, {countOf(r.name)} pieces</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* The picture that follows the cursor. Each category wipes up over the last. */}
        <div
          ref={float}
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-0 top-0 z-10 hidden w-[clamp(13rem,19vw,20rem)] transition-opacity duration-300 md:block',
            active === null ? 'opacity-0' : 'opacity-100',
          )}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-bone-2">
            {ROWS.map((r, i) => (
              <div
                key={r.name}
                className={cn(
                  'absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(.16,1,.3,1)]',
                  i === active ? 'z-20 [clip-path:inset(0_0_0_0)]' : i === prev ? 'z-10 [clip-path:inset(0_0_0_0)]' : 'z-0 [clip-path:inset(100%_0_0_0)]',
                )}
              >
                <Image src={`/img/${r.img}.webp`} alt="" fill sizes="20rem"
                  className={cn('object-cover transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)]', i === active ? 'scale-100' : 'scale-115')} />
              </div>
            ))}
          </div>
          <p className="label-sm nums mt-2 flex justify-between text-ink">
            <span>{active !== null ? ROWS[active].name : ''}</span>
            <span className="text-mute">{active !== null ? `${pad(countOf(ROWS[active].name))} pieces` : ''}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
