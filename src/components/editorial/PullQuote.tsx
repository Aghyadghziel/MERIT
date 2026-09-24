'use client';

import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';
import { useLocale } from '@/i18n/client';

/**
 * A line lifted from the text and set large. Each word lights as the reader
 * reaches it, the same way the house statement reads on the home page. Under
 * reduced motion the words are simply there.
 */
export function PullQuote({ text, source, className }: { text: string; source?: string; className?: string }) {
  // A short line is set as a poster; a whole sentence a size down, so it
  // still reads as a quote rather than a wall.
  const short = text.length <= 52;
  // Arabic sets its quotes in guillemets, wider than a curly quote, so the
  // opening mark sits in the line rather than hanging into the margin.
  const ar = useLocale() === 'ar';
  const [open, close] = ar ? ['«', '»'] : ['“', '”'];
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-word]', { opacity: 0.16 }, {
        opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [text]);

  const words = text.split(' ');
  return (
    <figure ref={ref} className={className}>
      <blockquote>
        <p
          className={cn(
            'font-semibold [text-wrap:balance]',
            // The measure is set in em on the quote itself, so it scales with it.
            short
              ? 'max-w-[8.5em] text-[clamp(2.5rem,0.9rem+6vw,7.5rem)] leading-[0.9] tracking-[-0.055em]'
              : 'max-w-[19em] text-[clamp(1.75rem,0.95rem+2.9vw,4rem)] leading-[1] tracking-[-0.045em]',
          )}
        >
          <span aria-hidden className={ar ? undefined : '-ms-[0.42em] inline-block w-[0.42em] text-end'}>{open}</span>
          {words.map((w, i) => (
            <span key={i} data-word>
              {w}
              {i < words.length - 1 ? ' ' : <span aria-hidden>{close}</span>}
            </span>
          ))}
        </p>
      </blockquote>
      {source ? <figcaption className="label mt-8 opacity-70">{source}</figcaption> : null}
    </figure>
  );
}
