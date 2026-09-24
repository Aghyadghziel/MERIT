import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/i18n/link';
import { ArtImage } from '@/components/editorial/ArtImage';
import { alt, isWide, pad, pic, seasonOf } from '@/components/editorial/data';
import { Poster } from '@/components/editorial/Poster';
import { Stage } from '@/components/editorial/Stage';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { stories, type Story } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { localePath, type Locale } from '@/i18n/config';
import type { T } from '@/i18n/dictionary';
import { getLocale, getT } from '@/i18n/server';
import { count, localizeStory } from '@/i18n/stories';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT();
  return {
    title: t('Editorial'),
    description: t('Campaigns, runway presentations and notes from the MERIT atelier.'),
    alternates: { canonical: localePath('/editorial', locale), languages: { en: '/editorial', ar: '/ar/editorial' } },
  };
}

/**
 * Editorial, laid out as an issue: a masthead set edge to edge, the contents,
 * a cover story at full bleed, and the rest as spreads that never repeat the
 * same layout twice in a row.
 */
export default async function EditorialPage() {
  const locale = await getLocale();
  const t = await getT();
  const issue = stories.map((s) => localizeStory(s, locale));
  const [lead, ...rest] = issue;
  const kinds = [...new Set(stories.map((s) => t(s.kicker)))];

  return (
    <>
      {/* ─── Masthead ─────────────────────────────────────────────────── */}
      <header className="page pt-(--nav-h)">
        <div className="mt-8 flex items-baseline justify-between gap-6 border-b border-ink pb-3 md:mt-12">
          <p className="label nums whitespace-nowrap" data-reveal>{count(locale, stories.length, 'story', pad(stories.length))}</p>
          <p className="label text-end max-sm:hidden" data-reveal>{kinds.join(' · ')}</p>
        </div>
        <Poster as="h1" text={t('Editorial')} cap="36svh" className="mt-3 md:mt-5" />

        <div className="grid-page mt-5 gap-y-10 border-t border-ink pb-(--section-sm) pt-5 md:mt-7">
          <p
            className="col-span-4 md:col-span-3 lg:col-span-5 text-[clamp(1.5rem,1rem+1.9vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]"
            data-reveal
          >
            {t('Campaigns, runway and how things are made.')}
          </p>

          <nav aria-label={t('In this issue')} className="col-span-4 md:col-span-3 lg:col-span-6 lg:col-start-7">
            <p className="label-sm text-mute" data-reveal>{t('In this issue')}</p>
            <ol className="mt-3">
              {issue.map((s, i) => (
                <li key={s.slug} className="border-t border-line last:border-b" data-reveal>
                  <Link href={`/editorial/${s.slug}`} className="group flex min-h-12 items-center gap-4 py-2.5">
                    <span className="label-sm nums w-6 shrink-0 text-mute">{pad(i + 1)}</span>
                    <span className="flex-1 text-[0.9375rem] font-medium leading-snug transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] md:group-hover:translate-x-1.5 rtl:md:group-hover:-translate-x-1.5">
                      {s.title}
                    </span>
                    <span className="label-sm nums hidden shrink-0 text-mute sm:inline">{t(s.kicker)} · {count(locale, s.readingTime, 'min')}</span>
                    <Icon name="arrowR" className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      {/* ─── Cover story ──────────────────────────────────────────────── */}
      <Stage
        aria-labelledby="cover-story"
        className="group on-ink relative h-[94svh] min-h-[36rem] overflow-hidden bg-ink text-bone"
      >
        <div data-zoom="1.12" className="absolute inset-0">
          <div data-reveal-img className="h-full w-full">
            <div className="h-full w-full transition-transform duration-[1600ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]">
              <ArtImage
                wide={lead.images[0]}
                tall={lead.cover}
                alt={t(alt(lead.images[0]))}
                // Drawn at whichever of width or height the crop fills first.
                sizes={isWide(lead.images[0]) ? 'max(100vw, 168svh)' : 'max(100vw, 76svh)'}
                tallSizes={isWide(lead.cover) ? 'max(100vw, 168svh)' : 'max(100vw, 76svh)'}
              />
            </div>
          </div>
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/35" />

        <div className="page relative flex h-full flex-col justify-between pb-(--gutter) pt-8 md:pt-10">
          <div className="flex items-baseline justify-between gap-6 border-t border-bone/35 pt-4">
            <p className="label">{t('Cover story')}</p>
            <p className="label nums text-bone/70">01 / {pad(stories.length)}</p>
          </div>

          <div>
            <p className="label text-bone/80" data-reveal>
              {t(lead.kicker)} · <span className="nums">{seasonOf(lead, t)}</span> · <span className="nums">{count(locale, lead.readingTime, 'min')}</span>
            </p>
            <h2 id="cover-story" className="display-xl mt-4 max-w-[12ch]">
              <Link href={`/editorial/${lead.slug}`} className="after:absolute after:inset-0 after:content-['']">
                <Lines text={lead.title} />
              </Link>
            </h2>
            <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
              <p className="body-lg max-w-md text-bone/80" data-reveal>{lead.standfirst}</p>
              <span aria-hidden className="btn btn-solid shrink-0 self-start md:self-auto" data-reveal>
                {t('Read the story')}
                <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Stage>

      {/* ─── The rest of the issue ────────────────────────────────────── */}
      <div className="section-y">
        {rest.map((s, k) => (
          <Spread key={s.slug} story={s} n={k + 2} variant={k % 3} first={k === 0} t={t} locale={locale} />
        ))}
      </div>

      <div className="page pb-(--section)">
        <Link href="/collections" className="group flex flex-col gap-3 border-y border-ink py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-8">
          <span className="label text-mute">{t('From the stories to the clothes')}</span>
          <span className="inline-flex items-center justify-between gap-3 whitespace-nowrap text-[clamp(1.5rem,0.9rem+1.4vw,2.25rem)] font-semibold tracking-[-0.035em]">
            {t('The collections')}
            <Icon name="arrowR" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
          </span>
        </Link>
      </div>
    </>
  );
}

/**
 * One story as a spread. Three layouts rotate so no two neighbours match and
 * the picture changes sides every time: a tall picture on the left with the
 * text low beside it, a landscape on the right with the text leading, and a
 * narrower tall picture back on the left, set in from the edge, with the text
 * high against it.
 */
function Spread({
  story, n, variant, first, t, locale,
}: { story: Story; n: number; variant: number; first: boolean; t: T; locale: Locale }) {
  const href = `/editorial/${story.slug}`;
  const landscape = variant === 1;
  const image = landscape ? story.images.find(isWide) ?? story.cover : story.cover;
  const p = pic(image);

  const picture = (
    <div className={cn('frame', landscape ? 'frame-3-2' : 'frame-4-5')} data-reveal-img>
      <div className="h-full w-full">
        <Image
          src={p.src}
          alt={t(alt(image))}
          width={p.width}
          height={p.height}
          sizes={landscape ? '(min-width:1024px) 64vw, 100vw' : '(min-width:1024px) 48vw, (min-width:768px) 64vw, 92vw'}
          className="transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]"
        />
      </div>
    </div>
  );

  const text = (
    <div>
      <p aria-hidden className="nums text-[clamp(4.5rem,2rem+8vw,11rem)] font-semibold leading-[0.78] tracking-[-0.06em] text-stone-brand">
        {pad(n)}
      </p>
      <p className="label mt-6 text-mute" data-reveal>
        <span className="sr-only">{t('Story {n}. ', { n })}</span>
        {t(story.kicker)} · <span className="nums">{seasonOf(story, t)}</span>
      </p>
      <h2 className="display-lg mt-3 max-w-[11ch]">
        <Link href={href} className="after:absolute after:inset-0 after:content-['']">
          <Lines text={story.title} />
        </Link>
      </h2>
      <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-mute" data-reveal>{story.standfirst}</p>
      <span aria-hidden className="label mt-7 inline-flex items-center gap-2 border-b border-ink pb-1.5" data-reveal>
        <span className="nums">{t('Read · {time}', { time: count(locale, story.readingTime, 'min') })}</span>
        <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      </span>
    </div>
  );

  return (
    <article className={cn('group page relative grid-page gap-y-8', !first && 'mt-28 md:mt-40 lg:mt-52')}>
      {variant === 0 ? (
        <>
          <div className="col-span-4 md:col-span-4 lg:col-span-6">{picture}</div>
          <div className="col-span-4 md:col-span-2 md:self-end lg:col-span-4 lg:col-start-8">{text}</div>
        </>
      ) : variant === 1 ? (
        <>
          <div className="col-span-4 md:col-span-6 lg:order-2 lg:col-span-8 lg:col-start-5">{picture}</div>
          <div className="col-span-4 md:col-span-4 lg:order-1 lg:col-span-4 lg:col-start-1 lg:row-start-1">{text}</div>
        </>
      ) : (
        <>
          <div className="col-span-4 md:col-span-4 md:col-start-3 lg:col-span-5 lg:col-start-2">{picture}</div>
          <div className="col-span-4 md:col-span-4 md:col-start-1 lg:col-span-4 lg:col-start-8 lg:row-start-1 lg:self-start lg:pt-[clamp(3rem,8vw,8rem)]">{text}</div>
        </>
      )}
    </article>
  );
}
