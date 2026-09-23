'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { setupGsap } from '@/lib/gsap';

/** Where the window sits before it opens, as clip-path insets (top right bottom left, %). */
const WINDOW = {
  wide: [19, 39, 13, 39],
  narrow: [25, 17, 21, 17],
} as const;
const inset = ([t, r, b, l]: readonly number[]) => `inset(${t}% ${r}% ${b}% ${l}%)`;

/** The two poster words. Which edge they hang from is set by the script. */
const WORD = cn(
  'absolute block whitespace-nowrap font-semibold uppercase leading-[0.8] tracking-[-0.06em] text-ink',
  'group-data-[layout=narrow]/words:inset-x-0 group-data-[layout=narrow]/words:text-center group-data-[layout=narrow]/words:text-[length:min(25vw,26svh)]',
  'group-data-[layout=wide]/words:top-[53%] group-data-[layout=wide]/words:-translate-y-1/2 group-data-[layout=wide]/words:text-[clamp(4rem,12.4vw,13rem)]',
);

/**
 * The campaign, told in two beats. It arrives as a narrow window on the warm
 * white, set between the two words of its name. Scrolling pushes the window
 * open: the words are shoved off either edge at exactly the speed of the
 * frame, and the picture takes the whole room. Only then does the line arrive.
 *
 * The markup on the server is the opened state, so reduced motion (and no
 * script) simply gets the full-bleed campaign with its copy.
 */
export function CampaignFeature() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap, ScrollTrigger } = setupGsap();
    const q = gsap.utils.selector(el);
    const stage = q('[data-cf="stage"]')[0] as HTMLElement;
    const mm = gsap.matchMedia();

    mm.add(
      {
        // Side by side on a landscape screen; stacked on a phone or a portrait
        // tablet, where a side-by-side window would be a sliver.
        wide: '(min-width: 768px) and (orientation: landscape)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        if (!ctx.conditions?.motion) return;
        const wide = Boolean(ctx.conditions.wide);
        const words = q('[data-cf="words"]')[0] as HTMLElement;
        words.dataset.layout = wide ? 'wide' : 'narrow';
        const [t, r, b, l] = wide ? WINDOW.wide : WINDOW.narrow;
        const ease = 'power2.inOut';
        gsap.set(words, { opacity: 1 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=175%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(q('[data-cf="clip"]'), { clipPath: inset([t, r, b, l]) }, { clipPath: inset([0, 0, 0, 0]), ease, duration: 1 }, 0)
          .fromTo(q('[data-cf="img"]'), { scale: 1.24, xPercent: wide ? -14 : 0, yPercent: wide ? 0 : 18 }, { scale: 1, xPercent: 0, yPercent: 0, ease, duration: 1 }, 0);

        // The words ride the edges of the window, so they look pushed by it.
        if (wide) {
          tl.fromTo(q('[data-cf="w1"]'), { x: 0 }, { x: () => -stage.offsetWidth * (l / 100), ease, duration: 1 }, 0)
            .fromTo(q('[data-cf="w2"]'), { x: 0 }, { x: () => stage.offsetWidth * (r / 100), ease, duration: 1 }, 0);
        } else {
          tl.fromTo(q('[data-cf="w1"]'), { y: 0 }, { y: () => -stage.offsetHeight * (t / 100), ease, duration: 1 }, 0)
            .fromTo(q('[data-cf="w2"]'), { y: 0 }, { y: () => stage.offsetHeight * (b / 100), ease, duration: 1 }, 0);
        }

        tl.fromTo(q('[data-cf="aside"]'), { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0)
          .fromTo(q('[data-cf="shade"]'), { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.7)
          .fromTo(q('[data-cf="line"]'), { yPercent: 112 }, { yPercent: 0, ease: 'power3.out', stagger: 0.09, duration: 0.5 }, 0.84)
          .fromTo(q('[data-cf="meta"]'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, ease: 'power2.out', stagger: 0.06, duration: 0.4 }, 1.02)
          .to({}, { duration: 0.4 });

        // Tabbing onto the links while the window is still shut jumps the
        // scroll to the opened frame, so keyboard focus never lands on copy
        // that is not there yet.
        const onFocus = () => {
          const st = tl.scrollTrigger;
          if (!st || tl.progress() > 0.85) return;
          window.scrollTo({ top: st.start + (st.end - st.start) * 0.9, behavior: 'auto' });
        };
        stage.addEventListener('focusin', onFocus);
        return () => {
          stage.removeEventListener('focusin', onFocus);
          delete words.dataset.layout;
        };
      },
    );

    // Two pins follow on this page. If the webfont settles after load, the
    // headlines above them change height, so measure every trigger again.
    let live = true;
    document.fonts?.ready.then(() => { if (live) ScrollTrigger.refresh(); }).catch(() => {});

    return () => {
      live = false;
      mm.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative bg-bone" aria-labelledby="campaign-title">
      <div data-cf="stage" className="relative h-svh min-h-[36rem] overflow-hidden">
        {/* The picture. Clipped to a window at first; the server renders it open. */}
        <div data-cf="clip" className="absolute inset-0 overflow-hidden bg-ink">
          <div data-cf="img" className="absolute inset-0 will-change-transform">
            <Image src="/img/campaign-rule-line-wide.webp" alt="A model in a pale cropped jacket and trousers against a brown plaster wall." fill
              sizes="100vw" className="hidden -scale-x-100 object-cover object-[30%_center] md:landscape:block" />
            <Image src="/img/campaign-rule-line.webp" alt="A model in a pale cropped jacket and trousers against a brown plaster wall." fill
              sizes="100vw" className="object-cover object-[26%_center] md:landscape:hidden" />
          </div>
          <div data-cf="shade" aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />
        </div>

        {/* The name of the campaign, either side of the window. Hidden once it is open. */}
        <div data-cf="words" aria-hidden className="group/words pointer-events-none absolute inset-0 opacity-0">
          <span data-cf="w1" className={cn(WORD, 'group-data-[layout=narrow]/words:bottom-[calc(75%+0.9rem)] group-data-[layout=wide]/words:right-[calc(61%+2.2vw)]')}>
            Rule
          </span>
          <span data-cf="w2" className={cn(WORD, 'group-data-[layout=narrow]/words:top-[calc(79%+0.9rem)] group-data-[layout=wide]/words:left-[calc(61%+2.2vw)]')}>
            Line
          </span>
        </div>

        {/* Small print on the white, only while the window is shut. */}
        <div data-cf="aside" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-5 opacity-0 md:bottom-7">
          <div className="page flex items-end justify-between">
            <span className="label-sm text-mute">Campaign</span>
            <span className="label-sm nums text-mute">Autumn Winter 2026</span>
          </div>
        </div>

        {/* The copy, over the opened picture. */}
        <div className="on-ink page relative flex h-full flex-col justify-end pb-[clamp(2rem,1rem+4vw,4.5rem)] pt-[calc(var(--nav-h)+2rem)] text-bone">
          <p data-cf="meta" className="label text-bone/80">Campaign — The Rule Line</p>
          <h2 id="campaign-title" className="display-xl mt-5 max-w-[13ch]">
            {['Quiet structure.', 'Expressive', 'movement.'].map((l) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]"><span data-cf="line" className="block">{l}</span></span>
            ))}
          </h2>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link data-cf="meta" href="/editorial/the-rule-line" className="btn btn-solid">
              View the campaign <Icon name="arrowR" className="h-3.5 w-3.5" />
            </Link>
            <Link data-cf="meta" href="/collections/foundation" className="link-rule label">Shop Foundation</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
