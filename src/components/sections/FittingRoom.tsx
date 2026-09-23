'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Price } from '@/components/commerce/Price';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { LOGO } from '@/lib/brand';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';
import { FIGURE, FRAME, type Outfit } from '@/lib/outfits';

export type OutfitItem = Outfit & { product: Product };

/** Where the media is in its life. Input is refused until it rests again. */
type Media = 'base' | 'dressing' | 'dressed' | 'removing';
const RESTING = (m: Media) => m === 'base' || m === 'dressed';

const phone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
const url = (file: string) => `/img/outfits/${file}`;
const pad = (n: number) => String(n).padStart(2, '0');
const n4 = (n: number) => Number(n.toFixed(4));

/**
 * VP9 carries alpha in Chrome, Edge and Firefox; Safari (and every iOS browser,
 * which is Safari underneath) needs HEVC with alpha instead. Safari reports it
 * can play VP9 too, so the choice is by engine, not by canPlayType.
 */
const alphaExt = () => {
  const ua = navigator.userAgent;
  const webkitOnly = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|Firefox|FxiOS|CriOS|OPR/.test(ua);
  const ios = /iPhone|iPad|iPod/.test(ua);
  return webkitOnly || ios ? '.hevc.mp4' : '.webm';
};
const clipUrl = (name: string) => url(`${name}${phone() ? '-m' : ''}${alphaExt()}`);

const decodeImage = (file: string) =>
  new Promise<void>((resolve) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().then(() => resolve(), () => resolve()) : resolve());
    im.onerror = () => resolve();
    im.src = url(file);
  });

/** Whether this browser has already taken a jacket down; if so, no hint. */
const SEEN_KEY = 'merit:fitting-room';
const seen = () => {
  try { return window.localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
};
const markSeen = () => {
  try { window.localStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode: hint again next time */ }
};

/**
 * The counter (the enclosed hole) of the R in the logotype, from its outline
 * in src/lib/brand.ts: x 180.65–221.29, y 19.79–56.26 in the 386.6 × 100 box.
 * As fractions of the logotype's width and height.
 *
 * `crown` is where his head goes when the logotype is a masthead: a hair
 * under the counter, so the counter is always whole above him, and still
 * above the tip of the notch between the R's stem and leg (y 71.8), so his
 * hair covers that tip instead of leaving a white wedge poking out of it.
 */
const COUNTER = { x: n4(200.97 / 386.6), y: 0.3803, crown: 0.598 };

/**
 * The stage geometry. Everything is measured from the model, not from the
 * viewport: his frame height (--fr-h) comes from the stage height, and the
 * logotype is sized from HIM and pinned by the counter of its R to the one
 * patch of his chest that is covered in every frame of every clip. So no
 * screen shape can slide that counter out past his shoulder as a thin
 * warm-white sliver, which is what happened when the logotype was sized from
 * the viewport width and the model from its height.
 *
 * Landscape: the logotype runs behind his chest, as wide as that allows.
 * Portrait (phones, tablets upright): it becomes a masthead across the top,
 * full width, and he is sized so his crown sits just under the counter —
 * the head overlapping the name, as on a magazine cover.
 *
 * Container units: the stage is a size container, so cqw/cqh are the stage.
 * The custom properties are resolved where they are used (its children).
 */
const LIFT = n4(1 - FIGURE.crown);
const GEOMETRY = `
.fr-stage {
  container-type: size;
  --fr-h: min(92cqh, (100cqh - var(--nav-h) - 1rem) / ${LIFT});
  --fr-w: calc(var(--fr-h) * ${n4(FRAME.width / FRAME.height)});
  --fr-top: calc(100cqh - var(--fr-h));
  --fr-logo-w: min(${FIGURE.logoMax} * var(--fr-h), 100cqw - 2 * var(--gutter));
  --fr-logo-h: calc(var(--fr-logo-w) / ${LOGO.ratio});
  --fr-logo-x: calc(50cqw + ${n4(FIGURE.chest.x - 0.5)} * var(--fr-w) - ${COUNTER.x} * var(--fr-logo-w));
  --fr-logo-y: calc(var(--fr-top) + ${FIGURE.chest.y} * var(--fr-h) - ${COUNTER.y} * var(--fr-logo-h));
  --fr-rail-w: clamp(8.5rem, 0.19 * var(--fr-logo-w), 15.5rem);
  --fr-rail-y: calc(var(--fr-logo-y) + 0.36 * var(--fr-logo-h));
  --fr-rail-l: max(var(--gutter), var(--fr-logo-x) + 0.035 * var(--fr-logo-w));
  --fr-rail-r: max(var(--gutter), 100cqw - var(--fr-logo-x) - 0.965 * var(--fr-logo-w));
}
@media (max-aspect-ratio: 1/1) {
  .fr-stage {
    --fr-logo-w: calc(100cqw - 2 * var(--gutter));
    --fr-logo-x: var(--gutter);
    --fr-logo-y: calc(var(--nav-h) + clamp(0.25rem, 1.4cqh, 1.25rem));
    --fr-h: min(92cqh, (100cqh - var(--fr-logo-y) - ${COUNTER.crown} * var(--fr-logo-h)) / ${LIFT});
    --fr-rail-w: min(27cqw, 12rem);
    --fr-rail-l: var(--gutter);
    --fr-rail-r: var(--gutter);
  }
}
.fr-logo { position: absolute; left: var(--fr-logo-x); top: var(--fr-logo-y); width: var(--fr-logo-w); }
.fr-model { position: absolute; bottom: 0; left: calc(50% - var(--fr-w) / 2); width: var(--fr-w); height: var(--fr-h); }
.fr-rail { position: absolute; top: var(--fr-rail-y); width: var(--fr-rail-w); }
.fr-rail[data-side="l"] { left: var(--fr-rail-l); }
.fr-rail[data-side="r"] { right: var(--fr-rail-r); }
.fr-meta { position: absolute; bottom: clamp(1.25rem, 3.6cqh, 2.25rem); }
.fr-meta[data-side="l"] { left: var(--gutter); }
.fr-meta[data-side="r"] { right: var(--gutter); }
@media (max-aspect-ratio: 1/1) {
  /* Upright, the jackets stand in the lower corners beside his legs, where
     the room is widest, and the corner lines move up under the masthead. */
  .fr-rail { top: auto; bottom: clamp(1.25rem, 4.5cqh, 2.75rem); }
  .fr-meta { bottom: auto; top: calc(var(--fr-logo-y) + var(--fr-logo-h) + 0.875rem); }
}
@media (prefers-reduced-motion: no-preference) {
  .fr-stage [data-fr="logo"] { clip-path: inset(100% 0% 0% 0%); }
  .fr-stage [data-fr="hang"], .fr-stage [data-fr="tag"], .fr-stage [data-fr="meta"] { opacity: 0; }
}
`;

/**
 * What the entrance animates starts hidden in CSS, not from a script, so the
 * server's first paint and the hydrated page agree and nothing flashes in and
 * out. The model is never hidden: he is the first thing painted. Without
 * scripting, everything is simply shown.
 */
const NO_SCRIPT = '.fr-stage [data-fr]{opacity:1!important;clip-path:none!important}';

/**
 * The Fitting Room: the opening of the site. One model on the warm white, the
 * logotype set huge behind him in stone, a jacket hanging either side. Pick
 * one and he reaches for it and puts it on; pick the other and he takes the
 * first off and puts that one on; pick the one he is wearing and it comes off.
 * Keys 1 and 2 do the same, and 0 or Escape takes it off. Under the stage, a
 * strip sells whatever he has on.
 */
export function FittingRoom({ items }: { items: OutfitItem[] }) {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [media, setMedia] = useState<Media>('base');
  const [hover, setHover] = useState<number | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [barVisible, setBarVisible] = useState(false);

  const prev = useRef(0);
  const busy = useRef(false);
  const current = useRef(0);
  const inView = useRef(true);
  const list = useRef(items);
  const sway = useRef<gsap.core.Tween | null>(null);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  const { add } = useStore();
  const { open, overlay } = useUi();

  useEffect(() => { list.current = items; }, [items]);

  const look = items[shown];
  const working = !RESTING(media);
  const jackets = items.filter((it) => it.jacket).length;
  const unavailable = (s: string) => look.product.unavailable?.includes(`${look.colour}/${s}`) ?? false;
  const low = size ? look.product.low?.includes(`${look.colour}/${size}`) ?? false : false;

  // ─── Entrance, first-visit hint and scroll depth ─────────────────────────
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      // He is there from the first paint. The name rises behind him, then the
      // jackets are hung either side: dropped onto the hook, settling as they
      // land. Every start state is the CSS one above, so nothing flashes.
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo('[data-fr="logo"]',
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7 }, 0.15)
        .fromTo('[data-fr="hang"]',
          { yPercent: -10, rotation: -4, opacity: 0 },
          { yPercent: 0, rotation: 0, opacity: 1, transformOrigin: '50% 0%', duration: 1.4, stagger: 0.14, ease: 'power4.out' }, 0.55)
        .fromTo('[data-fr="tag"]', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.14 }, 0.75)
        .fromTo('[data-fr="meta"]', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.85);

      // First visit only: once the room has settled, both jackets sway on
      // their hooks, once. The only hint that they can be taken down.
      if (!seen()) {
        sway.current = gsap.to('[data-fr="hang"]', {
          keyframes: { rotation: [0, 2.2, -1.5, 0.7, 0], easeEach: 'sine.inOut' },
          transformOrigin: '50% 0%', duration: 2.4, stagger: 0.18, delay: 2.2,
        });
      }

      // As the room scrolls away the logotype recedes, shrinking about the
      // counter of its R, so the counter only ever gets smaller behind him;
      // the jackets, nearest the camera, travel a little faster than the page.
      const scroll = () => ({ trigger: el, start: 'top top', end: 'bottom top', scrub: true });
      gsap.to('[data-fr="logo"]', {
        scale: 0.9, transformOrigin: `${COUNTER.x * 100}% ${COUNTER.y * 100}%`, ease: 'none', scrollTrigger: scroll(),
      });
      gsap.to('[data-fr="rail"]', { yPercent: -16, ease: 'none', scrollTrigger: scroll() });
    }, el);
    return () => {
      sway.current = null;
      ctx.revert();
    };
  }, []);

  // ─── Dressing ────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const st = stage.current;
    const vid = video.current;
    if (!st || !vid) return;
    const from = prev.current;
    prev.current = active;
    current.current = active;
    if (from === active) return;

    const looks = list.current;
    const { gsap } = setupGsap();
    const layer = (sel: string) => st.querySelector<HTMLElement>(sel);
    const still = (i: number) => layer(`[data-still="${i}"]`);
    const base = layer('[data-base]');
    let cancelled = false;
    let frame = 0;
    let detach: (() => void) | null = null;

    // One progress line across the whole change: a swap is two clips, and the
    // line runs once across both rather than twice.
    const bar = progress.current;
    const steps = (from !== 0 ? 1 : 0) + (active !== 0 ? 1 : 0);
    let step = 0;
    const paint = (t: number) => {
      if (bar) bar.style.transform = `scaleX(${Math.min(1, (step + t) / steps)})`;
    };
    const tick = () => {
      if (vid.duration) paint(vid.currentTime / vid.duration);
      frame = requestAnimationFrame(tick);
    };
    paint(0);

    /** Play one clip to its end, revealing it only once it is really moving. */
    const play = (name: string, reveal: () => void) =>
      new Promise<void>((resolve, reject) => {
        vid.pause();
        vid.src = clipUrl(name);
        const cleanup = () => {
          vid.removeEventListener('ended', done);
          vid.removeEventListener('error', fail);
          vid.removeEventListener('playing', moving);
          cancelAnimationFrame(frame);
          detach = null;
        };
        const done = () => { cleanup(); paint(1); resolve(); };
        const fail = () => { cleanup(); reject(new Error('clip failed')); };
        const moving = () => {
          if (cancelled) return;
          reveal();
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(tick);
        };
        detach = cleanup;
        vid.addEventListener('ended', done, { once: true });
        vid.addEventListener('error', fail, { once: true });
        vid.addEventListener('playing', moving, { once: true });
        vid.load();
        vid.play().catch(fail);
      });

    const swap = (show: Element | null, hide: (Element | null)[]) => {
      if (show) gsap.set(show, { opacity: 1 });
      hide.forEach((h) => h && gsap.set(h, { opacity: 0 }));
    };

    const undress = async (i: number) => {
      setMedia('removing');
      const it = looks[i].jacket!;
      if (reduced()) {
        swap(base, [still(i)]);
      } else {
        try {
          // The off-clip opens on the dressed still that is already showing.
          await play(it.off, () => swap(vid, [still(i)]));
          if (cancelled) return;
          swap(base, [vid]);
        } catch {
          if (!cancelled) swap(base, [still(i), vid]);
        }
      }
      step += 1;
    };

    const dress = async (i: number) => {
      setMedia('dressing');
      const it = looks[i].jacket!;
      await decodeImage(phone() ? it.dressedMobile : it.dressed);
      if (cancelled) return;
      if (reduced()) {
        swap(still(i), [base]);
        return;
      }
      try {
        await play(it.on, () => swap(vid, [base]));
        if (cancelled) return;
        // The still is the clip's own last frame: this is a cut nobody sees.
        swap(still(i), [vid]);
      } catch {
        if (!cancelled) swap(still(i), [base, vid]);
      }
    };

    const run = async () => {
      busy.current = true;
      if (from !== 0) await undress(from);
      if (cancelled) return;
      if (active !== 0) await dress(active);
      if (cancelled) return;
      setMedia(active === 0 ? 'base' : 'dressed');
      setShown(active);
      setSize(null);
      setSizeError(false);
      setAnnounce(active === 0
        ? `Jacket taken off. Now wearing the ${looks[0].product.name}.`
        : `Now wearing the ${looks[active].product.name} in ${looks[active].colour}.`);
      if (strip.current && !reduced()) {
        gsap.fromTo(strip.current.querySelectorAll('[data-swap]'),
          { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
      }
      busy.current = false;
    };
    void run();

    return () => {
      cancelled = true;
      detach?.();
      cancelAnimationFrame(frame);
      vid.pause();
      busy.current = false;
    };
  }, [active]);

  // A hidden tab must not keep playing, and must pick up where it left off
  // when it comes back, or the clip never ends and the room stays locked.
  useEffect(() => {
    const onVisibility = () => {
      const vid = video.current;
      if (!vid) return;
      if (document.hidden) vid.pause();
      else if (busy.current && vid.paused && !vid.ended && vid.currentSrc) void vid.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Once the page is idle, warm the jackets he is not wearing.
  useEffect(() => {
    const warm = () => {
      items.forEach((it, i) => {
        if (i === active || !it.jacket) return;
        void decodeImage(phone() ? it.jacket.dressedMobile : it.jacket.dressed);
        const href = clipUrl(it.jacket.on);
        if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(warm);
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(id);
  }, [active, items]);

  // Keys work only while the room is actually on screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { inView.current = e.intersectionRatio >= 0.4; }, { threshold: [0, 0.4, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The phone's sticky buy bar appears once the strip has scrolled away.
  useEffect(() => {
    const el = strip.current;
    const sec = root.current;
    if (!el || !sec) return;
    let away = false; let inSection = false;
    const update = () => setBarVisible(inSection && away);
    const a = new IntersectionObserver(([e]) => { away = !e.isIntersecting; update(); });
    const b = new IntersectionObserver(([e]) => { inSection = e.isIntersecting; update(); }, { rootMargin: '-30% 0px -20% 0px' });
    a.observe(el); b.observe(sec);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  /** The hint has done its job the moment anyone reaches for a jacket. */
  const stopHint = useCallback(() => {
    const t = sway.current;
    if (!t) return;
    sway.current = null;
    t.kill();
    setupGsap().gsap.to('[data-fr="hang"]', { rotation: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
  }, []);

  const choose = useCallback((i: number) => {
    if (busy.current) return;
    stopHint();
    markSeen();
    setHover(null);
    setActive((a) => (a === i ? 0 : i));
  }, [stopHint]);

  // 1, 2 … put a jacket on (or take it off if he is wearing it); 0 or
  // Escape takes it off. Never while typing, with a modifier held, or with
  // the bag, search or menu open over the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (overlay || !inView.current) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'Escape' || e.key === '0') {
        // Escape belongs to whatever has focus, unless that is the room itself.
        if (e.key === 'Escape' && t && t !== document.body && !stage.current?.contains(t)) return;
        if (current.current !== 0) choose(current.current);
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n > 0 && list.current[n]?.jacket) {
        e.preventDefault();
        choose(n);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, choose]);

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    add({ slug: look.product.slug, colour: look.colour, size, qty: 1 });
    open('cart');
  };

  // What the corner says: the prompt, what a hovered jacket would do, what
  // is happening, or what he has on.
  const target = items[active];
  const hovered = hover !== null && !working ? items[hover] : null;
  // On a phone the corner is narrow and sits beside his head, so it keeps to
  // a few words; the jacket's own name is on the rail right beside him.
  const status: { label: string; line: string; phone: string | null; prompt?: boolean } =
    media === 'dressing' ? { label: 'Putting on', line: target.product.name, phone: null }
      : media === 'removing' ? { label: 'Taking off', line: items[shown].product.name, phone: null }
        : hovered ? { label: hover === active ? 'Take off' : active ? 'Swap for' : 'Try on', line: hovered.product.name, phone: null }
          : active ? { label: 'Wearing', line: target.product.name, phone: 'Tap to swap' }
            : { label: '', line: '', phone: '', prompt: true };

  return (
    <section
      ref={root}
      aria-labelledby="fr-title"
      className="relative bg-bone"
      style={{ '--strip-h': 'clamp(6.5rem, 4rem + 6vw, 7.5rem)' } as React.CSSProperties}
    >
      <style href="merit-fitting-room" precedence="medium">{GEOMETRY}</style>
      <noscript><style dangerouslySetInnerHTML={{ __html: NO_SCRIPT }} /></noscript>
      <h1 id="fr-title" className="sr-only">MERIT, Autumn Winter 2026. The Fitting Room: choose a jacket and see it worn.</h1>

      <div
        ref={stage}
        role="group"
        aria-label="The Fitting Room. Choose a jacket to put on. Keys 1 and 2 put one on, 0 takes it off."
        aria-busy={working}
        className="fr-stage relative h-[calc(100svh-var(--strip-h))] min-h-[34rem] overflow-hidden border-b border-line"
      >
        {/* The header is clear only over this band at the top of the room, so
            it turns solid as soon as the page moves, before its own logotype
            can slide over his black tee. */}
        <span aria-hidden data-header-over="light" className="pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--nav-h)+2.5rem)]" />

        {/* The masthead: the logotype, in stone, behind him. */}
        <div aria-hidden data-fr="logo" className="fr-logo pointer-events-none text-stone-brand will-change-transform">
          <Wordmark className="block h-auto w-full" />
        </div>

        {/* The model. Stills and clip share one box, so he never moves. */}
        <div data-fr="model" className="fr-model z-10 select-none">
          {/* The cut-out lost its floor: put the shadow back under his feet. */}
          <span aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              top: `${FIGURE.floor * 100}%`, width: `${FIGURE.stance * 190}%`, height: '4.2%',
              background: 'radial-gradient(closest-side, rgb(0 0 0 / 0.13), rgb(0 0 0 / 0.05) 55%, transparent)',
            }} />
          <span aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              top: `${(FIGURE.floor - 0.002) * 100}%`, width: `${FIGURE.stance * 118}%`, height: '1.5%',
              background: 'radial-gradient(closest-side, rgb(0 0 0 / 0.26), rgb(0 0 0 / 0.08) 60%, transparent)',
            }} />

          <div data-base className="absolute inset-0">
            <picture>
              {items[0].still?.mobile ? <source media="(max-width: 767px)" srcSet={url(items[0].still.mobile)} /> : null}
              <img src={url(items[0].still!.file)} alt={items[0].alt} width={FRAME.width} height={FRAME.height}
                fetchPriority="high" decoding="async" className="h-full w-full object-contain" draggable={false} />
            </picture>
          </div>
          {items.map((it, i) => (it.jacket ? (
            <div key={it.slug} data-still={i} aria-hidden className="absolute inset-0 opacity-0">
              <picture>
                <source media="(max-width: 767px)" srcSet={url(it.jacket.dressedMobile)} />
                <img src={url(it.jacket.dressed)} alt="" width={720} height={1080} loading="lazy" decoding="async"
                  className="h-full w-full object-contain" draggable={false} />
              </picture>
            </div>
          ) : null))}
          <video ref={video} aria-hidden tabIndex={-1} muted playsInline preload="none" disablePictureInPicture
            className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0" width={720} height={1080} />
        </div>

        {/* The rail: sand on the left, leather on the right. */}
        {items.map((it, i) => {
          if (!it.jacket) return null;
          const worn = active === i;
          const left = i === 1;
          const name = it.product.name;
          return (
            <button
              key={it.slug}
              type="button"
              data-fr="rail"
              data-side={left ? 'l' : 'r'}
              onClick={() => choose(i)}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') { stopHint(); setHover(i); } }}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setHover(i); }}
              onBlur={() => setHover((h) => (h === i ? null : h))}
              aria-pressed={worn}
              aria-disabled={working || undefined}
              aria-keyshortcuts={String(i)}
              aria-label={worn ? `Take off the ${name}` : `Put on the ${name}`}
              className={cn(
                'fr-rail group z-20 flex flex-col',
                left ? 'items-start text-left' : 'items-end text-right',
                working && 'cursor-progress',
              )}
            >
              <span data-fr="hang" className="relative block aspect-square w-full">
                <span className={cn(
                  'block h-full w-full transition-[translate,scale,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)]',
                  worn ? 'scale-[0.94] opacity-[0.14]' : !working && 'group-hover:-translate-y-2 group-focus-visible:-translate-y-2',
                )}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- flat jacket on the rail, alpha */}
                  <img src={url(it.jacket.preview)} alt="" width={900} height={900} decoding="async" draggable={false}
                    className={cn(
                      'h-full w-full object-contain transition-[filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)]',
                      'drop-shadow-[0_14px_16px_rgb(0_0_0/0.11)]',
                      !worn && !working && 'group-hover:drop-shadow-[0_26px_24px_rgb(0_0_0/0.16)]',
                    )} />
                </span>
              </span>

              {/* Set in from the image box to the garment's own edge: the flat
                  shots carry about a tenth of their width in clear margin. */}
              <span data-fr="tag" className={cn('mt-3 block w-full md:mt-4', left ? 'pl-[9%]' : 'pr-[9%]')}>
                <span className="label-sm nums block text-mute">
                  {worn ? 'On the model' : `${pad(i)} / ${pad(jackets)}`}
                </span>
                <span className="mt-1.5 block text-[0.8125rem] font-semibold leading-[1.15] tracking-[-0.015em] sm:text-[0.95rem]">
                  {name}
                </span>
                <Price amount={it.product.price} compareAt={it.product.compareAt} size="xs" className="mt-1 text-mute max-sm:hidden" />
                <span className={cn('label mt-3 flex items-center gap-2', !left && 'flex-row-reverse')}>
                  <span className="flex items-center gap-2">
                    <span className="relative whitespace-nowrap pb-1">
                      {worn ? 'Take off' : 'Wear it'}
                      <span aria-hidden className={cn(
                        'absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                        worn ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100',
                      )} />
                    </span>
                    <Icon name={worn ? 'close' : 'arrowR'} className={cn(
                      'mb-1 h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                      !worn && 'group-hover:translate-x-1',
                    )} />
                  </span>
                  {/* Where there is a keyboard, the key that does the same. */}
                  <kbd aria-hidden className={cn(
                    'label-sm mx-1.5 mb-1 hidden h-[1.125rem] min-w-[1.125rem] items-center justify-center border px-1 font-sans text-mute transition-colors duration-300 sm:pointer-fine:inline-flex',
                    worn ? 'border-ink text-ink' : 'border-line-2 group-hover:border-ink group-hover:text-ink',
                  )}>
                    {i}
                  </kbd>
                </span>
              </span>
            </button>
          );
        })}

        {/* The season, in the corner of the room. */}
        <p data-fr="meta" data-side="l" className="fr-meta label pointer-events-none z-20 text-mute">
          <span className="sm:hidden">AW 2026</span>
          <span className="max-sm:hidden">Autumn Winter 2026</span>
          <span className="mt-1.5 block text-ink">Foundation</span>
        </p>

        {/* The other corner: the prompt, then what is happening, and how far
            along, on a hairline that hangs under it only while he dresses. */}
        <div data-fr="meta" data-side="r" aria-hidden
          className="fr-meta pointer-events-none z-20 w-[min(13.5rem,42cqw)] text-right max-sm:w-[7.5rem]">
          <p className="label text-mute">
            {status.prompt
              ? <><span className="sm:hidden">Fitting Room</span><span className="max-sm:hidden">The Fitting Room</span></>
              : status.label}
          </p>
          <p className="label mt-1.5 text-ink">
            {status.prompt ? (
              <>
                <span className="pointer-coarse:hidden">Choose a jacket</span>
                <span className="hidden pointer-coarse:inline">Tap a jacket</span>
              </>
            ) : (
              <>
                <span className="max-sm:hidden">{status.line}</span>
                <span className={cn('sm:hidden', status.phone === null && 'invisible')}>{status.phone || '\u00a0'}</span>
              </>
            )}
          </p>
          <span className={cn(
            'absolute right-0 top-full mt-3 block h-px w-full bg-line transition-opacity duration-500 max-sm:w-[4.5rem]',
            working ? 'opacity-100' : 'opacity-0',
          )}>
            <span ref={progress} className="block h-full origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
          </span>
        </div>
      </div>

      <p aria-live="polite" role="status" className="sr-only">{announce}</p>

      {/* The strip: whatever he is wearing, ready to buy. */}
      <div ref={strip} className="border-b border-line bg-bone">
        <div className={cn(
          'page grid grid-cols-1 items-center gap-x-10 gap-y-4 py-5',
          'md:grid-cols-[minmax(0,1fr)_auto] md:gap-y-3',
          'lg:min-h-(--strip-h) lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:py-3',
        )}>
          <div data-swap className="flex min-w-0 items-end justify-between gap-6 md:justify-start md:gap-8">
            <div className="min-w-0">
              <p className="label-sm flex items-center gap-2.5 text-mute">
                <span>Now wearing</span>
                <span aria-hidden className="h-px w-6 bg-line-2" />
                <span>{look.colour}</span>
              </p>
              <h2 className="display-sm mt-2 truncate">
                <Link href={`/products/${look.product.slug}`} className="transition-opacity hover:opacity-60">{look.product.name}</Link>
              </h2>
            </div>
            <Price amount={look.product.price} compareAt={look.product.compareAt} className="shrink-0 pb-0.5" />
          </div>

          {look.product.sizes.length > 1 ? (
            <div data-swap className="relative flex flex-col gap-2 md:col-span-2 md:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
              <div role="group" aria-label={`Size, ${look.product.name}`} className="grid grid-cols-5 gap-1.5 md:flex">
                {look.product.sizes.map((s) => {
                  const out = unavailable(s);
                  return (
                    <button key={s} type="button" disabled={out} aria-pressed={size === s}
                      aria-label={out ? `Size ${s}, unavailable` : `Size ${s}`}
                      onClick={() => { setSize(s); setSizeError(false); }}
                      className={cn('label-sm min-h-11 min-w-11 border px-2.5 transition-colors duration-200',
                        out && 'cursor-not-allowed border-line text-stone line-through',
                        !out && size === s && 'border-ink bg-ink text-bone',
                        !out && size !== s && (sizeError ? 'border-oxide' : 'border-line hover:border-ink'))}>
                      {s}
                    </button>
                  );
                })}
              </div>
              {/* Under the sizes on a phone; hung below them on a wide screen, so
                  the strip does not change height when it appears. */}
              {sizeError ? <p role="alert" className="label-sm text-oxide lg:absolute lg:left-0 lg:top-full lg:mt-2">Choose a size</p>
                : low ? <p className="label-sm text-mute lg:absolute lg:left-0 lg:top-full lg:mt-2">Only a few left in {size}</p> : null}
            </div>
          ) : <span />}

          <div data-swap className="flex gap-2 md:col-start-2 md:row-start-1 lg:col-start-3">
            <Link href={`/products/${look.product.slug}`} className="btn btn-ghost flex-1 md:flex-none">Details</Link>
            <button type="button" onClick={addToBag} className="btn btn-solid flex-[2] md:flex-none">Add to bag</button>
          </div>
        </div>
      </div>

      {/* Phones: the buy bar follows once the strip has scrolled away. */}
      <div aria-hidden className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bone/95 px-(--gutter) py-3 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] md:hidden',
        barVisible ? 'translate-y-0' : 'translate-y-full')}>
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1">
            <span className="label-sm block text-mute">Now wearing</span>
            <span className="mt-0.5 block truncate text-sm font-semibold tracking-[-0.01em]">{look.product.name}</span>
          </p>
          <Price amount={look.product.price} className="shrink-0 text-sm" />
          <button type="button" tabIndex={-1} onClick={() => strip.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            className="btn btn-solid h-11 min-h-11 shrink-0 px-5">Select size</button>
        </div>
      </div>
    </section>
  );
}
