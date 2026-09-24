'use client';

import Link from '@/i18n/link';
import { useLayoutEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useLocale, useT } from '@/i18n/client';
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
 * The Arabic name of the campaign, خطّ المسطرة, in Jomhuria. Arabic words are
 * wider than the four-letter Latin pair, so they are set a size down to keep
 * the same margin to the window, and at a line height that clears the dots.
 */
const WORD_AR = cn(
  'group-data-[layout=narrow]/words:text-[length:min(15vw,17svh)]! group-data-[layout=wide]/words:text-[clamp(2.75rem,5.9vw,6.5rem)]!',
  'ar-poster !leading-[1.1]',
);

/**
 * The word shown in one layout only. Wide, the pair sits either side of the
 * window and reads right to left, so خطّ is the right-hand word (w2); stacked,
 * it reads top to bottom, so خطّ is the upper one (w1).
 */
function Only({ layout, children }: { layout: 'wide' | 'narrow'; children: React.ReactNode }) {
  return (
    <span className={layout === 'wide' ? 'hidden group-data-[layout=wide]/words:inline' : 'group-data-[layout=wide]/words:hidden'}>
      {children}
    </span>
  );
}

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
  const t = useT();
  const ar = useLocale() === 'ar';
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
            end: '+=260%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(q('[data-cf="clip"]'), { clipPath: inset([t, r, b, l]) }, { clipPath: inset([0, 0, 0, 0]), ease, duration: 1 }, 0)
          .fromTo(q('[data-cf="img"]'), { scale: 1.1 }, { scale: 1, ease, duration: 1 }, 0);

        // The film follows the scroll across the whole pin.
        const film = q(`[data-cf-film="${wide ? 'wide' : 'tall'}"]`)[0] as HTMLVideoElement | undefined;
        if (film) {
          film.poster = `/video/studio-${wide ? 'wide' : 'tall'}-first.webp`;
          // iOS will not decode a video that has never played: start and stop it once.
          film.play().then(() => { film.pause(); film.currentTime = 0; }).catch(() => {});
          const state = { t: 0 };
          let queued = false;
          const seek = () => {
            queued = false;
            if (film.readyState >= 1 && film.duration) film.currentTime = state.t * (film.duration - 0.04);
          };
          tl.to(state, { t: 1, ease: 'none', duration: 1.35, onUpdate: () => { if (!queued) { queued = true; requestAnimationFrame(seek); } } }, 0);
          film.addEventListener('loadedmetadata', seek);
        }

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
          .to({}, { duration: 0.1 });

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
          if (film) film.poster = `/video/studio-${wide ? 'wide' : 'tall'}-last.webp`;
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
      <div data-cf="stage" className="relative h-svh min-h-[20rem] overflow-hidden">
        {/* The picture. Clipped to a window at first; the server renders it open. */}
        <div data-cf="clip" className="absolute inset-0 overflow-hidden bg-ink">
          {/* The film: a model in the black leather jacket on a wooden box in a
              dark studio. It plays with the scroll, forward and back: she looks
              away, pulls the jacket onto her shoulder and turns back as the
              camera closes in. Encoded all-intra so any frame can be shown
              instantly. The server paints its last frame (the opened state). */}
          <div data-cf="img" role="img" aria-label={t('A model in the black leather jacket, seated on a wooden box in a dark studio, pulls the jacket up onto her shoulder.')}
            className="absolute inset-0 will-change-transform">
            <video data-cf-film="wide" src="/video/studio-wide.mp4" poster="/video/studio-wide-last.webp" muted playsInline preload="auto"
              disablePictureInPicture aria-hidden tabIndex={-1} className="hidden h-full w-full object-cover md:landscape:block" />
            <video data-cf-film="tall" src="/video/studio-tall.mp4" poster="/video/studio-tall-last.webp" muted playsInline preload="auto"
              disablePictureInPicture aria-hidden tabIndex={-1} className="h-full w-full object-cover md:landscape:hidden" />
          </div>
          <div data-cf="shade" aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />
        </div>

        {/* The name of the campaign, either side of the window. Hidden once it is open. */}
        <div data-cf="words" aria-hidden dir="ltr" className="group/words pointer-events-none absolute inset-0 opacity-0">
          <span data-cf="w1" className={cn(WORD, ar && WORD_AR, 'group-data-[layout=narrow]/words:bottom-[calc(75%+0.9rem)] group-data-[layout=wide]/words:right-[calc(61%+2.2vw)]')}>
            {ar ? <><Only layout="narrow">خطّ</Only><Only layout="wide">المسطرة</Only></> : 'Rule'}
          </span>
          <span data-cf="w2" className={cn(WORD, ar && WORD_AR, 'group-data-[layout=narrow]/words:top-[calc(79%+0.9rem)] group-data-[layout=wide]/words:left-[calc(61%+2.2vw)]')}>
            {ar ? <><Only layout="narrow">المسطرة</Only><Only layout="wide">خطّ</Only></> : 'Line'}
          </span>
        </div>

        {/* Small print on the white, only while the window is shut. */}
        <div data-cf="aside" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-5 opacity-0 md:bottom-7">
          <div className="page flex items-end justify-between">
            <span className="label-sm text-mute">{t('Campaign')}</span>
            <span className="label-sm nums text-mute">{t('Autumn Winter 2026')}</span>
          </div>
        </div>

        {/* The copy, over the opened picture. It is set in four short lines and
            capped by the screen's height as well as its width, so on any
            landscape screen it stays in the empty wall to the left of the
            model, clear of her face, and on a short one it stays on screen. */}
        <div className="on-ink page relative flex h-full flex-col justify-end pb-[min(clamp(2rem,1rem+4vw,4.5rem),7svh)] pt-[calc(var(--nav-h)+1rem)] text-bone">
          <p data-cf="meta" className="label text-bone/80">{t('Campaign — The Rule Line')}</p>
          <h2 id="campaign-title" className="display-xl mt-[min(1.25rem,2.5svh)]" style={{ fontSize: 'min(clamp(3rem, 0.8rem + 9vw, 10rem), 14.5svh, 19svh - 1.5rem)' }}>
            {/* Two sentences, set a word to a line. */}
            {[t('Quiet structure.'), t('Expressive movement.')].flatMap((s) => s.split(' ')).map((l, i) => (
              <span key={`${i}-${l}`} className="block overflow-hidden pb-[0.06em]"><span data-cf="line" className="block">{l} </span></span>
            ))}
          </h2>
          <div className="mt-[clamp(1rem,4svh,2.25rem)] flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link data-cf="meta" href="/editorial/the-rule-line" className="btn btn-solid">
              {t('View the campaign')} <Icon name="arrowR" className="h-3.5 w-3.5" />
            </Link>
            <Link data-cf="meta" href="/collections/foundation" className="link-rule label">{t('Shop Foundation')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
