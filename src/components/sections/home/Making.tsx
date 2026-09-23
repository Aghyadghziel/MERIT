'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Icon } from '@/components/ui/Icon';
import { getStory } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { setupGsap, type ScrollTrigger as ST } from '@/lib/gsap';

type Stage = {
  title: string;
  img: string;
  alt: string;
  /** Picture ratio, width over height. */
  ratio: number;
  /** Picture height against the strip's standard height, for the rhythm. */
  scale: number;
  text: string;
};

/**
 * The six stages. Every line is taken from the house's own account of itself
 * (the About page, the Foundation note, and the atelier story), not written
 * for this strip, so the strip says nothing the rest of the site does not.
 */
const STAGES: Stage[] = [
  {
    title: 'Cloth',
    img: 'material-wool',
    alt: 'Grey-green wool cloth, close up',
    ratio: 4 / 5,
    scale: 0.9,
    text: 'Wool and linen woven in Biella. For Foundation the cloth is heavier than last season, and the colour has been pulled back to four.',
  },
  {
    title: 'The block',
    img: 'trouser-column-2',
    alt: 'A model on a stool in a white shirt and wide stone-coloured trousers',
    ratio: 4 / 5,
    scale: 0.78,
    text: 'Every shape is drawn against one garment, the Column trouser. A jacket ends where the trouser reads best; a coat is long enough to cover both.',
  },
  {
    title: 'Basting',
    img: 'atelier-basting',
    alt: 'A navy jacket on a tailor’s stand, held together with white basting thread',
    ratio: 4 / 5,
    scale: 1.12,
    text: 'Held together in long white stitches so it can be tried, pulled apart and corrected before it is sewn. The thread is meant to come out.',
  },
  {
    title: 'The chest',
    img: 'statement-detail',
    alt: 'Rows of hand stitching on grey wool cloth, close up',
    ratio: 1,
    scale: 0.74,
    text: 'Cloth, horsehair canvas and domette, joined with a pad stitch worked by hand, so the three move on their own and still return to one shape.',
  },
  {
    title: 'Pressing',
    img: 'material-fold',
    alt: 'Folds of black wool cloth on white',
    ratio: 4 / 5,
    scale: 0.88,
    text: 'The basting comes out, the seams are pressed open over a ham, and the jacket stops looking like a set of instructions.',
  },
  {
    title: 'The count',
    img: 'jacket-rule-m-1',
    alt: 'Jackets in white, pale blue and navy hanging on a rail',
    ratio: 4 / 5,
    scale: 1,
    text: 'Cut in small counts. When a count is finished it is finished; the pattern stays, and is re-issued rather than replaced.',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * How it is made, in the graphite room. On arrival the room holds still and
 * the reader's scroll turns sideways: six stages of a jacket pass from right
 * to left, each picture drifting inside its frame, a hairline along the foot
 * counting them off. Nothing here is a statistic; each line is the process as
 * the house describes it elsewhere.
 *
 * Without motion (reduced motion, or before the script runs) the same strip is
 * an ordinary sideways-scrolling row with snap points and the same controls,
 * so the section works as a plain carousel rather than depending on the pin.
 */
export function Making() {
  const root = useRef<HTMLElement>(null);
  const story = getStory('on-making-the-basted-jacket');

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap } = setupGsap();
    const q = gsap.utils.selector(el);
    const stage = q('[data-mk="stage"]')[0] as HTMLElement;
    const viewport = q('[data-mk="viewport"]')[0] as HTMLElement;
    const track = q('[data-mk="track"]')[0] as HTMLElement;
    const bar = q('[data-mk="bar"]')[0] as HTMLElement;
    const count = q('[data-mk="count"]')[0] as HTMLElement;
    const panels = q('[data-mk="panel"]') as HTMLElement[];
    const stages = panels.filter((p) => p.dataset.stage);
    const [prevBtn, nextBtn] = q('[data-mk="nav"]') as HTMLButtonElement[];

    // Shared by both modes: where the strip is, and what that means.
    let pinned: ST | null = null;
    let tween: gsap.core.Tween | null = null;
    const dist = () => Math.max(0, track.offsetWidth - viewport.clientWidth);
    const offset = () => (tween ? -Number(gsap.getProperty(track, 'x')) : viewport.scrollLeft);
    const centred = (p: HTMLElement) =>
      gsap.utils.clamp(0, dist(), p.offsetLeft - (viewport.clientWidth - p.offsetWidth) / 2);

    const update = () => {
      const o = offset();
      const d = dist();
      bar.style.transform = `scaleX(${d ? o / d : 1})`;
      const mid = o + viewport.clientWidth / 2;
      let best = 0;
      stages.forEach((p, i) => {
        const a = Math.abs(p.offsetLeft + p.offsetWidth / 2 - mid);
        const b = Math.abs(stages[best].offsetLeft + stages[best].offsetWidth / 2 - mid);
        if (a < b) best = i;
      });
      count.textContent = pad(best + 1);
      prevBtn.disabled = o <= 2;
      nextBtn.disabled = o >= d - 2;
    };

    const goTo = (target: number) => {
      if (pinned && tween) {
        const d = dist() || 1;
        window.scrollTo({ top: pinned.start + (target / d) * (pinned.end - pinned.start), behavior: 'smooth' });
      } else {
        viewport.scrollTo({ left: target, behavior: 'smooth' });
      }
    };
    const step = (dir: 1 | -1) => {
      const o = offset();
      const targets = panels.map(centred);
      const next = dir === 1 ? targets.find((t) => t > o + 4) : [...targets].reverse().find((t) => t < o - 4);
      goTo(next ?? (dir === 1 ? dist() : 0));
    };
    const onPrev = () => step(-1);
    const onNext = () => step(1);
    prevBtn.addEventListener('click', onPrev);
    nextBtn.addEventListener('click', onNext);
    viewport.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      viewport.scrollLeft = 0;
      viewport.removeAttribute('tabindex');
      gsap.set(viewport, { overflow: 'hidden', scrollSnapType: 'none' });

      tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        onUpdate: update,
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      pinned = tween.scrollTrigger ?? null;

      // Each picture drifts inside its frame as it crosses the room.
      q('[data-mk="drift"]').forEach((img) => {
        gsap.fromTo(img, { xPercent: -5 }, {
          xPercent: 5, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, containerAnimation: tween!, start: 'left right', end: 'right left', scrub: true },
        });
      });

      // Tabbing into a panel scrolls the page to it, and undoes the sideways
      // scroll the browser would otherwise apply to the clipped strip.
      const onFocus = (e: FocusEvent) => {
        viewport.scrollLeft = 0;
        const panel = (e.target as HTMLElement).closest<HTMLElement>('[data-mk="panel"]');
        if (panel) goTo(centred(panel));
      };
      track.addEventListener('focusin', onFocus);
      update();

      return () => {
        track.removeEventListener('focusin', onFocus);
        viewport.setAttribute('tabindex', '0');
        tween = null;
        pinned = null;
        requestAnimationFrame(update);
      };
    });

    return () => {
      mm.revert();
      prevBtn.removeEventListener('click', onPrev);
      nextBtn.removeEventListener('click', onNext);
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section ref={root} className="on-ink bg-graphite text-bone" aria-labelledby="making-title">
      <div data-mk="stage" className="relative flex h-svh min-h-[36rem] flex-col pb-4 pt-[calc(var(--nav-h)+0.75rem)] md:pb-6 md:pt-16">
        <div
          data-mk="viewport"
          tabIndex={0}
          aria-label="The making, six stages. Scroll sideways."
          className="no-bar min-h-0 flex-1 snap-x snap-mandatory scroll-px-(--gutter) overflow-x-auto overflow-y-hidden overscroll-x-contain focus-visible:outline-offset-[-4px]"
        >
          <div
            data-mk="track"
            className="relative flex h-full w-max items-center gap-[7vw] px-(--gutter) md:gap-[4.5vw] md:[--H:min(calc((100svh_-_25rem)_*_0.88),36rem)]"
          >
            {/* Intro */}
            <div data-mk="panel" className="flex w-[86vw] shrink-0 snap-start flex-col justify-center md:w-[min(31vw,30rem)]">
              <p className="label text-mute-ink">The making — {pad(STAGES.length)} stages</p>
              <h2 id="making-title" className="mt-5 text-[clamp(3.5rem,1rem+6.4vw,8rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
                How a jacket is made.
              </h2>
              <p className="mt-6 max-w-[34ch] text-mute-ink md:mt-8 md:text-[1.0625rem] md:leading-relaxed">
                The Rule jacket, from the cloth to the rail, in the order it happens.
              </p>
              <p className="label-sm mt-8 inline-flex items-center gap-3 text-bone/80 md:mt-12" aria-hidden>
                <span className="motion-reduce:hidden">Keep scrolling</span>
                <span className="motion-safe:hidden">Swipe, or use the arrows</span>
                <Icon name="arrowR" className="h-3.5 w-3.5" />
              </p>
            </div>

            {STAGES.map((s, i) => (
              <article
                key={s.title}
                data-mk="panel"
                data-stage={i + 1}
                aria-labelledby={`making-stage-${i}`}
                style={{ '--w': s.ratio * s.scale, '--r': s.ratio } as CSSProperties}
                className={cn(
                  'w-[82vw] shrink-0 snap-start md:w-[calc(var(--H)*var(--w))]',
                  i % 2 === 0 ? 'md:mb-[6svh]' : 'md:mt-[6svh]',
                )}
              >
                <div className="relative aspect-(--r) overflow-hidden bg-ink-2">
                  <div data-mk="drift" className="absolute inset-y-0 -inset-x-[7%]">
                    <Image src={`/img/${s.img}.webp`} alt={s.alt} fill className="object-cover"
                      sizes="(min-width:768px) 32vw, 82vw" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2 md:mt-5">
                  <span className="label-sm nums pt-[0.3rem] text-mute-ink">{pad(i + 1)}</span>
                  <div>
                    <h3 id={`making-stage-${i}`} className="display-sm font-semibold">{s.title}</h3>
                    <p className="mt-2 text-[0.8125rem] leading-[1.55] text-mute-ink md:text-sm">{s.text}</p>
                  </div>
                </div>
              </article>
            ))}

            {/* Outro: where to read the whole of it, and the jacket itself. */}
            <div data-mk="panel" className="flex w-[80vw] shrink-0 snap-start flex-col justify-center md:w-[min(34vw,32rem)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
                <Image src="/img/manifesto-rail.webp" alt="Empty white hangers on a rail" fill className="object-cover" sizes="(min-width:768px) 34vw, 80vw" />
              </div>
              <p className="label-sm mt-6 text-mute-ink">
                {story?.kicker ?? 'Atelier'} <span className="nums">— {story?.readingTime ?? 6} min read</span>
              </p>
              <h3 className="display-md mt-3">{story?.title ?? 'On Making: The Basted Jacket'}</h3>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link href="/editorial/on-making-the-basted-jacket" className="btn btn-solid">
                  Read the story <Icon name="arrowR" className="h-3.5 w-3.5" />
                </Link>
                <Link href="/products/rule-two-button-jacket" className="link-rule label">Shop the Rule jacket</Link>
              </div>
            </div>
          </div>
        </div>

        {/* The foot of the room: which stage, how far along, and a way to step. */}
        <div className="page flex items-center gap-4 pt-4 md:gap-6 md:pt-6">
          <span className="label-sm nums w-[4.5rem] shrink-0 text-bone" aria-hidden>
            <span data-mk="count">01</span> <span className="text-mute-ink">/ {pad(STAGES.length)}</span>
          </span>
          <span className="relative h-px flex-1 bg-line-ink-2" aria-hidden>
            <span data-mk="bar" className="absolute inset-0 origin-left bg-bone" style={{ transform: 'scaleX(0)' }} />
          </span>
          <span className="flex shrink-0 items-center gap-5 pr-2">
            <button type="button" data-mk="nav" aria-label="Previous stage" className="icon-btn disabled:opacity-30">
              <Icon name="arrowL" className="h-4 w-4" />
            </button>
            <button type="button" data-mk="nav" aria-label="Next stage" className="icon-btn disabled:opacity-30">
              <Icon name="arrowR" className="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
