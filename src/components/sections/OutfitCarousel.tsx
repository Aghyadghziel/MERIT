'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Price } from '@/components/commerce/Price';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';
import { FRAME, maskStyle, PLACEHOLDER, type Outfit } from '@/lib/outfits';

export type OutfitItem = Outfit & { product: Product };

const DUR = 0.65;
const EASE = 'power3.inOut';
const AUTOPLAY_MS = 7000;

/** Signed shortest distance from `from` to `to` around a ring of `n`. */
const ringOffset = (from: number, to: number, n: number) => {
  let d = (to - from) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
};

/**
 * One model, one pose, three garments. The base frame never moves. Each jacket
 * frame sits over it through a mask that only admits the torso and arms, so
 * a change reads as the garment changing, not the picture. Side previews are
 * the garments alone, flat, either side of the model, and slide as the ring turns.
 */
export function OutfitCarousel({ items }: { items: OutfitItem[] }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0); // lags `active` through the info transition
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const prev = useRef(0);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const idle = useRef<number>(0);
  const drag = useRef({ on: false, x: 0, moved: 0 });
  const wheel = useRef({ acc: 0, lock: 0 });
  const { add } = useStore();
  const { open } = useUi();

  const current = items[shown];
  const unavailable = (s: string) => current.product.unavailable?.includes(`${current.colour}/${s}`) ?? false;

  // Measure the frame so the ring positions scale with it.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStageWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const slot = useCallback(
    (d: number, w: number) => {
      const mobile = window.innerWidth < 768;
      const a = Math.abs(d);
      const sign = Math.sign(d);
      if (a === 0) return { x: 0, scale: 1, opacity: 0, blur: 0 };
      if (a === 1) return { x: sign * w * (mobile ? 0.95 : 1.05), scale: 1, opacity: 0.9, blur: 0 };
      if (a === 2) return { x: sign * w * 1.75, scale: 0.85, opacity: mobile ? 0 : 0.35, blur: 1.5 };
      return { x: sign * w * 2.2, scale: 0.85, opacity: 0, blur: 1.5 };
    },
    [],
  );

  // Lay the ring out (instantly on mount/resize, tweened on change).
  useLayoutEffect(() => {
    const st = stage.current;
    if (!st || !stageWidth) return;
    const { gsap } = setupGsap();
    const animate = prev.current !== active && !reduced();
    st.querySelectorAll<HTMLElement>('[data-ring]').forEach((el) => {
      const i = Number(el.dataset.ring);
      const s = slot(ringOffset(active, i, n), stageWidth);
      const props = { x: s.x, scale: s.scale, opacity: s.opacity, filter: `blur(${s.blur}px)` };
      if (animate) gsap.to(el, { ...props, duration: DUR, ease: EASE, overwrite: 'auto' });
      else gsap.set(el, props);
    });
  }, [active, stageWidth, n, slot]);

  // The garment change: outgoing settles down and away, incoming wipes in.
  useLayoutEffect(() => {
    const st = stage.current;
    if (!st) return;
    const from = prev.current;
    prev.current = active;
    if (from === active) return;
    const { gsap } = setupGsap();
    const out = st.querySelector<HTMLElement>(`[data-jacket="${from}"]`);
    const inc = st.querySelector<HTMLElement>(`[data-jacket="${active}"]`);

    if (reduced()) {
      if (out) gsap.set(out, { opacity: 0 });
      if (inc) gsap.set(inc, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
      setShown(active); setSize(null); setSizeError(false);
      return;
    }

    const tl = gsap.timeline();
    if (out) tl.to(out, { opacity: 0, scale: 0.985, duration: 0.5, ease: EASE, overwrite: 'auto' }, 0);
    if (inc) {
      tl.fromTo(
        inc,
        { opacity: 0, scale: 1.012, clipPath: 'inset(0% 0% 100% 0%)' },
        { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: DUR, ease: EASE, overwrite: 'auto' },
        0.06,
      );
    }
    // Product information: a short vertical reveal.
    tl.to(info.current, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' }, 0)
      .call(() => { setShown(active); setSize(null); setSizeError(false); }, undefined, 0.22)
      .fromTo(info.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.24);
    return () => { tl.kill(); };
  }, [active]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setActive((a) => (a + dir + n) % n);
      idle.current = Date.now() + 12000; // pause autoplay after any interaction
    },
    [n],
  );

  // Autoplay: slow, only while on screen, never under reduced motion, and it
  // stands down for twelve seconds after anything the user does.
  useEffect(() => {
    if (reduced() || !root.current) return;
    const { ScrollTrigger } = setupGsap();
    let timer = 0;
    let inView = false;
    const tick = () => {
      if (inView && Date.now() > idle.current && !root.current?.matches(':hover, :focus-within')) {
        setActive((a) => (a + 1) % n);
      }
    };
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => {
        inView = self.isActive;
        window.clearInterval(timer);
        if (inView) timer = window.setInterval(tick, AUTOPLAY_MS);
      },
    });
    return () => { window.clearInterval(timer); st.kill(); };
  }, [n]);

  // Entrance: the previews fan out from behind the model, once.
  useEffect(() => {
    const st = stage.current;
    if (!st || reduced() || !stageWidth) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.from(st.querySelectorAll('[data-ring]'), {
        x: 0, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.04,
        scrollTrigger: { trigger: st, start: 'top 80%', once: true },
      });
    }, st);
    return () => ctx.revert();
    // Runs once the stage has a width; later layouts are handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageWidth > 0]);

  // Phone: a compact bar takes over once the real actions leave the screen.
  useEffect(() => {
    const el = actions.current;
    const sec = root.current;
    if (!el || !sec) return;
    let away = false; let inSection = false;
    const update = () => setBarVisible(inSection && away);
    const a = new IntersectionObserver(([e]) => { away = !e.isIntersecting; update(); });
    const b = new IntersectionObserver(([e]) => { inSection = e.isIntersecting; update(); }, { rootMargin: '-40% 0px -20% 0px' });
    a.observe(el); b.observe(sec);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  // Pointer drag and touch swipe.
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { on: true, x: e.clientX, moved: 0 };
    idle.current = Date.now() + 12000;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    drag.current.moved = e.clientX - drag.current.x;
    const { gsap } = setupGsap();
    gsap.set(stage.current, { x: drag.current.moved * 0.12 });
  };
  const endDrag = () => {
    if (!drag.current.on) return;
    const dx = drag.current.moved;
    drag.current.on = false;
    const { gsap } = setupGsap();
    gsap.to(stage.current, { x: 0, duration: 0.4, ease: 'power3.out' });
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  // Trackpad: horizontal intent only, one step per gesture. Attached natively
  // because React's wheel handler is passive and cannot claim the gesture.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now < wheel.current.lock) return;
      wheel.current.acc += e.deltaX;
      if (Math.abs(wheel.current.acc) > 60) {
        go(wheel.current.acc > 0 ? 1 : -1);
        wheel.current.acc = 0;
        wheel.current.lock = now + 700;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [go]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    if (e.key === 'End') { e.preventDefault(); setActive(n - 1); }
  };

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      actions.current?.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
      return;
    }
    add({ slug: current.product.slug, colour: current.colour, size, qty: 1 });
    open('cart');
  };

  const mask = useMemo(() => maskStyle(), []);
  const pad = (i: number) => String(i + 1).padStart(2, '0');
  const total = String(n).padStart(2, '0');

  return (
    <section
      ref={root}
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="The Foundation outerwear, worn"
      // Height of the phone sticky bar below: 1px rule + py-3 + the h-11 button.
      style={{ '--bar-h': 'calc(1px + 1.5rem + 2.75rem)' } as React.CSSProperties}
    >
      <div
        ref={stage}
        // Phone: the first screen is nav + intro (~18rem) + this stage + the sticky
        // bar, which is already up at scroll 0. The stage takes what is left so the
        // figure's feet clear the bar, never below 19rem (very short phones scroll).
        className="relative mx-auto flex h-[clamp(19rem,100svh_-_var(--nav-h)_-_18rem_-_var(--bar-h),56svh)] items-end justify-center md:h-[64svh] md:min-h-[28rem]"
        role="group"
        tabIndex={0}
        aria-label="Outfits. Use the left and right arrow keys to change the jacket."
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Ring of previews: the garment alone, flat, either side of the model.
            The active one is invisible here; the stage shows it worn. */}
        {items.map((it, i) => (
          <div
            key={it.slug}
            data-ring={i}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 flex items-center will-change-transform"
            style={{ transformOrigin: '50% 50%' }}
          >
            <div className="aspect-square h-[34%] md:h-[40%]">
              {/* eslint-disable-next-line @next/next/no-img-element -- flat garment preview, sized by the contract */}
              <img src={`/img/outfits/${it.preview}`} alt="" width={900} height={900} loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </div>
          </div>
        ))}

        {/* The model. The base never changes; jackets crossfade over it through the mask. */}
        <div
          ref={frame}
          className="relative z-10 h-full select-none"
          style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- the contract's base frame */}
          <img
            src={`/img/outfits/${items[0].file}`}
            alt={current.alt}
            width={FRAME.width}
            height={FRAME.height}
            fetchPriority="high"
            decoding="async"
            className="h-full w-auto"
            draggable={false}
          />
          {items.map((it, i) =>
            i === 0 ? null : (
              <div
                key={it.slug}
                data-jacket={i}
                aria-hidden
                className="absolute inset-0"
                style={{ ...mask, opacity: i === active ? 1 : 0, transformOrigin: '50% 38%' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- masked garment layer */}
                <img src={`/img/outfits/${it.file}`} alt="" width={FRAME.width} height={FRAME.height} loading={i === 1 ? 'eager' : 'lazy'} decoding="async" className="h-full w-auto" draggable={false} />
              </div>
            ),
          )}
        </div>

        <button type="button" onClick={() => go(-1)} aria-label="Previous jacket"
          className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-bone/80 backdrop-blur-[2px] transition-colors hover:border-ink md:left-6 md:h-12 md:w-12">
          <Icon name="arrowL" className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next jacket"
          className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-bone/80 backdrop-blur-[2px] transition-colors hover:border-ink md:right-6 md:h-12 md:w-12">
          <Icon name="arrowR" className="h-4 w-4" />
        </button>
      </div>

      <p aria-live="polite" role="status" className="sr-only">
        Now showing {current.product.name} in {current.colour}, {pad(shown)} of {total}.
      </p>

      {/* Information and actions */}
      <div className="page mt-6 md:mt-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex w-full items-center gap-2" aria-hidden>
            {items.map((it, i) => (
              <button key={it.slug} type="button" tabIndex={-1} onClick={() => { setActive(i); idle.current = Date.now() + 12000; }}
                className={cn('h-px flex-1 transition-colors duration-300', i === active ? 'bg-ink' : 'bg-line')} />
            ))}
          </div>

          <div ref={info} className="mt-6 w-full">
            <p className="label-sm nums text-mute">
              {pad(shown)} / {total} · {current.product.category}
            </p>
            <h2 className="display-md mt-2">
              <Link href={`/products/${current.product.slug}`} className="hover:opacity-60">{current.product.name}</Link>
            </h2>
            <p className="mt-2 flex items-center justify-center gap-3 text-sm">
              <span className="text-mute">{current.colour}</span>
              <span className="text-line-2" aria-hidden>·</span>
              <Price amount={current.product.price} compareAt={current.product.compareAt} />
            </p>

            {current.product.sizes.length > 1 ? (
              <div className="mt-5" role="group" aria-label="Size">
                <div className="flex flex-wrap justify-center gap-1.5">
                  {current.product.sizes.map((s) => {
                    const out = unavailable(s);
                    return (
                      <button key={s} type="button" disabled={out} aria-pressed={size === s}
                        aria-label={out ? `Size ${s}, unavailable` : `Size ${s}`}
                        onClick={() => { setSize(s); setSizeError(false); }}
                        className={cn('label-sm min-w-12 border px-3 py-2.5 transition-colors',
                          out && 'cursor-not-allowed border-line text-stone line-through',
                          !out && size === s && 'border-ink bg-ink text-bone',
                          !out && size !== s && 'border-line hover:border-ink')}>
                        {s}
                      </button>
                    );
                  })}
                </div>
                {sizeError ? (
                  <p role="alert" className="mt-3 flex items-center justify-center gap-2 text-sm text-oxide">
                    <Icon name="alert" className="h-4 w-4" /> Choose a size to continue.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div ref={actions} className="mt-6 flex w-full gap-2.5">
            <Link href={`/products/${current.product.slug}`} className="btn flex-1">View details</Link>
            <button type="button" onClick={addToBag} className="btn btn-solid flex-1">Add to bag</button>
          </div>

          {PLACEHOLDER ? (
            <p className="label-sm mt-6 text-mute">
              Placeholder figure — awaiting photography. See <code className="normal-case tracking-normal">src/lib/outfits.ts</code>.
            </p>
          ) : null}
        </div>
      </div>

      {/* Phone sticky bar */}
      <div aria-hidden className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bone/97 px-(--gutter) py-3 backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] md:hidden',
        barVisible ? 'translate-y-0' : 'translate-y-full')}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{current.product.name}</p>
            <p className="label-sm mt-0.5 text-mute">{current.colour}{size ? ` · ${size}` : ''}</p>
          </div>
          <Price amount={current.product.price} className="shrink-0" />
          <button type="button" tabIndex={-1} onClick={addToBag} className="btn btn-solid h-11 min-h-11 shrink-0 px-5">
            {size ? 'Add' : 'Select size'}
          </button>
        </div>
      </div>
    </section>
  );
}
