'use client';

import Link from '@/i18n/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Price } from '@/components/commerce/Price';
import { useStore } from '@/components/providers/Store';
import { useLocale, useT } from '@/i18n/client';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { LOGO } from '@/lib/brand';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';
import { CLIPS, FIGURE, FRAME, type ClipTrack, type Outfit } from '@/lib/outfits';

export type OutfitItem = Outfit & { product: Product };
type Jacket = NonNullable<Outfit['jacket']>;

/** Where the media is in its life. Input is refused until it rests again. */
type Media = 'base' | 'dressing' | 'dressed' | 'removing';
const RESTING = (m: Media) => m === 'base' || m === 'dressed';

const phone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
const url = (file: string) => `/img/outfits/${file}`;
const pad = (n: number) => String(n).padStart(2, '0');
const n4 = (n: number) => Number(n.toFixed(4));

/**
 * The 480 × 720 encodes are for phones whose screens would not show the
 * difference, or whose owners asked to save data. A dense phone screen draws
 * him at two or three device pixels per CSS pixel, where they read soft beside
 * the vector logotype, so it gets the 720 × 1080 ones. The <picture> sources
 * make the same choice with density descriptors.
 */
const small = () => {
  if (!phone()) return false;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return saveData || window.devicePixelRatio < 1.5;
};
const stillOf = (j: Jacket) => (small() ? j.dressedMobile : j.dressed);

/**
 * The clips are plain H.264 with the studio floor in them: the room around him
 * is the film's own backdrop, so no alpha channel is needed and every browser
 * (Safari included) plays the same file. Tagged BT.709 so the colours match the
 * stills, which are the clips' own first and last frames.
 */
const clipUrl = (name: string) => url(`${name}${small() ? '-m' : ''}.mp4`);

const decodeImage = (file: string) =>
  new Promise<void>((resolve) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().then(() => resolve(), () => resolve()) : resolve());
    im.onerror = () => resolve();
    im.src = url(file);
  });

const prefetch = (href: string) => {
  if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

/** Whether this browser has already taken a jacket down; if so, no hint. */
const SEEN_KEY = 'merit:fitting-room';
const seen = () => {
  try { return window.localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
};
const markSeen = () => {
  try { window.localStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode: hint again next time */ }
};

// ─── The clip's clean-up masks ────────────────────────────────────────────
/** The clean-up rectangles: a hard edge across, a soft one down. */
const HIDE_FX = 0.01;
const HIDE_FY = 0.025;

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
const black = (a: number) => `rgb(0 0 0 / ${Number(a.toFixed(3))})`;

/**
 * One soft rectangle cut out of the clip: a band across (fading in with the
 * strength) laid over a band down, composited by the default `add`, so the
 * clip stays whole outside either band and clears only where they cross.
 */
const hideMask = (hide: NonNullable<ClipTrack['hide']>, f: number) => {
  if (f <= hide[0][0] || f >= hide[hide.length - 1][0]) return null;
  let k = 0;
  while (k < hide.length - 2 && f > hide[k + 1][0]) k += 1;
  const a = hide[k];
  const b = hide[k + 1];
  const t = (f - a[0]) / Math.max(1, b[0] - a[0]);
  const [x0, x1, y0, y1, s] = [1, 2, 3, 4, 5].map((n) => (a[n] + (b[n] - a[n]) * t) / (n === 5 ? 1 : 1000));
  if (s <= 0.001) return null;
  const inner = black(1 - s);
  return [
    `linear-gradient(90deg, #000 ${pct(x0)}, ${inner} ${pct(x0 + HIDE_FX)}, ${inner} ${pct(x1 - HIDE_FX)}, #000 ${pct(x1)})`,
    `linear-gradient(180deg, #000 ${pct(y0)}, transparent ${pct(y0 + HIDE_FY)}, transparent ${pct(y1 - HIDE_FY)}, #000 ${pct(y1)})`,
  ].join(', ');
};

const masks = new WeakMap<HTMLElement, string>();
const setMask = (el: HTMLElement, value: string | null) => {
  const v = value ?? '';
  if (masks.get(el) === v) return;
  masks.set(el, v);
  el.style.setProperty('-webkit-mask-image', v);
  el.style.setProperty('mask-image', v);
};

// ─── The stage ─────────────────────────────────────────────────────────────
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
 * The room's side walls, as fractions of the frame's width. The stabilised film
 * covers 8.2% to 92.3% of the frame in every frame of all four clips (CLIPS in
 * lib/outfits: the largest l, the smallest r), so a room cut just inside that
 * never shows where a zoomed source frame ended.
 */
const ROOM = { l: 0.085, r: 0.08 };

/**
 * The stage geometry. The model stands in a room: a window on the film's own
 * studio, framed in black, standing on the page with a shadow under it. His
 * frame height (--fr-h) comes from the stage height, less a gap under the room
 * and, above it, the header plus some air, so the room's top edge is never
 * under the header.
 *
 * Landscape: the logotype runs the full page width behind the room, centred;
 * the room stands in front of its middle letters and the jackets hang on the
 * outer ones.
 *
 * Portrait (phones, tablets upright): the logotype becomes a masthead across
 * the top, the room starts just under it, and the jackets and the corner lines
 * move inside the room.
 *
 * The first screen ends on a whole line of the strip below the room: on a
 * wide screen the whole strip, one row; on a phone or an upright tablet its
 * first row only (what he is wearing and its price), with the sizes starting
 * just past the fold. Too short for that, the room takes the screen alone.
 *
 * Container units: the stage is a size container, so cqw/cqh are the stage.
 * The custom properties are resolved where they are used (its children).
 */
const GEOMETRY = `
.fr-room { --strip-h: 4.5rem; }
@media (min-width: 768px) { .fr-room { --strip-h: 4.75rem; } }
@media (min-width: 1024px) { .fr-room { --strip-h: min(clamp(6.5rem, 4rem + 6vw, 7.5rem), max(5rem, 20svh - 3.5rem)); } }
.fr-stage {
  container-type: size;
  height: calc(100svh - var(--strip-h));
  min-height: 20rem;
  --fr-gap: clamp(1rem, 3.2cqh, 2.25rem);
  --fr-room-top: calc(var(--nav-h) + clamp(0.5rem, 100cqh - 42rem, 3.5rem));
  --fr-h: calc(100cqh - var(--fr-gap) - var(--fr-room-top));
  --fr-w: calc(var(--fr-h) * ${n4(FRAME.width / FRAME.height)});
  --fr-top: calc(100cqh - var(--fr-gap) - var(--fr-h));
  --fr-logo-w: min(100cqw - 2 * var(--gutter), var(--page));
  --fr-logo-h: calc(var(--fr-logo-w) / ${LOGO.ratio});
  --fr-shift: 0px;
  --fr-logo-x: calc(50cqw - var(--fr-logo-w) / 2);
  --fr-room-l: calc(50cqw + var(--fr-shift) - var(--fr-w) * ${n4(0.5 - ROOM.l)});
  --fr-room-r: calc(50cqw - var(--fr-shift) - var(--fr-w) * ${n4(0.5 - ROOM.r)});
  --fr-logo-y: calc(var(--fr-top) + ${FIGURE.chest.y} * var(--fr-h) - ${COUNTER.y} * var(--fr-logo-h));
  --fr-rail-w: clamp(11rem, 0.19 * var(--fr-logo-w), 26rem);
  --fr-rail-y: calc(var(--fr-logo-y) + 0.36 * var(--fr-logo-h));
  --fr-rail-l: max(var(--gutter), var(--fr-logo-x) + 0.035 * var(--fr-logo-w));
  --fr-rail-r: max(var(--gutter), 100cqw - var(--fr-logo-x) - 0.965 * var(--fr-logo-w));
  --fr-edge: max(var(--gutter), (100cqw - var(--page)) / 2);
}
@media (max-height: 39rem) { .fr-stage { height: 100svh; } }
@media (min-aspect-ratio: 1001/1000) and (max-height: 32rem) {
  /* A phone on its side: the jackets hang smaller and the tags keep only the
     name and the action, so rail, tag and corner lines all fit. */
  .fr-stage { --fr-rail-w: clamp(5.5rem, 0.19 * var(--fr-logo-w), 8rem); }
  .fr-extra { display: none; }
  .fr-extra + .fr-name { margin-top: 0; }
}
@media (max-aspect-ratio: 1/1) {
  .fr-stage {
    --fr-logo-w: calc(100cqw - 2 * var(--gutter));
    --fr-logo-x: var(--gutter);
    --fr-logo-y: calc(var(--nav-h) + clamp(0.25rem, 1.4cqh, 1.25rem));
    --fr-h: min(92cqh - var(--fr-gap), 100cqh - var(--fr-gap) - var(--fr-logo-y) - var(--fr-logo-h) - 0.75rem);
    --fr-rail-w: min(0.27 * var(--fr-w), 12rem);
    --fr-rail-l: calc(var(--fr-room-l) + 0.625rem);
    --fr-rail-r: calc(var(--fr-room-r) + 0.625rem);
  }
}
.fr-logo { position: absolute; left: var(--fr-logo-x); top: var(--fr-logo-y); width: var(--fr-logo-w); }
.fr-model { position: absolute; bottom: var(--fr-gap); left: calc(50% - var(--fr-w) / 2 + var(--fr-shift)); width: var(--fr-w); height: var(--fr-h); }
/* The room: a window on the film's own studio, cut inside the columns the
   film covers in every frame (ROOM), with a thin black frame and the shadow of
   a box standing on the page. */
.fr-room-wall, .fr-room-frame { top: 0; bottom: 0; left: ${pct(ROOM.l)}; right: ${pct(ROOM.r)}; }
.fr-room-wall { background: #f4f2ee; box-shadow: 0 1.75rem 3.5rem -1.25rem rgb(0 0 0 / 0.32), 0 0.5rem 1rem -0.5rem rgb(0 0 0 / 0.18); }
.fr-room-view { clip-path: inset(0 ${pct(ROOM.r)} 0 ${pct(ROOM.l)}); }
.fr-room-frame { border: 1.5px solid #000; box-shadow: inset 0 0 3.5rem rgb(0 0 0 / 0.07), inset 0 1.5rem 2.5rem -1.5rem rgb(0 0 0 / 0.1); }
.fr-rail { position: absolute; top: var(--fr-rail-y); width: var(--fr-rail-w); }
.fr-rail[data-side="l"] { left: var(--fr-rail-l); }
.fr-rail[data-side="r"] { right: var(--fr-rail-r); }
.fr-meta { position: absolute; bottom: clamp(1.25rem, 3.6cqh, 2.25rem); }
.fr-meta[data-side="l"] { left: var(--fr-edge); }
.fr-meta[data-side="r"] { right: var(--fr-edge); }
@media (min-aspect-ratio: 1001/1000) and (min-height: 32.01rem) {
  /* The rail is never narrower than the longer name, so both tags keep one
     line each and their rows line up across the room. */
  .fr-name { white-space: nowrap; }
}
@media (max-aspect-ratio: 1/1) {
  /* Upright, the jackets stand in the lower corners beside his legs, where
     the room is widest, and the corner lines move up under the masthead. */
  .fr-rail { top: auto; bottom: calc(var(--fr-gap) + clamp(0.75rem, 3cqh, 1.75rem)); }
  .fr-meta { bottom: auto; top: calc(var(--fr-top) + 0.875rem); }
  .fr-meta[data-side="l"] { left: calc(var(--fr-room-l) + 0.875rem); }
  .fr-meta[data-side="r"] { right: calc(var(--fr-room-r) + 0.875rem); }
  /* Inside the room the jackets stand beside him: while he dresses they step
     back, so his hands and the jacket in them are what you watch. */
  .fr-rail { transition: opacity 0.45s var(--ease-out); }
  .fr-stage[aria-busy="true"] .fr-rail { opacity: 0.28; }
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
 * With focus in the room, keys 1 and 2 do the same, and 0 or Escape takes it
 * off. Under the stage, a strip sells whatever he has on.
 */
export function FittingRoom({ items }: { items: OutfitItem[] }) {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  // Which jacket is off the rail right now, by the film: it leaves the hook
  // the moment he takes it and is back the moment he hangs it up, so the rail
  // never shows the same jacket on him and on its hook at once.
  const [worn, setWorn] = useState(0);
  const [media, setMedia] = useState<Media>('base');
  const [hover, setHover] = useState<number | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [announce, setAnnounce] = useState('');

  const prev = useRef(0);
  const busy = useRef(false);
  const current = useRef(0);
  const inView = useRef(true);
  const list = useRef(items);
  const sway = useRef<gsap.core.Tween | null>(null);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const clipBox = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  const { add } = useStore();
  const { open, overlay } = useUi();
  const t = useT();
  const ar = useLocale() === 'ar';
  // Inside the room (which is laid out left to right) the words still read
  // right to left: each block of text carries the page's own direction.
  const textDir = ar ? 'rtl' : undefined;
  // The announcement is written from inside the dressing effect, which must
  // not re-run when the language changes; it reads the current one from here.
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

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
    const box = clipBox.current;
    if (!st || !vid || !box) return;
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
      const v = Math.min(1, (step + t) / steps);
      if (bar) bar.style.transform = `scaleX(${v})`;
      document.documentElement.style.setProperty('--fr-progress', v.toFixed(4));   // the cursor's ring reads this
    };
    paint(0);

    /**
     * Play one clip to its end, revealing it only once it is really moving.
     * Every frame the clean-up mask follows the clip, and at its hand-off
     * frame the rail is told the jacket has left it or is back on it.
     */
    const play = (name: string, reveal: () => void, handoff: () => void) =>
      new Promise<void>((resolve, reject) => {
        const track = CLIPS[name];
        let handed = false;
        const follow = (f: number) => {
          if (!track) return;
          setMask(vid, track.hide ? hideMask(track.hide, f) : null);
          if (!handed && f >= track.handoff) {
            handed = true;
            handoff();
          }
        };
        const tick = () => {
          if (vid.duration) {
            const t = vid.currentTime / vid.duration;
            paint(t);
            if (track) follow(Math.min(track.frames - 1, t * track.frames));
          }
          frame = requestAnimationFrame(tick);
        };
        vid.pause();
        vid.src = clipUrl(name);
        follow(0);
        const cleanup = () => {
          vid.removeEventListener('ended', done);
          vid.removeEventListener('error', fail);
          vid.removeEventListener('playing', moving);
          cancelAnimationFrame(frame);
          detach = null;
        };
        const done = () => {
          cleanup();
          paint(1);
          if (!handed) { handed = true; handoff(); }
          resolve();
        };
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
          await play(it.off, () => swap(vid, [still(i)]), () => setWorn(0));
          if (cancelled) return;
          swap(base, [vid]);
        } catch {
          if (!cancelled) swap(base, [still(i), vid]);
        }
      }
      setWorn(0);
      step += 1;
    };

    const dress = async (i: number) => {
      setMedia('dressing');
      const it = looks[i].jacket!;
      await decodeImage(stillOf(it));
      if (cancelled) return;
      if (reduced()) {
        swap(still(i), [base]);
        setWorn(i);
        return;
      }
      try {
        await play(it.on, () => swap(vid, [base]), () => setWorn(i));
        if (cancelled) return;
        // The still is the clip's own last frame: this is a cut nobody sees.
        swap(still(i), [vid]);
      } catch {
        if (!cancelled) swap(still(i), [base, vid]);
      }
      setWorn(i);
    };

    const run = async () => {
      busy.current = true;
      if (from !== 0) await undress(from);
      if (cancelled) return;
      if (active !== 0) await dress(active);
      if (cancelled) return;
      setWorn(active);
      setMedia(active === 0 ? 'base' : 'dressed');
      setShown(active);
      setSize(null);
      setSizeError(false);
      const tr = tRef.current;
      setAnnounce(active === 0
        ? tr('Jacket taken off. Now wearing the {name}.', { name: looks[0].product.name })
        : tr('Now wearing the {name} in {colour}.', { name: looks[active].product.name, colour: tr(looks[active].colour) }));
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

  // Once the page is idle, warm what the next choice will need: the jackets
  // he is not wearing, and the clip that takes off the one he is.
  useEffect(() => {
    const warm = () => {
      items.forEach((it, i) => {
        if (!it.jacket) return;
        if (i === active) {
          prefetch(clipUrl(it.jacket.off));
          return;
        }
        void decodeImage(stillOf(it.jacket));
        prefetch(clipUrl(it.jacket.on));
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

  // Escape works only while the room is actually on screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { inView.current = e.intersectionRatio >= 0.4; }, { threshold: [0, 0.4, 1] });
    io.observe(el);
    return () => io.disconnect();
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

  // With focus in the room: 1, 2 … put a jacket on (or take it off if he is
  // wearing it), and 0 takes it off. Single keys never act from anywhere
  // else on the page, so a stray key or a spoken word elsewhere cannot set
  // him dressing (WCAG 2.1.4). Escape also works from the page itself while
  // the room is on screen. Never with a modifier held, or with the bag,
  // search or menu open over the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey || overlay) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const inRoom = Boolean(t && stage.current?.contains(t));
      if (e.key === 'Escape') {
        if (!inView.current || (t && t !== document.body && !inRoom)) return;
        if (current.current !== 0) choose(current.current);
        return;
      }
      if (!inRoom) return;
      if (e.key === '0') {
        e.preventDefault();
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
    media === 'dressing' ? { label: t('Putting on'), line: target.product.name, phone: null }
      : media === 'removing' ? { label: t('Taking off'), line: items[shown].product.name, phone: null }
        : hovered ? { label: t(hover === active ? 'Take off' : active ? 'Swap for' : 'Try on'), line: hovered.product.name, phone: null }
          : active ? { label: t('Wearing'), line: target.product.name, phone: t('Tap to swap') }
            : { label: '', line: '', phone: '', prompt: true };

  return (
    <section ref={root} aria-labelledby="fr-title" className="fr-room relative bg-bone">
      <style href="merit-fitting-room" precedence="medium">{GEOMETRY}</style>
      <noscript><style dangerouslySetInnerHTML={{ __html: NO_SCRIPT }} /></noscript>
      <h1 id="fr-title" className="sr-only">{t('MERIT, Autumn Winter 2026. The Fitting Room: choose a jacket and see it worn.')}</h1>

      <div
        ref={stage}
        role="group"
        // The room is a picture: it keeps its English composition in Arabic
        // (sand on the left, leather on the right), only its words change.
        dir="ltr"
        aria-label={t('The Fitting Room. Choose a jacket to put on. Keys 1 and 2 put one on, 0 takes it off.')}
        aria-busy={working}
        data-cursor-busy={working ? t(media === 'removing' ? 'Taking off' : 'Putting on') : undefined}
        className="fr-stage group/room relative overflow-hidden border-b border-line"
      >
        {/* The header is clear only over this band at the top of the room, so
            it turns solid as soon as the page moves, before its own logotype
            can slide over his black tee. It is also a masthead: the header's
            logotype waits while the stone one is on screen, so the name is
            never said twice at once. */}
        <span aria-hidden data-header-over="light" data-header-masthead
          className="pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--nav-h)+2.5rem)]" />

        {/* The masthead: the logotype, in stone, behind him. */}
        <div aria-hidden data-fr="logo" className="fr-logo pointer-events-none text-stone-brand will-change-transform">
          <Wordmark className="block h-auto w-full" />
        </div>

        {/* The model, in his room. Stills and clip share one box, so he never
            moves; the room is a window cut into that box, inside the columns
            the film always covers, so a hand reaching past it simply leaves
            the room at its border. */}
        <div data-fr="model" className="fr-model z-10 select-none">
          <span aria-hidden className="fr-room-wall pointer-events-none absolute" />
          <div className="fr-room-view absolute inset-0">
          <div data-base className="absolute inset-0">
            <picture>
              {items[0].still?.mobile ? (
                <source media="(max-width: 767px)"
                  srcSet={`${url(items[0].still.mobile)} 1x, ${url(items[0].still.file)} 1.5x`} />
              ) : null}
              <img src={url(items[0].still!.file)} alt={t(items[0].alt)} width={FRAME.width} height={FRAME.height}
                fetchPriority="high" decoding="async" className="h-full w-full object-contain" draggable={false} />
            </picture>
          </div>
          {items.map((it, i) => (it.jacket ? (
            <div key={it.slug} data-still={i} aria-hidden className="absolute inset-0 opacity-0">
              <picture>
                <source media="(max-width: 767px)"
                  srcSet={`${url(it.jacket.dressedMobile)} 1x, ${url(it.jacket.dressed)} 1.5x`} />
                <img src={url(it.jacket.dressed)} alt="" width={720} height={1080} loading="lazy" decoding="async"
                  className="h-full w-full object-contain" draggable={false} />
              </picture>
            </div>
          ) : null))}
          {/* The clip; the video itself carries the clean-up of the few frames
              that need one. */}
          <div ref={clipBox} aria-hidden className="pointer-events-none absolute inset-0">
            <video ref={video} tabIndex={-1} muted playsInline preload="none" disablePictureInPicture
              className="absolute inset-0 h-full w-full object-contain opacity-0" width={720} height={1080} />
          </div>
          </div>
          <span aria-hidden className="fr-room-frame pointer-events-none absolute" />
        </div>

        {/* The rail: sand on the left, leather on the right. */}
        {items.map((it, i) => {
          if (!it.jacket) return null;
          const on = worn === i;
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
              aria-pressed={on}
              aria-disabled={working || undefined}
              aria-keyshortcuts={String(i)}
              aria-label={name}
              data-cursor={working ? undefined : t(on ? 'Take off' : active ? 'Swap' : 'Wear')}
              className={cn(
                'fr-rail group z-20 flex flex-col',
                left ? 'items-start text-left' : 'items-end text-right',
              )}
            >
              <span data-fr="hang" className="relative block aspect-square w-full">
                <span className={cn(
                  'block h-full w-full transition-[translate,scale,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)]',
                  on ? 'scale-[0.94] opacity-[0.14]' : !working && 'group-hover:-translate-y-2 group-focus-visible:-translate-y-2',
                )}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- flat jacket on the rail, alpha */}
                  <img src={url(it.jacket.preview)} alt="" width={900} height={900} decoding="async" draggable={false}
                    className={cn(
                      'h-full w-full object-contain transition-[filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)]',
                      'drop-shadow-[0_14px_16px_rgb(0_0_0/0.11)]',
                      !on && !working && 'group-hover:drop-shadow-[0_26px_24px_rgb(0_0_0/0.16)]',
                    )} />
                </span>
              </span>

              {/* Set in from the image box to the garment's own edge: the flat
                  shots carry about a tenth of their width in clear margin. */}
              <span data-fr="tag" dir={textDir} className={cn('mt-3 block w-full md:mt-4', left ? 'pl-[9%]' : 'pr-[9%]')}>
                <span className="fr-extra label-sm nums block text-mute">
                  {on ? t('On the model') : `${pad(i)} / ${pad(jackets)}`}
                </span>
                <span className="fr-name mt-1.5 block text-[0.8125rem] font-semibold leading-[1.15] tracking-[-0.015em] sm:text-[0.95rem]">
                  {name}
                </span>
                <Price amount={it.product.price} compareAt={it.product.compareAt} size="xs" className="fr-extra mt-1 text-mute max-sm:hidden" />
                <span dir="ltr" className={cn('label mt-3 flex items-center gap-2', !left && 'flex-row-reverse')}>
                  {/* In Arabic the arrow leads, pointing the way Arabic reads. */}
                  <span className={cn('flex items-center gap-2', ar && 'flex-row-reverse')}>
                    <span className="relative whitespace-nowrap pb-1">
                      {t(on ? 'Take off' : 'Wear it')}
                      <span aria-hidden className={cn(
                        'absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                        on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100',
                      )} />
                    </span>
                    <Icon name={on ? 'close' : 'arrowR'} className={cn(
                      'mb-1 h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                      !on && (ar ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'),
                    )} />
                  </span>
                  {/* The key that does the same, shown once focus is in the
                      room, which is where the keys work. */}
                  <kbd aria-hidden className={cn(
                    'label-sm mx-1.5 mb-1 hidden h-[1.125rem] min-w-[1.125rem] items-center justify-center border px-1 font-sans text-mute transition-colors duration-300 group-has-[:focus-visible]/room:inline-flex',
                    on ? 'border-ink text-ink' : 'border-line-2 group-hover:border-ink group-hover:text-ink',
                  )}>
                    {i}
                  </kbd>
                </span>
              </span>
            </button>
          );
        })}

        {/* The season, in the corner of the room. */}
        <p data-fr="meta" data-side="l" dir={textDir} className="fr-meta label pointer-events-none z-20 text-left text-mute">
          <span className="sm:hidden">{t('AW 2026')}</span>
          <span className="max-sm:hidden">{t('Autumn Winter 2026')}</span>
          <span className="mt-1.5 block text-ink">{t('Foundation')}</span>
        </p>

        {/* The other corner: the prompt, then what is happening, and how far
            along, on a hairline that hangs under it only while he dresses. */}
        <div data-fr="meta" data-side="r" aria-hidden dir={textDir}
          className="fr-meta pointer-events-none z-20 w-[min(13.5rem,42cqw)] text-right max-sm:w-[7.5rem]">
          <p className="label text-mute">
            {status.prompt
              ? <><span className="sm:hidden">{t('Fitting Room')}</span><span className="max-sm:hidden">{t('The Fitting Room')}</span></>
              : status.label}
          </p>
          <p className="label mt-1.5 text-ink">
            {status.prompt ? (
              <>
                <span className="pointer-coarse:hidden">{t('Choose a jacket')}</span>
                <span className="hidden pointer-coarse:inline">{t('Tap a jacket')}</span>
              </>
            ) : (
              <>
                <span className="max-sm:hidden">{status.line}</span>
                <span className={cn('sm:hidden', status.phone === null && 'invisible')}>{status.phone || ' '}</span>
              </>
            )}
          </p>
          <span className={cn(
            'absolute right-0 top-full mt-3 block h-px w-full bg-line transition-opacity duration-500 max-sm:w-[4.5rem]',
            working ? 'opacity-100' : 'opacity-0',
          )}>
            <span ref={progress} className="block h-full origin-left bg-ink rtl:origin-right" style={{ transform: 'scaleX(0)' }} />
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
                <span>{t('Now wearing')}</span>
                <span aria-hidden className="h-px w-6 bg-line-2" />
                <span>{t(look.colour)}</span>
              </p>
              <h2 className="display-sm mt-2 truncate">
                <Link href={`/products/${look.product.slug}`} className="transition-opacity hover:opacity-60">{look.product.name}</Link>
              </h2>
            </div>
            <Price amount={look.product.price} compareAt={look.product.compareAt} className="shrink-0 pb-0.5" />
          </div>

          {look.product.sizes.length > 1 ? (
            <div data-swap className="relative flex flex-col gap-2 md:col-span-2 md:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
              <div role="group" aria-label={t('Size, {name}', { name: look.product.name })} className="grid grid-cols-5 gap-1.5 md:flex">
                {look.product.sizes.map((s) => {
                  const out = unavailable(s);
                  return (
                    <button key={s} type="button" disabled={out} aria-pressed={size === s}
                      aria-label={out ? t('Size {size}, unavailable', { size: s }) : t('Size {size}', { size: s })}
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
              {sizeError ? <p role="alert" className="label-sm text-oxide lg:absolute lg:start-0 lg:top-full lg:mt-2">{t('Choose a size')}</p>
                : low ? <p className="label-sm text-mute lg:absolute lg:start-0 lg:top-full lg:mt-2">{t('Only a few left in {size}', { size: size ?? '' })}</p> : null}
            </div>
          ) : <span />}

          <div data-swap className="flex gap-2 md:col-start-2 md:row-start-1 lg:col-start-3">
            <Link href={`/products/${look.product.slug}`} className="btn btn-ghost flex-1 md:flex-none">{t('Details')}</Link>
            <button type="button" onClick={addToBag} className="btn btn-solid flex-[2] md:flex-none">{t('Add to bag')}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
