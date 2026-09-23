'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fitClass, imageKind, imageSrc } from '@/app/products/[slug]/_parts/media';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { pad2 } from '@/lib/format';
import { reduced, setupGsap } from '@/lib/gsap';

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
  const alt = (i: number) => (i === 0 ? name : `${name}, view ${i + 1}`);

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

  // The phone rail's page, counted from the left edge; the last page is the
  // one where the rail can scroll no further (two-up on a tablet).
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth || el.clientWidth;
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      setPage(end ? n - 1 : Math.min(n - 1, Math.round(el.scrollLeft / w)));
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

  const goTo = (i: number) =>
    slides.current[i]?.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });

  return (
    <>
      <div ref={spread} className="relative">
        {/* One list for every size: a swipe rail on phones (two-up on a
            tablet), a column of full-height photographs on a desktop. */}
        <ul
          ref={rail}
          aria-label={`${name}, photographs`}
          className="no-bar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:snap-none lg:flex-col lg:gap-1 lg:overflow-visible"
        >
          {images.map((img, i) => {
            const photo = imageKind(img) === 'photo';
            return (
              <li
                key={img}
                ref={(el) => { slides.current[i] = el; }}
                data-index={i}
                className="w-full shrink-0 snap-start overflow-hidden md:w-1/2 md:border-r md:border-bone md:last:border-r-0 lg:w-full lg:-scroll-mt-4 lg:border-r-0"
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
                  <span className="sr-only">, open full screen</span>
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
          <div className="pointer-events-auto absolute bottom-5 right-5 flex h-11 items-center bg-bone/92 pl-4 backdrop-blur-sm">
            <p className="label-sm nums mr-2 w-[4.5em]" aria-hidden>
              {pad2(active + 1)}
              <span className="text-mute"> / {pad2(n)}</span>
            </p>
            {n > 1 ? (
              <div role="group" aria-label="Go to photograph" className="flex items-center">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Photograph ${i + 1} of ${n}`}
                    aria-current={i === active ? 'true' : undefined}
                    className="group flex h-11 w-6 items-center justify-center"
                  >
                    <span
                      className={cn(
                        'block h-px transition-[width,background-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
                        i === active ? 'w-5 bg-ink' : 'w-3 bg-line-2 group-hover:bg-mute',
                      )}
                    />
                  </button>
                ))}
              </div>
            ) : null}
            <span aria-hidden className="ml-2 h-4 w-px bg-line-2" />
            <button
              type="button"
              onClick={() => setLightbox(active)}
              className="label-sm flex h-11 items-center gap-2 px-4 transition-opacity hover:opacity-60"
            >
              <Icon name="plus" className="h-3 w-3" />
              Zoom<span className="sr-only"> photograph {active + 1}</span>
            </button>
          </div>
        </div>
      </div>

      {lightbox !== null ? (
        <Lightbox images={images} name={name} start={lightbox} alt={alt} onClose={() => setLightbox(null)} />
      ) : null}
    </>
  );
}

const ZOOM = 2.4;
const clamp = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Full screen on the native <dialog>, which brings the focus trap, Escape and
 * an inert page for free. Swipe or use the arrows to move; click or tap to
 * zoom. A mouse pans by pointing, a finger pans by dragging.
 */
function Lightbox({
  images, name, start, alt, onClose,
}: { images: string[]; name: string; start: number; alt: (i: number) => string; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [cur, setCur] = useState(start);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const n = images.length;

  useEffect(() => {
    const d = dlg.current;
    const t = track.current;
    if (!d || !t) return;
    if (!d.open) d.showModal();
    t.scrollTo({ left: start * t.clientWidth, behavior: 'instant' });
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = before; };
  }, [start]);

  const go = (i: number) => {
    const t = track.current;
    if (!t) return;
    const k = (i + n) % n;
    setZoom(false);
    t.scrollTo({ left: k * t.clientWidth, behavior: reduced() ? 'instant' : 'smooth' });
  };

  const onScroll = () => {
    const t = track.current;
    if (!t) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    if (i !== cur) {
      setCur(i);
      setZoom(false);
    }
  };

  const point = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  return (
    <dialog
      ref={dlg}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
      }}
      aria-label={`${name}, photographs`}
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
            <button type="button" autoFocus onClick={() => dlg.current?.close()} className="icon-btn" aria-label="Close photographs">
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
                  aria-label={`${alt(i)}. ${on ? 'Zoom out' : 'Zoom in'}`}
                  className={cn('relative block h-full w-full overflow-hidden', on ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in')}
                  onPointerDown={(e) => {
                    drag.current = { x: e.clientX, y: e.clientY, ox: origin.x, oy: origin.y, moved: false };
                  }}
                  onPointerMove={(e) => {
                    if (!on) return;
                    if (e.pointerType === 'mouse') { setOrigin(point(e)); return; }
                    const d = drag.current;
                    if (!d) return;
                    const r = e.currentTarget.getBoundingClientRect();
                    const dx = e.clientX - d.x;
                    const dy = e.clientY - d.y;
                    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
                    setOrigin({ x: clamp(d.ox - (dx / r.width) * 140), y: clamp(d.oy - (dy / r.height) * 140) });
                  }}
                  onClick={(e) => {
                    const moved = drag.current?.moved;
                    drag.current = null;
                    if (moved) return;
                    if (on) { setZoom(false); return; }
                    setOrigin(e.detail === 0 ? { x: 50, y: 50 } : point(e));
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
                    style={{ transform: on ? `scale(${ZOOM})` : 'scale(1)', transformOrigin: `${origin.x}% ${origin.y}%` }}
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
              aria-label="Previous photograph"
              className="absolute left-(--gutter) top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-line bg-bone/85 transition-colors hover:border-ink md:flex"
            >
              <Icon name="arrowL" />
            </button>
            <button
              type="button"
              onClick={() => go(cur + 1)}
              aria-label="Next photograph"
              className="absolute right-(--gutter) top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-line bg-bone/85 transition-colors hover:border-ink md:flex"
            >
              <Icon name="arrowR" />
            </button>

            <div className="flex shrink-0 items-center justify-center gap-2 px-(--gutter) pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Photograph ${i + 1} of ${n}`}
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
