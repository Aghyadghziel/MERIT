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
import { edgeFadeStyle, FRAME, maskStyle, PLACEHOLDER, type Outfit } from '@/lib/outfits';

export type OutfitItem = Outfit & { product: Product };

const RING = 0.65;
const EASE = 'power3.inOut';
/** The GSAP fallback, for garments with no filmed transition. */
const PUT_ON = 0.85;
const TAKE_OFF = 0.38;
const SETTLE = 0.28;
/** Hand-offs into and out of the clip. */
const INTO_VIDEO = 0.22;
const OUT_OF_VIDEO = 0.14;

/**
 * Where the media is in its life. Input is refused in every state but the two
 * resting ones, so a second click can never land mid-dress.
 */
type Media = 'base' | 'loading' | 'dressing' | 'dressed' | 'removing' | 'error';
const RESTING = (m: Media) => m === 'base' || m === 'dressed' || m === 'error';

const phone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
const url = (file: string) => `/img/outfits/${file}`;

/** Resolves once the image is actually decoded, so it can be shown without a flash. */
const decodeImage = (file: string) =>
  new Promise<void>((resolve) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().then(() => resolve(), () => resolve()) : resolve());
    im.onerror = () => resolve();
    im.src = url(file);
  });

const ringOffset = (from: number, to: number, n: number) => {
  let d = (to - from) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
};

export function OutfitCarousel({ items }: { items: OutfitItem[] }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [media, setMedia] = useState<Media>('base');
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const [announce, setAnnounce] = useState('');

  const prev = useRef(0);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);
  const drag = useRef({ on: false, x: 0, moved: 0 });
  const wheel = useRef({ acc: 0, lock: 0 });

  const { add } = useStore();
  const { open } = useUi();

  const current = items[shown];
  const unavailable = (s: string) => current.product.unavailable?.includes(`${current.colour}/${s}`) ?? false;

  /** The full-figure still for an outfit: its filmed last frame, or its base. */
  const stillOf = useCallback((i: number) => {
    const it = items[i];
    if (!it.video) return null;
    return phone() && it.video.dressedMobile ? it.video.dressedMobile : it.video.dressed;
  }, [items]);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStageWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ─── The ring of flat garments ────────────────────────────────────────────
  const slot = useCallback((d: number, w: number) => {
    const m = phone();
    const a = Math.abs(d);
    const sign = Math.sign(d);
    if (a === 0) return { x: 0, scale: 1, opacity: 0, blur: 0 };
    if (a === 1) return { x: sign * w * (m ? 0.62 : 1.05), scale: m ? 0.9 : 1, opacity: 0.9, blur: 0 };
    if (a === 2) return { x: sign * w * 1.75, scale: 0.85, opacity: m ? 0 : 0.35, blur: 1.5 };
    return { x: sign * w * 2.2, scale: 0.85, opacity: 0, blur: 1.5 };
  }, []);

  useLayoutEffect(() => {
    const st = stage.current;
    if (!st || !stageWidth) return;
    const { gsap } = setupGsap();
    const animate = prev.current !== active && !reduced();
    st.querySelectorAll<HTMLElement>('[data-ring]').forEach((el) => {
      const i = Number(el.dataset.ring);
      const s = slot(ringOffset(active, i, n), stageWidth);
      const props = { x: s.x, scale: s.scale, opacity: s.opacity, filter: `blur(${s.blur}px)` };
      if (animate) gsap.to(el, { ...props, duration: RING, ease: EASE, overwrite: 'auto' });
      else gsap.set(el, props);
    });
  }, [active, stageWidth, n, slot]);

  // ─── Dressing ─────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const st = stage.current;
    const vid = video.current;
    if (!st) return;
    const from = prev.current;
    prev.current = active;
    if (from === active) return;

    const { gsap } = setupGsap();
    const layer = (sel: string) => st.querySelector<HTMLElement>(sel);
    const jacket = (i: number) => layer(`[data-jacket="${i}"]`);
    const still = (i: number) => layer(`[data-still="${i}"]`);
    const shadow = layer('[data-shadow]');
    const baseLayer = layer('[data-base]')!;

    let cancelled = false;
    const tweens: gsap.core.Tween[] = [];
    const to = (t: gsap.TweenTarget, v: gsap.TweenVars) => {
      const tw = gsap.to(t, v);
      tweens.push(tw);
      return tw;
    };

    const softly = (el: Element | null, opacity: number, duration: number) =>
      el ? to(el, { opacity, duration, ease: 'power2.inOut', overwrite: 'auto' }).then() : Promise.resolve();

    /** Play one clip end to end, driven by its own events, never by a timer. */
    const playClip = (sources: { mp4: string; webm?: string }) =>
      new Promise<void>((resolve, reject) => {
        if (!vid) return reject(new Error('no video element'));
        vid.pause();
        const mp4 = vid.querySelector<HTMLSourceElement>('source[type="video/mp4"]')!;
        const webm = vid.querySelector<HTMLSourceElement>('source[type="video/webm"]')!;
        mp4.src = url(sources.mp4);
        webm.src = sources.webm ? url(sources.webm) : '';
        const done = () => { cleanup(); resolve(); };
        const fail = () => { cleanup(); reject(new Error('clip failed')); };
        const cleanup = () => {
          vid.removeEventListener('ended', done);
          vid.removeEventListener('error', fail);
          vid.removeEventListener('canplaythrough', start);
        };
        const start = () => {
          if (cancelled) return fail();
          vid.play().catch(fail);
        };
        vid.addEventListener('ended', done, { once: true });
        vid.addEventListener('error', fail, { once: true });
        vid.addEventListener('canplaythrough', start, { once: true });
        vid.load();
      });

    /** Fallback for garments with no clip: the jacket forms around the model. */
    const fallbackOn = (i: number) => {
      const el = jacket(i);
      if (!el) return Promise.resolve();
      const tl = gsap.timeline();
      tl.fromTo(el,
        { clipPath: 'inset(22% 0% 78% 0%)', y: -10, scale: 1.015, opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, scale: 1, opacity: 1, duration: PUT_ON, ease: 'power2.inOut' }, 0);
      if (shadow) tl.fromTo(shadow, { opacity: 0 }, { opacity: 0.22, duration: PUT_ON, ease: 'power2.inOut' }, 0);
      tl.to(el, { y: 2.5, scale: 1.004, duration: SETTLE / 2, ease: 'power1.out' }, PUT_ON)
        .to(el, { y: 0, scale: 1, duration: SETTLE / 2, ease: 'power2.out' }, PUT_ON + SETTLE / 2);
      return tl.then();
    };

    const fallbackOff = (i: number) => {
      const el = jacket(i);
      if (!el) return Promise.resolve();
      const tl = gsap.timeline();
      tl.to(el, { clipPath: 'inset(22% 0% 78% 0%)', y: -8, scale: 0.99, opacity: 0, duration: TAKE_OFF, ease: 'power2.inOut' }, 0);
      if (shadow) tl.to(shadow, { opacity: 0, duration: TAKE_OFF, ease: 'power2.inOut' }, 0);
      return tl.then();
    };

    /** Take whatever is on the model off, leaving the base still showing. */
    const undress = async (i: number) => {
      const it = items[i];
      const rev = it.video?.reverseMp4;
      if (it.video && rev && !reduced()) {
        setMedia('removing');
        try {
          const src = phone() && it.video.reverseMobile ? it.video.reverseMobile : rev;
          // The clip's first frame is the dressed still already on screen.
          await playClip({ mp4: src });
          if (cancelled) return;
          await softly(baseLayer, 1, OUT_OF_VIDEO);
          await softly(vid, 0, OUT_OF_VIDEO);
          gsap.set(still(i), { opacity: 0 });
          return;
        } catch {
          // fall through to the still swap below
        }
      }
      if (it.video) {
        await softly(baseLayer, 1, 0.24);
        gsap.set([still(i), vid], { opacity: 0 });
      } else {
        await fallbackOff(i);
      }
    };

    /** Put the selected garment on. */
    const dress = async (i: number) => {
      const it = items[i];
      if (!it.video || reduced()) {
        if (it.video) {
          // Reduced motion: straight from base still to dressed still.
          setMedia('loading');
          const f = stillOf(i)!;
          await decodeImage(f);
          if (cancelled) return;
          await softly(still(i), 1, 0.2);
          gsap.set(baseLayer, { opacity: 0 });
        } else {
          await fallbackOn(i);
        }
        setMedia('dressed');
        return;
      }

      setMedia('loading');
      const clip = { mp4: phone() && it.video.mobile ? it.video.mobile : it.video.mp4, webm: phone() ? undefined : it.video.webm };
      const dressedFile = stillOf(i)!;
      // The dressed still is decoded up front so the hand-off cannot flash.
      await decodeImage(dressedFile);
      if (cancelled) return;

      try {
        setMedia('dressing');
        const started = playClip(clip);
        // Reveal the clip only once it is running, over the base still.
        await softly(vid, 1, INTO_VIDEO);
        gsap.set(baseLayer, { opacity: 0 });
        await started;
        if (cancelled) return;
        // The clip's last frame and this still are the same pixels, so this
        // crossfade is invisible; the clip stays until the still is solid.
        await softly(still(i), 1, OUT_OF_VIDEO);
        await softly(vid, 0, OUT_OF_VIDEO);
        setMedia('dressed');
      } catch {
        if (cancelled) return;
        // Clip unavailable: land on the dressed still directly.
        gsap.set(still(i), { opacity: 1 });
        gsap.set([baseLayer, vid], { opacity: 0 });
        setMedia('error');
      }
    };

    const run = async () => {
      busy.current = true;
      await softly(info.current, 0, 0.2);
      gsap.set(info.current, { y: -8 });

      if (from !== 0) await undress(from);
      if (cancelled) return;
      if (active !== 0) {
        await dress(active);
      } else {
        gsap.set(baseLayer, { opacity: 1 });
        setMedia('base');
      }
      if (cancelled) return;

      setShown(active);
      setSize(null);
      setSizeError(false);
      setAnnounce(
        active === 0
          ? `${items[0].product.name}. Jacket removed.`
          : `Now wearing the ${items[active].product.name} in ${items[active].colour}.`,
      );
      gsap.fromTo(info.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
      busy.current = false;
    };

    void run();

    return () => {
      cancelled = true;
      tweens.forEach((t) => t.kill());
      vid?.pause();
      busy.current = false;
    };
  }, [active, items, stillOf]);

  // A hidden tab must not keep playing.
  useEffect(() => {
    const onHide = () => { if (document.hidden) video.current?.pause(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  // Once the page is settled, warm the neighbours' media — never on first load.
  useEffect(() => {
    const warm = () => {
      [1, n - 1].forEach((d) => {
        const it = items[(active + d) % n];
        if (it.video) {
          void decodeImage(stillOf((active + d) % n)!);
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'video';
          link.href = url(phone() && it.video.mobile ? it.video.mobile : it.video.mp4);
          document.head.appendChild(link);
        }
      });
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const id = idle ? idle(warm) : window.setTimeout(warm, 1500);
    return () => { if (!idle) window.clearTimeout(id as number); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const go = useCallback((dir: 1 | -1) => {
    if (busy.current || !RESTING(media)) return;
    setActive((a) => (a + dir + n) % n);
  }, [n, media]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!RESTING(media)) return;
    drag.current = { on: true, x: e.clientX, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    drag.current.moved = e.clientX - drag.current.x;
    setupGsap().gsap.set(stage.current, { x: drag.current.moved * 0.12 });
  };
  const endDrag = () => {
    if (!drag.current.on) return;
    const dx = drag.current.moved;
    drag.current.on = false;
    setupGsap().gsap.to(stage.current, { x: 0, duration: 0.4, ease: 'power3.out' });
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = e.timeStamp;
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
  };

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
  const edgeFade = useMemo(() => edgeFadeStyle(), []);
  const pad = (i: number) => String(i + 1).padStart(2, '0');
  const total = String(n).padStart(2, '0');
  const working = !RESTING(media);

  return (
    <section ref={root} className="relative overflow-hidden" aria-roledescription="carousel" aria-label="The Foundation outerwear, worn">
      <div
        ref={stage}
        className="relative mx-auto flex h-[clamp(19rem,100svh_-_var(--nav-h)_-_18rem_-_var(--bar-h),56svh)] items-end justify-center md:h-[64svh] md:min-h-[28rem]"
        style={{ '--bar-h': 'calc(1px + 1.5rem + 2.75rem)', touchAction: 'pan-y' } as React.CSSProperties}
        role="group"
        tabIndex={0}
        aria-label="Outfits. Use the left and right arrow keys to change the jacket."
        aria-busy={working}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {items.map((it, i) => (
          <div key={it.slug} data-ring={i} aria-hidden
            className="pointer-events-none absolute inset-y-0 flex items-center will-change-transform"
            style={{ transformOrigin: '50% 50%' }}>
            <div className="aspect-square h-[34%] md:h-[40%]">
              {/* eslint-disable-next-line @next/next/no-img-element -- flat garment preview */}
              <img src={url(it.preview)} alt="" width={900} height={900} loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </div>
          </div>
        ))}

        <div ref={frame} className="relative z-10 h-full select-none" style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}` }}>
          {/* The base look. Everything else fades over it. */}
          <div data-base className="absolute inset-0">
            <picture>
              {items[0].mobile ? <source media="(max-width: 767px)" srcSet={url(items[0].mobile)} /> : null}
              {/* eslint-disable-next-line @next/next/no-img-element -- the contract's base frame */}
              <img src={url(items[0].file)} alt={items[0].alt} width={FRAME.width} height={FRAME.height}
                fetchPriority="high" decoding="async" className="h-full w-auto" draggable={false} />
            </picture>
          </div>

          <div data-shadow aria-hidden className="pointer-events-none absolute inset-x-[8%] top-[20%] h-[52%] opacity-0"
            style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 30%, rgba(16,16,16,0.45), rgba(16,16,16,0) 70%)', ...mask }} />

          {/* Garments with no filmed transition: a masked layer over the base. */}
          {items.map((it, i) => (i === 0 || it.video ? null : (
            <div key={it.slug} data-jacket={i} aria-hidden className="absolute inset-0 opacity-0"
              style={{ ...mask, transformOrigin: '50% 38%' }}>
              <picture>
                {it.mobile ? <source media="(max-width: 767px)" srcSet={url(it.mobile)} /> : null}
                {/* eslint-disable-next-line @next/next/no-img-element -- masked garment layer */}
                <img src={url(it.file)} alt="" width={FRAME.width} height={FRAME.height} loading="lazy" decoding="async" className="h-full w-auto" draggable={false} />
              </picture>
            </div>
          )))}

          {/* The clip. Same scale and centre as the stills, so the model does not move. */}
          <video
            ref={video}
            className="pointer-events-none absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2 opacity-0"
            style={edgeFade}
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            aria-hidden
            tabIndex={-1}
            width={items.find((i) => i.video)?.video?.width}
            height={items.find((i) => i.video)?.video?.height}
          >
            <source type="video/webm" />
            <source type="video/mp4" />
          </video>

          {/* Worn stills that a clip hands off to — the clip's own last frame. */}
          {items.map((it, i) => (it.video ? (
            <div key={it.slug} data-still={i} aria-hidden className="absolute inset-0 opacity-0">
              {/* Laid out exactly like the <video> above: absolutely centred,
                  full height, natural width. A flex or auto-width wrapper would
                  shrink and knock the image off the model's axis. */}
              <picture>
                {it.video.dressedMobile ? <source media="(max-width: 767px)" srcSet={url(it.video.dressedMobile)} /> : null}
                {/* eslint-disable-next-line @next/next/no-img-element -- the worn still */}
                <img src={url(it.video.dressed)} alt="" width={it.video.width} height={it.video.height} loading="lazy" decoding="async"
                  className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2" style={edgeFade} draggable={false} />
              </picture>
            </div>
          ) : null))}
        </div>

        <button type="button" onClick={() => go(-1)} disabled={working} aria-label="Previous jacket"
          className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-bone/80 backdrop-blur-[2px] transition-colors hover:border-ink disabled:opacity-30 md:left-6 md:h-12 md:w-12">
          <Icon name="arrowL" className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => go(1)} disabled={working} aria-label="Next jacket"
          className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-bone/80 backdrop-blur-[2px] transition-colors hover:border-ink disabled:opacity-30 md:right-6 md:h-12 md:w-12">
          <Icon name="arrowR" className="h-4 w-4" />
        </button>
      </div>

      <p aria-live="polite" role="status" className="sr-only">
        {announce || `Now showing ${current.product.name} in ${current.colour}, ${pad(shown)} of ${total}.`}
      </p>

      <div className="page mt-6 md:mt-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex w-full items-center gap-2" aria-hidden>
            {items.map((it, i) => (
              <span key={it.slug} className={cn('h-px flex-1 transition-colors duration-300', i === active ? 'bg-ink' : 'bg-line')} />
            ))}
          </div>

          <div ref={info} className="mt-6 w-full">
            <p className="label-sm nums text-mute">{pad(shown)} / {total} · {current.product.category}</p>
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
