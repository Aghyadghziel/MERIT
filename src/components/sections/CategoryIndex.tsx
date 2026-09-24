'use client';

import Image from 'next/image';
import Link from '@/i18n/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useLocale, useT } from '@/i18n/client';
import { isSoldOut, products, type Category, type Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';

/**
 * The two listings a category can open onto, each with the exact pool that
 * listing shows, so a row's number is always the number of pieces its link
 * opens onto. This season mirrors New arrivals (src/app/new/page.tsx):
 * Foundation and the runway pieces made for sale, nothing marked down or sold
 * out. The Index is the permanent range, as its collection page lists it.
 */
const inSeason = (p: Product) =>
  (p.collection === 'foundation' || p.collection === 'runway-01') && !p.compareAt && !isSoldOut(p);
const SOURCES = [
  { href: '/new', where: 'This season', pool: products.filter(inSeason) },
  { href: '/collections/index', where: 'Index', pool: products.filter((p) => p.collection === 'index') },
] as const;
const SEASON = SOURCES[0];

/**
 * One picture per category, each a piece the row's link actually shows, and
 * none of them a picture the home page has already used in the rooms above.
 */
const CATEGORIES: { name: Category; img: string }[] = [
  { name: 'Outerwear', img: 'coat-meridian-1' },
  { name: 'Tailoring', img: 'blazer-archive-1' },
  { name: 'Knitwear', img: 'knit-margin-1' },
  { name: 'Shirting', img: 'shirt-quiet-2' },
  { name: 'Trousers', img: 'trouser-pleat-m-1' },
  { name: 'Accessories', img: 'bag-knot-1' },
];

type Row = { name: Category; img: string; href: string; count: number; where: string };

/** Each category opens onto whichever listing holds most of it; a category neither holds is left out. */
const ROWS: Row[] = CATEGORIES.flatMap(({ name, img }) => {
  const [best] = SOURCES.map((s) => ({ s, count: s.pool.filter((p) => p.category === name).length }))
    .sort((a, b) => b.count - a.count);
  if (!best || best.count === 0) return [];
  return [{ name, img, count: best.count, where: best.s.where, href: `${best.s.href}?category=${encodeURIComponent(name)}` }];
});

const pad = (n: number) => String(n).padStart(2, '0');

/** Where the picture hangs from the cursor: up and to one side, never over the word. */
const HANG = { gap: 28, lift: 0.62 };

/**
 * The shop as an index: a row of type at poster size for each category, each
 * counted from the listing it opens. On a pointer, a picture follows the cursor with a little weight,
 * leaning into the direction of travel, and wipes upward from one category to
 * the next. On touch, each row carries its picture inline.
 */
export function CategoryIndex() {
  const t = useT();
  const ar = useLocale() === 'ar';
  /** "06 pieces": Arabic takes the plural only from three to ten. */
  const pieces = (n: number, padded = true) =>
    `${padded ? pad(n) : n} ${t((ar ? n >= 3 && n <= 10 : n !== 1) ? 'pieces' : 'piece')}`;
  const [active, setActive] = useState<number | null>(null);
  const [prev, setPrev] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: (v: number) => void; y: (v: number) => void; r: (v: number) => void } | null>(null);
  const lastX = useRef<number | null>(null);
  /** Each row's word, to keep the picture clear of the one being read. */
  const words = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = float.current;
    if (!el) return;
    const { gsap } = setupGsap();
    const calm = reduced();
    // Reduced motion: the picture still hangs by the cursor, but it is set
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

  /**
   * Hang the picture beside a point in the area, lifted above it: to the
   * right of the word under the point (or of the point, once past the word),
   * or to the left of the point when there is no room on the right. So the
   * picture never covers the word being read and never leaves the page.
   * In Arabic the words run from the right, so all of that is mirrored.
   */
  const hang = (px: number, py: number, row: number | null) => {
    const f = follow.current;
    const box = area.current;
    const pic = float.current;
    if (!f || !box || !pic) return;
    const w = pic.offsetWidth;
    const h = pic.offsetHeight;
    const word = row === null ? null : words.current[row];
    const left = box.getBoundingClientRect().left;
    if (ar) {
      // The word's left edge, less the 1.25rem it slides on hover.
      const end = word ? word.getBoundingClientRect().left - left - 20 : box.clientWidth;
      const from = Math.min(px, end) - HANG.gap - w;
      f.x(from >= 0 ? from : px + HANG.gap);
    } else {
      // The word's right edge, plus the 1.25rem it slides on hover.
      const end = word ? word.getBoundingClientRect().right - left + 20 : 0;
      const from = Math.max(px, end) + HANG.gap;
      f.x(from + w <= box.clientWidth ? from : px - w - HANG.gap);
    }
    f.y(Math.max(-h * 0.35, py - h * HANG.lift));
  };

  const move = (e: React.PointerEvent) => {
    const f = follow.current;
    const box = area.current;
    if (!f || !box || e.pointerType !== 'mouse') return;
    const rect = box.getBoundingClientRect();
    hang(e.clientX - rect.left, e.clientY - rect.top, active);
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
    if (box) {
      const a = box.getBoundingClientRect();
      const b = row.getBoundingClientRect();
      hang(ar ? box.clientWidth : 0, b.top - a.top + b.height / 2, i);
    }
    enter(i);
  };
  const leave = () => {
    setPrev(null);
    setActive(null);
    lastX.current = null;
    follow.current?.r(0);
  };


  return (
    <section className="page section-y" aria-labelledby="index-title">
      <div className="grid-page items-end gap-y-6">
        <div className="col-span-4 md:col-span-4 lg:col-span-8">
          <p className="label nums text-mute" data-reveal>
            {t('The shop — {n} categories, this season and the {index}', { n: pad(ROWS.length), index: t('Index') })}
          </p>
          <h2 id="index-title" className="display-lg mt-4" data-reveal>{t('Shop by category')}</h2>
        </div>
        <div className="col-span-4 md:col-span-2 lg:col-span-4 md:justify-self-end">
          <Link href={SEASON.href} className="label group inline-flex min-h-11 items-center gap-3 border-b border-ink" data-reveal>
            <span>{t('Shop this season')} <span className="nums">— {pieces(SEASON.pool.length)}</span></span>
            <Icon name="arrowR" className={cn('h-3.5 w-3.5 transition-transform duration-300', ar ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1')} />
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
                  href={r.href}
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
                      'transition-[color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                      ar ? 'md:group-hover:-translate-x-5' : 'md:group-hover:translate-x-5',
                      dim ? 'text-stone' : 'text-ink',
                    )}
                  >
                    <span className="pe-[0.12em]"><span ref={(n) => { words.current[i] = n; }}>{t(r.name)}</span></span>
                  </span>
                  <span aria-hidden className="label-sm nums hidden shrink-0 text-end text-mute md:block">
                    {pieces(r.count)}
                    <span className="mt-1.5 block">{t(r.where)}</span>
                  </span>
                  <span className="hidden h-10 w-10 shrink-0 items-center justify-center border border-ink opacity-0 transition-[opacity,background-color,color] duration-300 group-hover:bg-ink group-hover:text-bone group-hover:opacity-100 group-focus-visible:opacity-100 md:inline-flex" aria-hidden>
                    <Icon name="arrowR" className="h-4 w-4" />
                  </span>
                  <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-bone-2 md:hidden">
                    <Image src={`/img/${r.img}.webp`} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="sr-only">{t(', {count}, {where}', { count: pieces(r.count, false), where: r.where === 'Index' ? t('in the {index}', { index: t('Index') }) : t('this season') })}</span>
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
            <span>{active !== null ? t(ROWS[active].name) : ''}</span>
            <span className="text-mute">{active !== null ? pieces(ROWS[active].count) : ''}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
