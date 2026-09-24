'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Lines } from '@/components/ui/Lines';
import { LINE_ROOM } from '@/components/ui/SectionHead';
import { Wordmark } from '@/components/ui/Wordmark';
import { useT } from '@/i18n/client';
import { LOGO } from '@/lib/brand';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';

export type TocItem = { id: string; label: string };
export type Fact = { label: string; value: string; unit?: string; note?: string };

const pad = (n: number) => String(n).padStart(2, '0');

/** Long-form reading measure: a little over sixty characters, set in graphite. */
const PROSE =
  'mt-6 max-w-[62ch] space-y-5 text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.72] text-ink-3 ' +
  '[&_strong]:font-semibold [&_strong]:text-ink [&_a]:text-ink ' +
  '[&_code]:bg-bone-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:text-ink';

/**
 * The shell for every written page: client care, policies, the size guide.
 *
 * The opening is a poster: the title at display size, the M embossed in stone
 * and cropped by the edge of the page, the standfirst hung from the right-hand
 * columns. Optional key figures sit on an ink rule under it. The body is a
 * reading column with a table of contents that follows the reader — a list in
 * the margin on desktop, a strip pinned under the header on a phone — and a
 * hairline that fills as the page is read.
 */
export function TextPage({
  eyebrow, title, standfirst, facts, toc, aside, asideLast = false, children,
}: {
  eyebrow: string;
  title: string;
  standfirst?: React.ReactNode;
  facts?: Fact[];
  toc?: TocItem[];
  aside?: React.ReactNode;
  /** On phones and tablets, put the aside after the main column instead of before it. */
  asideLast?: boolean;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const t = useT();

  // The embossed mark drifts slower than the page, so the title slides over it.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.to('[data-tp="mark"]', {
        yPercent: 24, ease: 'none',
        scrollTrigger: { trigger: '[data-tp="hero"]', start: 'top top', end: 'bottom top', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // Which section is being read, and how far through the page the reader is.
  useEffect(() => {
    if (!toc?.length) return;
    const sections = toc.map((t) => document.getElementById(t.id));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.32;
      let idx = 0;
      sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) idx = i; });
      setActive(idx);
      const b = body.current?.getBoundingClientRect();
      if (b) {
        const p = Math.min(1, Math.max(0, (line - b.top) / Math.max(1, b.height - line)));
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        if (rail.current) rail.current.style.transform = `scaleY(${p})`;
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [toc]);

  // Keep the current section in view in the phone strip.
  useEffect(() => {
    const s = strip.current;
    const item = s?.children[active] as HTMLElement | undefined;
    if (!s || !item || s.scrollWidth <= s.clientWidth) return;
    // In RTL the strip scrolls towards negative offsets from its right edge.
    const rtl = getComputedStyle(s).direction === 'rtl';
    const left = rtl
      ? Math.min(0, -(s.clientWidth - item.offsetLeft - item.offsetWidth - 20))
      : Math.max(0, item.offsetLeft - 20);
    s.scrollTo({ left, behavior: reduced() ? 'auto' : 'smooth' });
  }, [active]);

  return (
    <div ref={root}>
      <header data-tp="hero" className="relative overflow-hidden pt-(--nav-h)">
        <div className="page relative pb-[clamp(2.75rem,1.5rem+4.5vw,6.5rem)] pt-[clamp(2.5rem,1.25rem+5.5vw,7.5rem)]">
          {/* The M, embossed in stone and hung from the right margin: the only
              ornament the written pages carry. Phones keep the logotype in the
              header and leave the title the whole width. */}
          <div
            data-tp="mark"
            aria-hidden
            className="pointer-events-none absolute end-0 top-[clamp(2.5rem,1.25rem+5.5vw,7.5rem)] hidden w-[clamp(9rem,1rem+17vw,20rem)] text-stone-brand md:block"
          >
            <div data-reveal-img>
              <Wordmark symbol className="h-auto w-full" />
            </div>
          </div>

          <p className="label flex flex-wrap items-baseline gap-x-4 gap-y-1" data-reveal>
            {eyebrow}
            {toc?.length ? <span className="label-sm nums text-mute">{t('{n} sections', { n: pad(toc.length) })}</span> : null}
          </p>
          <h1 className={cn('display-xl relative mt-[clamp(1.5rem,0.75rem+3vw,4rem)] max-w-[12ch]', LINE_ROOM)}>
            <Lines text={title} />
          </h1>
          {standfirst ? (
            <p
              className="relative mt-[clamp(1.75rem,1rem+3vw,4rem)] max-w-[34ch] text-[clamp(1.125rem,0.95rem+0.7vw,1.625rem)] font-medium leading-[1.3] tracking-[-0.02em] text-ink-3"
              data-reveal
            >
              {standfirst}
            </p>
          ) : null}
        </div>
      </header>

      {facts?.length ? (
        <div className="page pb-[clamp(1rem,0.5rem+2vw,2.5rem)]">
          <dl className="grid grid-cols-2 gap-x-(--gutter) lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col border-t border-ink pb-8 pt-4" data-reveal>
                <dt className="label-sm text-mute">{f.label}</dt>
                <dd className="mt-[clamp(1rem,0.5rem+1.5vw,2rem)]">
                  {/* Figures only, so kept left-to-right: a range reads 5–7 in Arabic too. */}
                  <span dir="ltr" className="nums text-[clamp(2.5rem,1.4rem+3.6vw,5.25rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
                    {f.value}
                  </span>
                  {f.unit ? (
                    <span className="ms-1.5 text-[clamp(0.9375rem,0.8rem+0.5vw,1.25rem)] font-semibold tracking-[-0.02em]">
                      {f.unit}
                    </span>
                  ) : null}
                  {f.note ? <span className="mt-3 block max-w-[26ch] text-sm leading-snug text-mute">{f.note}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="relative">
        {toc?.length ? (
          <nav
            aria-label={t('On this page')}
            className="sticky top-(--header-offset) z-30 border-y border-line bg-bone/92 backdrop-blur-md transition-[top] duration-[560ms] ease-(--ease-expo) lg:hidden"
          >
            <ol ref={strip} className="no-bar relative flex gap-7 overflow-x-auto px-(--gutter)">
              {toc.map((t, i) => (
                <li key={t.id} className="shrink-0">
                  <a
                    href={`#${t.id}`}
                    aria-current={active === i ? 'location' : undefined}
                    className={cn(
                      'label-sm flex min-h-12 items-center gap-2 whitespace-nowrap transition-colors duration-300',
                      active === i ? 'text-ink' : 'text-mute',
                    )}
                  >
                    <span className="nums">{pad(i + 1)}</span>
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
            <span ref={bar} aria-hidden className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-ink rtl:origin-right" />
          </nav>
        ) : null}

        <div
          ref={body}
          className={cn(
            'page grid-page gap-y-12 pb-(--section) pt-[clamp(2.75rem,1.5rem+4vw,5.5rem)]',
            !!toc?.length && 'lg:border-t lg:border-line',
          )}
        >
          {toc?.length || aside ? (
            <div className={cn('col-span-4 md:col-span-6 lg:col-span-3', !aside && 'max-lg:hidden', asideLast && 'max-lg:order-last')}>
              <div className="transition-[top] duration-[560ms] ease-(--ease-expo) lg:sticky lg:top-[calc(var(--header-offset)+2.5rem)]">
                {toc?.length ? (
                  <nav aria-label={t('On this page')} className="relative hidden ps-5 lg:block">
                    <span aria-hidden className="absolute inset-y-0 start-0 w-px bg-line" />
                    <span ref={rail} aria-hidden className="absolute inset-y-0 start-0 w-px origin-top scale-y-0 bg-ink" />
                    <p className="label-sm text-mute">{t('On this page')}</p>
                    <ol className="mt-5 space-y-0.5">
                      {toc.map((t, i) => (
                        <li key={t.id}>
                          <a
                            href={`#${t.id}`}
                            aria-current={active === i ? 'location' : undefined}
                            className={cn(
                              'group flex min-h-9 items-baseline gap-3 py-1.5 text-sm transition-colors duration-300',
                              active === i ? 'text-ink' : 'text-mute hover:text-ink',
                            )}
                          >
                            <span className="label-sm nums w-5 shrink-0">{pad(i + 1)}</span>
                            <span className={cn('transition-transform duration-500 ease-(--ease-out)', active === i && 'translate-x-1.5 font-medium rtl:-translate-x-1.5')}>
                              {t.label}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                ) : null}
                {aside ? <div className={cn(!!toc?.length && 'lg:mt-14')}>{aside}</div> : null}
              </div>
            </div>
          ) : null}

          <div className="col-span-4 [counter-reset:tp] md:col-span-6 lg:col-span-8 lg:col-start-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One numbered section of a written page. The number is a CSS counter, so the
 * order on the page is the only source of truth. `plain` drops the prose
 * styling for tables, lists and accordions that bring their own.
 *
 * Plain content closes with its own rule (the last row, the last question).
 * That rule is also the divider before the next section, so the next section
 * drops its top rule and the plain one its bottom padding: otherwise two
 * hairlines seventy pixels apart frame an empty band that reads as a missing
 * row.
 */
export function Section({
  id, title, children, plain = false,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  plain?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      data-plain={plain || undefined}
      className={cn(
        'scroll-mt-[calc(var(--nav-h)+4.5rem)] border-t border-line py-[clamp(2.5rem,1.75rem+2.75vw,4.5rem)] [counter-increment:tp] first:border-t-0 first:pt-0 last:pb-0 lg:scroll-mt-[calc(var(--nav-h)+2.5rem)]',
        '[section[data-plain]+&]:border-t-0',
        plain && '[&:has(+section)]:pb-0',
      )}
    >
      <p aria-hidden className="label-sm nums text-mute before:content-[counter(tp,decimal-leading-zero)]" data-reveal />
      <h2 id={id ? `${id}-title` : undefined} className="display-md mt-3 max-w-[18ch]" data-reveal>
        {title}
      </h2>
      {plain ? <div className="mt-8" data-reveal>{children}</div> : <div className={PROSE} data-reveal>{children}</div>}
    </section>
  );
}

/* ─── Editorial devices ──────────────────────────────────────────────────────
   Small, single-purpose motion pieces for the pages built from this shell and
   for the manifesto. Each one renders its finished state on the server and
   only animates when motion is wanted.                                      */

/**
 * A line that keeps moving while the page does. Desktop only: on a phone the
 * words wrap, and a wrapped line sliding sideways just looks misplaced.
 */
export function Drift({
  children, from = 0, to = -10, start = 'top bottom', end = 'bottom top', className,
}: {
  children: React.ReactNode;
  from?: number;
  to?: number;
  start?: string;
  end?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const mm = gsap.matchMedia();
    // Mirrored in RTL, so the line drifts in from the side it is read from.
    const dir = getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    mm.add('(min-width: 768px)', () => {
      gsap.fromTo(el, { xPercent: from * dir }, {
        xPercent: to * dir, ease: 'none',
        scrollTrigger: { trigger: el, start, end, scrub: 0.8 },
      });
    });
    return () => mm.revert();
  }, [from, to, start, end]);
  return <span ref={ref} className={cn('block will-change-transform', className)}>{children}</span>;
}

/**
 * Crossed out, in front of the reader. The rule is a background on an inline
 * box, so on a phrase that wraps it draws one line after the other.
 */
export function Strike({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { backgroundSize: '0% 0.07em' }, {
        backgroundSize: '100% 0.07em', duration: 1.3, ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 78%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <span
      ref={ref}
      className={cn('bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_0.07em] bg-[position:0_56%] bg-no-repeat rtl:bg-[position:100%_56%]', className)}
    >
      {children}
    </span>
  );
}

const LOGO_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${LOGO.viewBox}'><path fill-rule='evenodd' d='${LOGO.d}'/></svg>`,
)}")`;

/**
 * The logotype as a window: the letters are cut out of the page and a
 * photograph moves behind them as the reader scrolls. Decorative — the page
 * title carries the words.
 */
export function LogoWindow({
  src, width, height, position = '50% 50%', className, priority = false,
}: {
  src: string;
  width: number;
  height: number;
  position?: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-lw="pan"]', { yPercent: -9 }, {
        yPercent: 9, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.fromTo('[data-lw="img"]', { scale: 1.28 }, { scale: 1, duration: 2.4, ease: 'expo.out' });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('relative aspect-[3866/1000] w-full overflow-hidden bg-graphite', className)}
      style={{
        maskImage: LOGO_MASK, WebkitMaskImage: LOGO_MASK,
        maskSize: '100% 100%', WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
      }}
    >
      <div data-lw="pan" className="absolute inset-x-0 -inset-y-[16%]">
        <Image
          data-lw="img"
          src={src}
          alt=""
          width={width}
          height={height}
          sizes="100vw"
          priority={priority}
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      </div>
    </div>
  );
}

/**
 * A picture that opens out to the full width of the screen as it arrives,
 * like a door being pushed. The finished state is the server markup.
 */
export function Unfold({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 768px)', narrow: '(max-width: 767px)' }, (c) => {
      const side = c.conditions?.wide ? 18 : 5;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 12%', scrub: 0.6 },
      });
      tl.fromTo(el, { clipPath: `inset(6% ${side}% 6% ${side}%)` }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0);
      tl.fromTo(el.querySelector('[data-unfold]'), { scale: 1.22 }, { scale: 1, ease: 'none' }, 0);
    });
    return () => mm.revert();
  }, []);
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <div data-unfold className="absolute inset-0 will-change-transform">{children}</div>
    </div>
  );
}
