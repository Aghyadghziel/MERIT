'use client';

import { useLayoutEffect, useRef } from 'react';
import { Wordmark } from '@/components/ui/Wordmark';
import { useT } from '@/i18n/client';
import { reduced, setupGsap } from '@/lib/gsap';

/**
 * Only what the site says elsewhere: the patterns are drawn in Riyadh (the
 * house works from blocks of its own); the cloth is cut and sewn by the makers.
 */
const WORDS = ['Foundation', 'Autumn Winter 2026', 'Drawn in Riyadh', 'Made in small counts', 'Re-issued, not replaced'];

/**
 * The black band between the fitting room and the rail. It has no motor of its
 * own: it travels only when the page does, in the direction the page goes,
 * and glides to a stop when the reader stops. So it is never moving content
 * the reader did not start, and it reads as part of the scroll rather than an
 * animation laid on top of it. Screen readers get the line once.
 */
export function Marquee() {
  const t = useT();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = track.current;
    const section = root.current;
    if (!el || !section || reduced()) return;
    const { gsap } = setupGsap();

    let half = el.scrollWidth / 2;
    const size = new ResizeObserver(() => { half = el.scrollWidth / 2; });
    size.observe(el);

    let visible = false;
    const seen = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '120px 0px' });
    seen.observe(section);

    const RATE = 0.85;
    let target = window.scrollY * RATE;
    let current = target;
    const place = gsap.quickSetter(el, 'x', 'px');
    // In Arabic the band hangs from the right edge and reads leftward, so it
    // travels the other way: new words arrive from the end of the line.
    const dir = getComputedStyle(el).direction === 'rtl' ? 1 : -1;

    const tick = () => {
      target = window.scrollY * RATE;
      if (!visible) { current = target; return; }
      current += (target - current) * 0.085;
      if (Math.abs(target - current) < 0.05) current = target;
      place(dir * (((current % half) + half) % half));
    };
    gsap.ticker.add(tick);
    tick();

    return () => {
      gsap.ticker.remove(tick);
      size.disconnect();
      seen.disconnect();
      gsap.set(el, { clearProps: 'transform' });
    };
  }, []);

  const run = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-[clamp(1.5rem,3vw,3.25rem)] pe-[clamp(1.5rem,3vw,3.25rem)]" aria-hidden={hidden || undefined}>
      {WORDS.map((w) => (
        <span key={w} className="flex items-center gap-[clamp(1.5rem,3vw,3.25rem)]">
          <span className="whitespace-nowrap text-[clamp(2.25rem,1rem+4.4vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]">{t(w)}</span>
          <Wordmark symbol className="h-[clamp(1.25rem,0.8rem+1.9vw,3rem)] w-auto shrink-0 text-stone" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} className="on-ink overflow-hidden bg-ink py-[clamp(1.4rem,1rem+1.6vw,2.5rem)] text-bone">
      {/* The band is decoration; its line is read once, as plain text, with no landmark around it. */}
      <p className="sr-only">{t('Foundation, Autumn Winter 2026. Drawn in Riyadh, made in small counts, re-issued, not replaced.')}</p>
      <div ref={track} className="flex w-max will-change-transform" aria-hidden>
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
