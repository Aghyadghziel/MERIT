'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Price } from '@/components/commerce/Price';
import { Icon } from '@/components/ui/Icon';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';

/**
 * Every point is something visible in the photograph or stated in the
 * catalogue entry: nothing here is invented. x/y are percentages of the square
 * flat shot (public/img/anatomy/*.webp, 1254 px, alpha).
 */
type Point = { x: number; y: number; name: string; note: string; side: 'l' | 'r' };
type Jacket = { key: string; label: string; img: string; under: string; points: Point[] };

const JACKETS: Jacket[] = [
  {
    key: 'plane-technical-jacket',
    label: 'Sand',
    img: '/img/anatomy/sand.webp',
    under: '/img/anatomy/leather-on-sand.webp',
    points: [
      { x: 50, y: 9, name: 'Stand collar', note: 'Cut to stand without a stiffener.', side: 'r' },
      { x: 63.5, y: 32.5, name: 'Chest zip pocket', note: 'Set flat, on the left breast.', side: 'r' },
      { x: 49.8, y: 50, name: 'Two-way zip', note: 'Opens from the hem when you sit.', side: 'l' },
      { x: 31, y: 63, name: 'Bonded cotton twill, 300g', note: 'Holds its shape without padding.', side: 'l' },
      { x: 20, y: 88, name: 'Elasticated cuff', note: 'Hem and cuff close on the body.', side: 'l' },
    ],
  },
  {
    key: 'axis-leather-jacket',
    label: 'Black leather',
    img: '/img/anatomy/leather.webp',
    under: '/img/anatomy/sand-on-leather.webp',
    points: [
      { x: 36, y: 19, name: 'Shirt collar', note: 'Lies flat, open or closed.', side: 'l' },
      { x: 28, y: 40, name: 'Vegetable-tanned lambskin', note: 'Softens with wear rather than creasing.', side: 'l' },
      { x: 50, y: 46, name: 'Cupro lining', note: 'Slides on over a sleeve.', side: 'r' },
      { x: 58.5, y: 62, name: 'Two-way zip', note: 'Nothing else on the front.', side: 'r' },
      { x: 17.5, y: 90, name: 'Rib cuff', note: 'Knitted, to close at the wrist.', side: 'l' },
    ],
  },
];

/**
 * The reveal: the other jacket lies under this one, aligned to the same
 * outline (public/img/anatomy/*-on-*.webp), and the pointer wipes a soft,
 * liquid hole through the top one. Three circles chase the pointer at
 * different speeds, so a fast move stretches the hole into a drop and it
 * settles round when the hand stops.
 */
const REVEAL = 0.2;            // radius, as a share of the stage width
const CHASE = [0.2, 0.12, 0.075];

/**
 * Anatomy of a jacket. The flat shot at poster scale on stone, five numbered
 * points drawn onto it with leader lines, and under the pointer the other
 * jacket wipes through in the same place (see REVEAL). Switch between the two jackets; each
 * point is also a row in the index beside it, and the two stay in step.
 */
export function JacketAnatomy({ products }: { products: Record<string, Product | undefined> }) {
  const [j, setJ] = useState(0);
  const [on, setOn] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const under = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const hover = useRef({ in: false, x: 0, y: 0, r: 0, pts: CHASE.map(() => ({ x: 0, y: 0 })), raf: 0 });
  const jacket = JACKETS[j];
  const product = products[jacket.key];

  // Entrance: the jacket rises, then the points arrive in order, lines drawing.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.from('[data-an="jacket"]', {
        yPercent: 8, opacity: 0, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 65%', once: true, onEnter: () => { seen.current = true; } },
      });
      gsap.from('[data-an="title"] > *', {
        yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // Points and lines play in whenever the jacket changes (and on first view).
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.from('[data-an="dot"]', { scale: 0, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.09 })
        .from('[data-an="line"]', { strokeDashoffset: 1, duration: 0.6, ease: 'power2.out', stagger: 0.09 }, 0.15)
        .from('[data-an="tag"]', { opacity: 0, x: (i, t: HTMLElement) => (t.dataset.side === 'l' ? 10 : -10), duration: 0.5, ease: 'power3.out', stagger: 0.09 }, 0.3);
      if (seen.current) tl.play();
      else setupGsap().ScrollTrigger.create({ trigger: el, start: 'top 60%', once: true, onEnter: () => tl.play() });
    }, el);
    return () => ctx.revert();
  }, [j]);

  const switchTo = useCallback((next: number) => {
    if (next === j) return;
    const el = stage.current?.querySelector('[data-an="jacket"]');
    if (!el || reduced()) { setJ(next); setOn(null); return; }
    const { gsap } = setupGsap();
    gsap.to(el, {
      clipPath: 'inset(0 0 100% 0)', duration: 0.45, ease: 'power3.in',
      onComplete: () => {
        setJ(next); setOn(null);
        gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'expo.out', clearProps: 'clipPath' });
      },
    });
  }, [j]);

  // ─── the reveal loop: springs toward the pointer, paints the mask ───────
  const paint = useCallback(function tick() {
    const h = hover.current, el = under.current, st = stage.current;
    if (!el || !st) return;
    const w = st.clientWidth;
    const still = reduced();
    const target = h.in ? REVEAL * w : 0;
    h.r += (target - h.r) * (still ? 1 : 0.14);
    h.pts.forEach((p, i) => {
      const k = still ? 1 : CHASE[i];
      p.x += (h.x - p.x) * k; p.y += (h.y - p.y) * k;
    });
    const [a, b, c] = h.pts;
    const g = (p: { x: number; y: number }, r: number) =>
      `radial-gradient(circle ${Math.max(r, 0.01).toFixed(1)}px at ${p.x.toFixed(1)}px ${p.y.toFixed(1)}px, #000 90%, transparent 100%)`;
    const m = [g(a, h.r), g(b, h.r * 0.78), g(c, h.r * 0.58)].join(', ');
    el.style.setProperty('-webkit-mask-image', m);
    el.style.setProperty('mask-image', m);
    if (chip.current) {
      chip.current.style.transform = `translate(${a.x + h.r * 0.72}px, ${a.y + h.r * 0.72}px)`;
      chip.current.style.opacity = String(Math.min(1, h.r / (REVEAL * w * 0.6)));
    }
    const moving = Math.abs(target - h.r) > 0.3 || h.pts.some((p) => Math.abs(p.x - h.x) + Math.abs(p.y - h.y) > 0.3);
    h.raf = moving ? requestAnimationFrame(tick) : 0;
  }, []);
  const kick = useCallback(() => { if (!hover.current.raf) hover.current.raf = requestAnimationFrame(paint); }, [paint]);
  useEffect(() => { const h = hover.current; return () => cancelAnimationFrame(h.raf); }, []);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const h = hover.current;
    h.x = e.clientX - r.left; h.y = e.clientY - r.top;
    if (!h.in) { h.in = true; if (h.r < 1) h.pts.forEach((p) => { p.x = h.x; p.y = h.y; }); }
    kick();
  };
  const leave = () => { hover.current.in = false; kick(); };
  const other = j === 0 ? 1 : 0;

  // Keyboard: arrows walk the points while the index has focus.
  useEffect(() => { setOn(null); }, [j]);

  return (
    <section ref={root} className="relative overflow-hidden bg-stone-brand text-ink" aria-labelledby="anatomy-title">
      <div className="page grid-page section-y items-center gap-y-12">
        {/* The index */}
        <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:self-stretch lg:py-6">
          <div className="flex h-full flex-col">
            <p className="label text-graphite">Anatomy — Foundation outerwear</p>
            <h2 id="anatomy-title" data-an="title" className="mt-5 text-[clamp(3rem,1rem+5.2vw,6.25rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              <span className="block overflow-hidden pb-[0.05em]"><span className="block">Read the</span></span>
              <span className="block overflow-hidden pb-[0.05em]"><span className="block">jacket.</span></span>
            </h2>

            {/* Both jackets, chosen by picture: the one being read is lit. */}
            <div role="tablist" aria-label="Choose a jacket to read" className="mt-8 grid grid-cols-2 gap-2">
              {JACKETS.map((jk, i) => {
                const p = products[jk.key];
                const sel = i === j;
                return (
                  <button key={jk.key} type="button" role="tab" aria-selected={sel} onClick={() => switchTo(i)}
                    className={cn('group flex items-center gap-3 border p-2 pr-3 text-left transition-colors duration-300',
                      sel ? 'border-ink bg-ink text-bone' : 'border-ink/30 hover:border-ink')}>
                    <span className={cn('relative block aspect-square w-14 shrink-0 transition-colors duration-300', sel ? 'bg-bone/10' : 'bg-bone/50')}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- tiny flat shot */}
                      <img src={jk.img} alt="" width={112} height={112} className="h-full w-full object-contain p-1" draggable={false} />
                    </span>
                    <span className="min-w-0">
                      <span className={cn('label-sm block', sel ? 'text-bone/70' : 'text-graphite')}>{String(i + 1).padStart(2, '0')} · {jk.label}</span>
                      <span className="mt-1 block text-sm font-semibold leading-tight tracking-[-0.02em]">{p?.name ?? jk.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <ol className="mt-10 border-t border-ink/25">
              {jacket.points.map((p, i) => (
                <li key={`${jacket.key}-${p.name}`} className="border-b border-ink/25">
                  <button type="button" onPointerEnter={() => setOn(i)} onPointerLeave={() => setOn(null)}
                    onFocus={() => setOn(i)} onBlur={() => setOn(null)}
                    aria-describedby={`an-note-${i}`}
                    className="group flex w-full items-baseline gap-4 py-3.5 text-left">
                    <span className={cn('label-sm nums w-6 transition-colors', on === i ? 'text-ink' : 'text-graphite/70')}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1">
                      <span className={cn('block text-[1.05rem] font-semibold tracking-[-0.02em] transition-transform duration-300', on === i && 'translate-x-1.5')}>{p.name}</span>
                      <span id={`an-note-${i}`} className="mt-0.5 block text-sm text-graphite">{p.note}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {product ? (
              <div className="mt-auto flex items-center justify-between gap-4 pt-10">
                <div>
                  <p className="text-[1.05rem] font-semibold tracking-[-0.02em]">{product.name}</p>
                  <p className="label-sm mt-1 text-graphite">{product.madeIn}</p>
                </div>
                <div className="flex items-center gap-5">
                  <Price amount={product.price} className="text-sm" />
                  <Link href={`/products/${product.slug}`} className="btn btn-solid">
                    Shop <Icon name="arrowR" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* The jacket, the points, the reveal */}
        <div className="order-first col-span-4 md:col-span-6 lg:order-none lg:col-span-7 lg:col-start-6">
          <div ref={stage} data-cursor-hide className="relative mx-auto aspect-square w-full max-w-[min(100%,82svh)] select-none touch-pan-y"
            onPointerMove={move} onPointerLeave={leave}
            onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; if (hover.current.r > 8) switchTo(other); }}>
            <div data-an="jacket" className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- flat shot, alpha */}
              <img src={jacket.img} alt={`${jacket.label} ${product?.name ?? 'jacket'}, laid flat, front view.`} width={1254} height={1254}
                className="h-full w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.14)]" draggable={false} />
              {/* the other jacket, wiped in under the pointer */}
              <div ref={under} aria-hidden className="pointer-events-none absolute inset-0 bg-stone-brand"
                style={{ WebkitMaskImage: 'radial-gradient(circle 0px at 0 0, #000, transparent)', maskImage: 'radial-gradient(circle 0px at 0 0, #000, transparent)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- aligned flat shot of the other jacket */}
                <img src={jacket.under} alt="" width={1254} height={1254} draggable={false}
                  className="h-full w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.14)]" />
              </div>
            </div>

            {/* Leader lines + points */}
            <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {jacket.points.map((p, i) => {
                const x2 = p.side === 'l' ? Math.max(p.x - 14, 2) : Math.min(p.x + 14, 98);
                return (
                  <line key={`${jacket.key}-l${i}`} data-an="line" x1={p.x} y1={p.y} x2={x2} y2={p.y} pathLength={1}
                    strokeDasharray={1} strokeDashoffset={0} strokeWidth={on === i ? 0.26 : 0.15}
                    className={cn('transition-[stroke] duration-300', on === i ? 'stroke-ink' : 'stroke-ink/50')} />
                );
              })}
            </svg>
            {jacket.points.map((p, i) => {
              const tx = p.side === 'l' ? Math.max(p.x - 14, 2) : Math.min(p.x + 14, 98);
              return (
                <div key={`${jacket.key}-p${i}`}>
                  <button type="button" data-an="dot" aria-label={`${String(i + 1).padStart(2, '0')}: ${p.name}. ${p.note}`}
                    onPointerEnter={() => setOn(i)} onPointerLeave={() => setOn(null)} onFocus={() => setOn(i)} onBlur={() => setOn(null)}
                    className="absolute z-10 -ml-[22px] -mt-[22px] flex h-11 w-11 items-center justify-center"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    <span className={cn('absolute h-full w-full rounded-full border border-ink/40 transition-transform duration-500', on === i ? 'scale-100' : 'scale-50 opacity-0')} />
                    <span className={cn('label-sm nums flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300',
                      on === i ? 'bg-ink text-bone' : 'bg-bone text-ink shadow-[0_0_0_1px_rgba(0,0,0,0.5)]')}>{i + 1}</span>
                  </button>
                  <span data-an="tag" data-side={p.side} aria-hidden
                    className={cn('label-sm pointer-events-none absolute hidden -translate-y-1/2 whitespace-nowrap bg-bone px-2 py-1 transition-colors duration-300 md:block',
                      p.side === 'l' ? '-translate-x-full pr-2' : 'pl-2', on === i ? 'bg-ink text-bone' : 'text-ink')}
                    style={{ left: `${tx}%`, top: `${p.y}%` }}>
                    {p.name}
                  </span>
                </div>
              );
            })}

            {/* what the hole shows, riding beside it */}
            <div ref={chip} aria-hidden className="label-sm pointer-events-none absolute left-0 top-0 z-20 whitespace-nowrap bg-ink px-2.5 py-1.5 text-bone opacity-0 max-md:hidden">
              {JACKETS[other].label} — click to read
            </div>
          </div>
          <p className="label-sm mt-4 text-center text-graphite">{`Move over the jacket to see it in ${JACKETS[other].label.toLowerCase()}`}</p>
        </div>
      </div>
    </section>
  );
}
