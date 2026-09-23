'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useLayoutEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { BRAND } from '@/lib/brand';
import { reduced, setupGsap } from '@/lib/gsap';

type Token = { word: string } | { img: string; alt: string };

/**
 * The house sentence, with three pictures set into it like words. Each one
 * sits where the sentence names it: the detail after "things", the room after
 * "Riyadh", the stack after "counts".
 */
const SENTENCE: Token[] = [
  ...'A small number of things,'.split(' ').map((word) => ({ word })),
  { img: 'coat-atrium-2', alt: 'The tied belt of a grey wool coat, close up' },
  ...'made for a long time. Cut on our own blocks in Riyadh,'.split(' ').map((word) => ({ word })),
  { img: 'runway-01', alt: 'A model walking a dark runway in a pale draped look' },
  ...'made in counts we can count,'.split(' ').map((word) => ({ word })),
  { img: 'knit-baseline-1', alt: 'Folded knitwear stacked in grey, ash and camel' },
  ...'and re-issued rather than replaced.'.split(' ').map((word) => ({ word })),
];

/**
 * The house in one sentence, on the warm white, set as large as the page will
 * take it. The words are stone until the reader reaches them and turn to ink
 * in reading order; the pictures open at the moment the sentence arrives at
 * them. Reduced motion gets the sentence already read.
 */
export function BrandStatement() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    // The two tokens the sentence moves between: stone before it is read,
    // ink once it is. Read from the palette, so they follow it.
    const css = getComputedStyle(document.documentElement);
    const stone = css.getPropertyValue('--color-stone').trim() || '#a9a59d';
    const ink = css.getPropertyValue('--color-ink').trim() || '#000000';
    const ctx = gsap.context(() => {
      // Finished while the sentence sits in the middle of the screen, where
      // it is naturally read, not once it has been pushed up to the top.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '[data-bs="text"]', start: 'top 88%', end: 'center 62%', scrub: 0.4 },
      });
      el.querySelectorAll<HTMLElement>('[data-bs="token"]').forEach((t, i) => {
        const at = i * 0.1;
        if (t.dataset.kind === 'img') {
          // Each picture starts as an open sliver, not a closed stone block,
          // so it reads as a picture about to open rather than a gap.
          const pic = t.querySelector('[data-bs="pic"]');
          const img = pic?.firstElementChild ?? null;
          tl.fromTo(pic, { clipPath: 'inset(0% 36% 0% 36%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.out' }, at)
            .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 0.7, ease: 'power2.out' }, at);
        } else {
          tl.fromTo(t, { color: stone }, { color: ink, duration: 0.25 }, at);
        }
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="section-y bg-bone" aria-labelledby="statement-title">
      <div className="page">
        <div className="rule-t flex items-baseline justify-between gap-6 pt-4" data-reveal>
          <h2 id="statement-title" className="label">The house</h2>
          <p className="label nums text-mute">{BRAND.city}, since {BRAND.founded}</p>
        </div>

        <p data-bs="text" className="mt-[clamp(2.5rem,1.5rem+4vw,6rem)] text-[clamp(2.15rem,0.85rem+4.6vw,6.6rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">
          {SENTENCE.map((t, i) => (
            <Fragment key={i}>
              {'word' in t ? (
                <span data-bs="token" className="inline">{t.word}</span>
              ) : (
                <span data-bs="token" data-kind="img" aria-hidden title={t.alt}
                  className="relative mx-[0.04em] inline-block h-[0.74em] w-[1.5em] overflow-hidden bg-bone-2 align-[-0.04em]">
                  <span data-bs="pic" className="absolute inset-0 block">
                    <Image src={`/img/${t.img}.webp`} alt="" fill sizes="(min-width:1024px) 9rem, 5rem" className="object-cover" />
                  </span>
                </span>
              )}
              {i < SENTENCE.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </p>

        <div className="mt-[clamp(2.5rem,1.5rem+3vw,4.5rem)] flex flex-wrap items-center gap-x-10 gap-y-5" data-reveal>
          <Link href="/about" className="btn">
            About the house <Icon name="arrowR" className="h-3.5 w-3.5" />
          </Link>
          <p className="max-w-[40ch] text-sm text-mute">
            Two collections a year around a permanent range, Index, cut from the same patterns every
            year and changed only when something is wrong with it.
          </p>
        </div>
      </div>
    </section>
  );
}
