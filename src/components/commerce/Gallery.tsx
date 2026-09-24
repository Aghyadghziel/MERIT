'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fitClass, imageKind, imageSrc } from '@/app/[lang]/products/[slug]/_parts/media';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { pad2 } from '@/lib/format';
import { reduced, setupGsap } from '@/lib/gsap';
import { useT } from '@/i18n/client';
import type { T } from '@/i18n/dictionary';

type Props = { images: string[]; name: string };

/**
 * Desktop is a spread: each photograph fills the left half of the screen, one
 * per screen, beside a panel that stays put. A small index hangs at the foot of
 * the column and follows the reading, and the photographs drift a few percent
 * inside their frames as they pass. Phones get a full-bleed swipe rail.
 * Any photograph opens full screen, where it can be zoomed and panned.
 */
export function Gallery({ images, name }: Props) {
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const spread = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const slides = useRef<(HTMLLIElement | null)[]>([]);
  const n = images.length;
  const t = useT();
  const alt = (i: number) => (i === 0 ? name : t('{name}, view {n}', { name, n: i + 1 }));

  // Which photograph is crossing the middle of the screen.
  useEffect(() => {
    const els = slides.current.filter((el): el is HTMLLIElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [n]);

  // The phone rail's page, counted from its starting edge (the right one in
  // RTL, where scrollLeft runs negative); the last page is the one where the
  // rail can scroll no further (two-up on a tablet).
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth || el.clientWidth;
      const x = Math.abs(el.scrollLeft);
      const end = x + el.clientWidth >= el.scrollWidth - 2;
      setPage(end ? n - 1 : Math.min(n - 1, Math.round(x / w)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [n]);

  // Drift and the opening settle, desktop only and only when motion is wanted.
  useLayoutEffect(() => {
    const root = spread.current;
    if (!root || reduced()) return;
    const { gsap } = setupGsap();
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      root.querySelectorAll<HTMLElement>('[data-drift]').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -4.5 },
          {
            yPercent: 4.5,
            ease: 'none',
            scrollTrigger: { trigger: img.closest('li'), start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
      const first = root.querySelector('[data-intro]');
      if (first) gsap.from(first, { scale: 1.06, duration: 1.8, ease: 'power3.out' });
    });
    return () => mm.revert();
  }, [n]);

  // The header steps away on a deliberate scroll down and comes back on one
  // up (Header.tsx: 28px down, 10px up, never near the top). Aim for where it
  // will be when the scroll lands: a photograph reached going down sits flush
  // with the top of the screen, one reached going up sits under the header.
  const goTo = (i: number) => {
    const el = slides.current[i];
    if (!el) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 16 || 80;
    const y0 = window.scrollY;
    const flush = el.getBoundingClientRect().top + y0;
    const under = flush - nav;
    const hides = flush - y0 > 28 && flush >= nav * 2.5;
    const shows = under - y0 < -10 || under < nav * 2.5;
    const y = hides ? flush : shows ? under : document.documentElement.dataset.header === 'hidden' ? flush : under;
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'instant' : 'smooth' });
  };

  return (
    <>
      <div ref={spread} className="relative">
        {/* One list for every size: a swipe rail on phones (two-up on a
            tablet), a column of full-height photographs on a desktop. */}
        <ul
          ref={rail}
          aria-label={t('{name}, photographs', { name })}
          className="no-bar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:snap-none lg:flex-col lg:gap-1 lg:overflow-visible"
        >
          {images.map((img, i) => {
            const photo = imageKind(img) === 'photo';
            return (
              <li
                key={img}
                ref={(el) => { slides.current[i] = el; }}
                data-index={i}
                className="w-full shrink-0 snap-start overflow-hidden md:w-1/2 md:border-e md:border-bone md:last:border-e-0 lg:w-full lg:border-e-0"
                {...(i > 0 ? { 'data-reveal-img': '' } : {})}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="relative block aspect-[4/5] w-full overflow-hidden bg-bone-2 lg:aspect-auto lg:h-[min(calc(100svh-var(--nav-h)),62.5vw)] lg:cursor-zoom-in"
                >
                  <span className="absolute inset-0 block" {...(i === 0 ? { 'data-intro': '' } : {})}>
                    <Image
                      src={imageSrc(img)}
                      alt={alt(i)}
                      fill
                      sizes="(min-width:768px) 50vw, 100vw"
                      preload={i === 0}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className={cn(fitClass(img), photo && 'lg:motion-safe:scale-[1.1]')}
                      {...(photo ? { 'data-drift': '' } : {})}
                    />
                  </span>
                  <span className="sr-only">{t(', open full screen')}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Phone: the count and a zoom hint over the photograph, a progress
            rule under it. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[2px] flex items-end justify-between p-3 lg:hidden">
          <span className="label-sm nums bg-bone/90 px-2.5 py-2 backdrop-blur-sm">
            {pad2(page + 1)}
            <span className="text-mute"> / {pad2(n)}</span>
          </span>
          <span className="flex h-8 w-8 items-center justify-center bg-bone/90 backdrop-blur-sm">
            <Icon name="plus" className="h-3.5 w-3.5" />
          </span>
        </div>
        <div aria-hidden className="flex gap-px lg:hidden">
          {images.map((img, i) => (
            <span
              key={img}
              className={cn('h-[2px] flex-1 transition-colors duration-300', i === page ? 'bg-ink' : 'bg-line')}
            />
          ))}
        </div>

        {/* Desktop: the index hangs from the foot of the screen while the
            column passes. */}
        <div className="pointer-events-none sticky bottom-0 z-10 hidden h-0 lg:block">
          <div className="pointer-events-auto absolute bottom-5 end-5 flex h-11 items-center bg-bone/92 ps-4 backdrop-blur-sm">
            <p className="label-sm nums w-[4.5em]" aria-hidden>
              {pad2(active + 1)}
              <span className="text-mute"> / {pad2(n)}</span>
            </p>
            {n > 1 ? (
              <div role="group" aria-label={t('Go to photograph')} className="flex items-center">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={t('Photograph {i} of {n}', { i: i + 1, n })}
                    aria-current={i === active ? 'true' : undefined}
                    className="group flex h-11 w-11 items-center justify-center"
                  >
                    <span
                      className={cn(
                        'block h-px transition-[width,background-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
                        i === active ? 'w-7 bg-ink' : 'w-4 bg-line-2 group-hover:bg-mute',
                      )}
                    />
                  </button>
                ))}
              </div>
            ) : null}
            <span aria-hidden className="h-4 w-px bg-line-2" />
            <button
              type="button"
              onClick={() => setLightbox(active)}
              className="label-sm flex h-11 items-center gap-2 px-4 transition-opacity hover:opacity-60"
            >
              <Icon name="plus" className="h-3 w-3" />
              {t('Zoom')}<span className="sr-only">{t(' photograph {i}', { i: active + 1 })}</span>
            </button>
          </div>
        </div>
      </div>

      {lightbox !== null ? (
        <Lightbox images={images} name={name} start={lightbox} alt={alt} t={t} onClose={() => setLightbox(null)} />
      ) : null}
    </>
  );
}

const ZOOM = 2.4;
/** Scroll offsets run negative from the start edge in a right-to-left box. */
const sign = (el: HTMLElement) => (getComputedStyle(el).direction === 'rtl' ? -1 : 1);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Where the photograph actually sits inside its full-screen button. */
type Frame = { W: number; H: number; left: number; top: number; w: number; h: number };

/**
 * The button is the whole stage, but a portrait photograph under object-contain
 * fills only a strip of it. Zooming has to be worked out against that strip, or
 * pointing beside the photograph pushes it off screen.
 */
function frameOf(btn: HTMLElement): Frame {
  const W = btn.clientWidth;
  const H = btn.clientHeight;
  const img = btn.querySelector('img');
  const cs = img ? getComputedStyle(img) : null;
  const px = (v?: string) => parseFloat(v ?? '') || 0;
  const pl = px(cs?.paddingLeft);
  const pt = px(cs?.paddingTop);
  const cw = W - pl - px(cs?.paddingRight);
  const ch = H - pt - px(cs?.paddingBottom);
  const nw = img?.naturalWidth || cw;
  const nh = img?.naturalHeight || ch;
  const s = Math.min(cw / nw, ch / nh);
  const w = nw * s;
  const h = nh * s;
  return { W, H, left: pl + (cw - w) / 2, top: pt + (ch - h) / 2, w, h };
}

/**
 * The transform-origin (px, in the button) that puts the zoomed photograph
 * where the pan asks: along an axis where it is bigger than the screen, `f`
 * runs from its first edge on the screen's edge (0) to its last (1), so it
 * always covers the screen; where it is smaller, it stays centred.
 */
function originFor(fr: Frame, fx: number, fy: number) {
  const axis = (view: number, start: number, size: number, f: number) => {
    const big = size * ZOOM;
    const lands = big > view ? -(big - view) * f : (view - big) / 2;
    // A point p maps to o + (p - o) * ZOOM; solve for the o that sends the
    // photograph's first edge to `lands`.
    return (start * ZOOM - lands) / (ZOOM - 1);
  };
  return { x: axis(fr.W, fr.left, fr.w, fx), y: axis(fr.H, fr.top, fr.h, fy) };
}

/** A pointer's place on the stage as a pan, with a margin so the edges are easy to reach. */
function panAt(e: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  return {
    x: clamp01((e.clientX - r.left - r.width * 0.1) / (r.width * 0.8)),
    y: clamp01((e.clientY - r.top - r.height * 0.1) / (r.height * 0.8)),
  };
}

/**
 * Full screen on the native <dialog>, which brings the focus trap, Escape and
 * an inert page for free. Swipe or use the arrows to move; click or tap to
 * zoom. A mouse pans by pointing (the whole screen maps onto the whole
 * photograph), a finger pans by dragging, one to one.
 */
function Lightbox({
  images, name, start, alt, t, onClose,
}: { images: string[]; name: string; start: number; alt: (i: number) => string; t: T; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; fx: number; fy: number; moved: boolean } | null>(null);
  const pan = useRef({ x: 0.5, y: 0.5 });
  const [cur, setCur] = useState(start);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const n = images.length;

  const panTo = (btn: HTMLElement, fx: number, fy: number) => {
    pan.current = { x: fx, y: fy };
    setOrigin(originFor(frameOf(btn), fx, fy));
  };

  // The origin is in pixels of the stage, so a new stage size starts over.
  useEffect(() => {
    const out = () => setZoom(false);
    window.addEventListener('resize', out);
    return () => window.removeEventListener('resize', out);
  }, []);

  useEffect(() => {
    const d = dlg.current;
    const tk = track.current;
    if (!d || !tk) return;
    if (!d.open) d.showModal();
    tk.scrollTo({ left: sign(tk) * start * tk.clientWidth, behavior: 'instant' });
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = before; };
  }, [start]);

  const go = (i: number) => {
    const tk = track.current;
    if (!tk) return;
    const k = (i + n) % n;
    setZoom(false);
    tk.scrollTo({ left: sign(tk) * k * tk.clientWidth, behavior: reduced() ? 'instant' : 'smooth' });
  };

  const onScroll = () => {
    const tk = track.current;
    if (!tk) return;
    const i = Math.round(Math.abs(tk.scrollLeft) / tk.clientWidth);
    if (i !== cur) {
      setCur(i);
      setZoom(false);
    }
  };

  return (
    <dialog
      ref={dlg}
      onClose={onClose}
      onKeyDown={(e) => {
        // The arrow that points along the reading direction goes forward.
        const fwd = dlg.current && sign(dlg.current) === -1 ? 'ArrowLeft' : 'ArrowRight';
        const back = fwd === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
        if (e.key === fwd) { e.preventDefault(); go(cur + 1); }
        if (e.key === back) { e.preventDefault(); go(cur - 1); }
      }}
      aria-label={t('{name}, photographs', { name })}
      className="m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden border-0 bg-bone p-0 text-ink backdrop:bg-bone"
    >
      <div className="relative flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-6 px-(--gutter)">
          <p className="label-sm nums w-24" aria-live="polite">
            {pad2(cur + 1)}
            <span className="text-mute"> / {pad2(n)}</span>
          </p>
          <p className="label-sm hidden truncate text-mute md:block">{name}</p>
          <div className="flex w-24 justify-end">
            <button type="button" autoFocus onClick={() => dlg.current?.close()} className="icon-btn" aria-label={t('Close photographs')}>
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div
          ref={track}
          onScroll={onScroll}
          className={cn('no-bar flex min-h-0 flex-1 snap-x snap-mandatory', zoom ? 'overflow-hidden' : 'overflow-x-auto')}
        >
          {images.map((img, i) => {
            const on = zoom && i === cur;
            return (
              <div key={img} className="relative h-full w-full shrink-0 snap-center">
                <button
                  type="button"
                  tabIndex={i === cur ? 0 : -1}
                  aria-label={`${alt(i)}. ${t(on ? 'Zoom out' : 'Zoom in')}`}
                  className={cn('relative block h-full w-full overflow-hidden', on ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in')}
                  onPointerDown={(e) => {
                    drag.current = { x: e.clientX, y: e.clientY, fx: pan.current.x, fy: pan.current.y, moved: false };
                  }}
                  onPointerMove={(e) => {
                    if (!on) return;
                    const btn = e.currentTarget;
                    if (e.pointerType === 'mouse') {
                      const p = panAt(e);
                      panTo(btn, p.x, p.y);
                      return;
                    }
                    const d = drag.current;
                    if (!d) return;
                    const dx = e.clientX - d.x;
                    const dy = e.clientY - d.y;
                    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
                    // The photograph follows the finger exactly: a drag of its
                    // overhang moves the pan from one end to the other.
                    const fr = frameOf(btn);
                    const overX = fr.w * ZOOM - fr.W;
                    const overY = fr.h * ZOOM - fr.H;
                    panTo(
                      btn,
                      overX > 0 ? clamp01(d.fx - dx / overX) : 0.5,
                      overY > 0 ? clamp01(d.fy - dy / overY) : 0.5,
                    );
                  }}
                  onClick={(e) => {
                    const moved = drag.current?.moved;
                    drag.current = null;
                    if (moved) return;
                    if (on) { setZoom(false); return; }
                    // A keyboard press has no point; it zooms into the middle.
                    const p = e.detail === 0 ? { x: 0.5, y: 0.5 } : panAt(e);
                    panTo(e.currentTarget, p.x, p.y);
                    setZoom(true);
                  }}
                >
                  <Image
                    src={imageSrc(img)}
                    alt=""
                    fill
                    sizes="100vw"
                    className={cn(
                      'object-contain transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                      imageKind(img) === 'flat' && 'p-[6%]',
                    )}
                    style={{ transform: on ? `scale(${ZOOM})` : 'scale(1)', transformOrigin: `${origin.x}px ${origin.y}px` }}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(cur - 1)}
              aria-label={t('Previous photograph')}
              className="absolute start-(--gutter) top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-line bg-bone/85 transition-colors hover:border-ink md:flex"
            >
              <Icon name="arrowL" />
            </button>
            <button
              type="button"
              onClick={() => go(cur + 1)}
              aria-label={t('Next photograph')}
              className="absolute end-(--gutter) top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-line bg-bone/85 transition-colors hover:border-ink md:flex"
            >
              <Icon name="arrowR" />
            </button>

            <div className="flex shrink-0 items-center justify-center gap-2 px-(--gutter) pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t('Photograph {i} of {n}', { i: i + 1, n })}
                  aria-current={i === cur ? 'true' : undefined}
                  className={cn(
                    'relative h-14 w-11 overflow-hidden bg-bone-2 outline-offset-2 transition-opacity',
                    i === cur ? 'outline outline-1 outline-ink' : 'opacity-55 hover:opacity-100',
                  )}
                >
                  <Image src={imageSrc(img)} alt="" fill sizes="48px" className={fitClass(img)} />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
