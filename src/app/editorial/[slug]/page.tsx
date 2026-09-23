import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { ProductCard } from '@/components/commerce/ProductCard';
import { ArtImage } from '@/components/editorial/ArtImage';
import { alt, isWide, pad, pic, pullQuote, seasonOf, storyIndex } from '@/components/editorial/data';
import { NextPanel } from '@/components/editorial/NextPanel';
import { PullQuote } from '@/components/editorial/PullQuote';
import { ReadingProgress } from '@/components/editorial/ReadingProgress';
import { Stage } from '@/components/editorial/Stage';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { Wordmark } from '@/components/ui/Wordmark';
import { BRAND } from '@/lib/brand';
import { getProduct, getStory, stories } from '@/lib/catalog';
import { cn } from '@/lib/cn';

export const dynamicParams = false;
export const generateStaticParams = () => stories.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: PageProps<'/editorial/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return {
    title: story.title,
    description: story.standfirst,
    alternates: { canonical: `/editorial/${story.slug}` },
    openGraph: {
      type: 'article',
      title: story.title,
      description: story.standfirst,
      images: [{ url: `/img/${story.cover}.webp` }],
    },
  };
}

/**
 * A story, set as a magazine feature: a full-bleed opener, the standfirst at
 * the size of a headline, the text in numbered parts with its pictures and
 * one line lifted out of it, then the pieces it shows and the next story.
 */
export default async function StoryPage({ params }: PageProps<'/editorial/[slug]'>) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const index = storyIndex(story.slug);
  const next = stories[(index + 1) % stories.length];
  const shop = story.shop.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const quote = pullQuote(story);
  const parts = story.body.length;
  const [opener, ...plates] = story.images;

  // Pictures after the first part, the quote after the second (or straight
  // after the pictures, if the story is shorter).
  const platesAfter = 0;
  const quoteAfter = Math.min(1, parts - 1);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.standfirst,
    image: `${BRAND.domain}/img/${story.cover}.webp`,
    author: { '@type': 'Organization', name: BRAND.name },
    publisher: { '@type': 'Organization', name: BRAND.name },
    // No datePublished: the catalogue gives a year, not a day, and a day
    // made up to fill the field would be a claim.
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress target="[data-story-body]" />

      <article>
        {/* ─── Opener ─────────────────────────────────────────────────── */}
        <Stage
          as="header"
          opener
          data-header-over
          className="on-ink relative h-svh min-h-[36rem] overflow-hidden bg-ink text-bone"
        >
          <div data-zoom="1.08" className="absolute inset-0">
            <div data-reveal-img className="h-full w-full">
              <ArtImage
                wide={opener}
                tall={story.cover}
                alt={alt(opener)}
                // Drawn at whichever of width or height the crop fills first.
                sizes={isWide(opener) ? 'max(100vw, 178svh)' : 'max(100vw, 80svh)'}
                tallSizes={isWide(story.cover) ? 'max(100vw, 178svh)' : 'max(100vw, 80svh)'}
                priority
              />
            </div>
          </div>
          <div aria-hidden data-dim className="absolute inset-0 bg-black opacity-0" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/45" />

          <div className="page relative flex h-full flex-col justify-between pb-(--gutter) pt-[calc(var(--nav-h)+1.25rem)]">
            <div className="flex items-baseline justify-between gap-6 border-t border-bone/35 pt-4">
              <p className="label">
                <Link href="/editorial" className="link-quiet">Editorial</Link>
                <span aria-hidden className="mx-2 text-bone/45">/</span>
                {story.kicker}
              </p>
              <p className="label nums text-bone/70">
                <span className="sr-only">Story </span>{pad(index + 1)} / {pad(stories.length)}
              </p>
            </div>

            <div>
              <h1 className="display-xl max-w-[12ch]"><Lines text={story.title} /></h1>
              <ul className="label mt-8 flex flex-wrap gap-x-7 gap-y-2 text-bone/80" data-reveal>
                <li className="nums">{seasonOf(story)}</li>
                <li className="nums">{story.readingTime} minute read</li>
                <li className="nums">{parts} parts</li>
              </ul>
            </div>
          </div>
        </Stage>

        {/* ─── Standfirst ─────────────────────────────────────────────── */}
        <div className="page grid-page gap-y-10 pb-(--section-sm) pt-(--section)">
          <div className="col-span-4 md:col-span-2 lg:col-span-3">
            <dl>
              {[
                ['Story', story.kicker],
                ['Season', seasonOf(story)],
                ['Reading', `${story.readingTime} minutes`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-2.5" data-reveal>
                  <dt className="label-sm text-mute">{k}</dt>
                  <dd className="label-sm nums">{v}</dd>
                </div>
              ))}
            </dl>
            {shop.length ? (
              <a href="#shop" className="label mt-5 inline-flex min-h-11 items-center gap-2 border-t border-ink pt-2.5" data-reveal>
                Shop the story <Icon name="arrowR" className="h-3.5 w-3.5 rotate-90" />
              </a>
            ) : null}
          </div>
          <p
            className="order-first col-span-4 md:order-none md:col-span-4 lg:col-span-8 lg:col-start-5 text-[clamp(1.75rem,0.95rem+2.9vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.045em] [text-wrap:balance]"
            data-reveal
          >
            {story.standfirst}
          </p>
        </div>

        {/* ─── The text, in parts ─────────────────────────────────────── */}
        <div data-story-body>
          {story.body.map((para, k) => (
            <Fragment key={k}>
              <div className="page grid-page gap-y-5 py-10 md:py-14">
                <div className="col-span-4 md:col-span-1 lg:col-span-3">
                  <p className="flex items-baseline gap-2 border-t border-ink pt-3 transition-[top] duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:sticky lg:top-[calc(var(--header-offset,var(--nav-h))+1.5rem)]" data-reveal>
                    <span className="sr-only">Part </span>
                    <span className="nums text-[clamp(2.25rem,1.4rem+2.6vw,4rem)] font-semibold leading-[0.9] tracking-[-0.05em]">{pad(k + 1)}</span>
                    <span className="label-sm nums text-mute"><span className="sr-only">of</span> / {pad(parts)}</span>
                  </p>
                </div>
                <p
                  className={cn(
                    'col-span-4 md:col-span-5 lg:col-span-6 lg:col-start-5',
                    'text-[clamp(1.0625rem,0.96rem+0.42vw,1.3125rem)] leading-[1.62] tracking-[-0.008em] [text-wrap:pretty]',
                    k === 0 && 'first-letter:float-left first-letter:mr-3 first-letter:mt-[0.065em] first-letter:text-[5.3em] first-letter:font-semibold first-letter:leading-[0.76] first-letter:tracking-[-0.05em]',
                  )}
                  data-reveal
                >
                  {para}
                  {k === parts - 1 ? (
                    <Wordmark symbol className="ml-2 inline-block h-[0.72em] w-auto align-baseline" title="End of story" />
                  ) : null}
                </p>
              </div>

              {k === platesAfter && plates.length ? <Plates names={plates} /> : null}

              {k === quoteAfter && quote ? (
                <Stage className="on-ink my-10 bg-graphite text-bone md:my-16">
                  <div className="page section-y">
                    <PullQuote text={quote} source={`From “${story.title}”`} />
                  </div>
                </Stage>
              ) : null}
            </Fragment>
          ))}
        </div>

        {/* ─── Shop the story ─────────────────────────────────────────── */}
        {shop.length ? (
          <section id="shop" className="page section-y" aria-labelledby="shop-title">
            <div className="grid-page gap-y-12">
              <div className="col-span-4 md:col-span-6 lg:col-span-4">
                <div className="border-t border-ink pt-4 transition-[top] duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:sticky lg:top-[calc(var(--header-offset,var(--nav-h))+1.5rem)]">
                  <p className="label text-mute" data-reveal>
                    Shop the story — <span className="nums">{pad(shop.length)}</span> pieces
                  </p>
                  <h2 id="shop-title" className="display-lg mt-5 max-w-[10ch]"><Lines text="Pieces from this story." /></h2>
                </div>
              </div>
              <div
                className={cn(
                  'col-span-4 md:col-span-6 lg:col-span-8 grid grid-cols-2 gap-x-(--gutter) gap-y-12',
                  shop.length >= 3 ? 'md:grid-cols-3' : 'lg:max-w-[48rem]',
                )}
              >
                {shop.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} sizes="(min-width:1024px) 21vw, (min-width:768px) 31vw, 47vw" />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── In this issue ──────────────────────────────────────────── */}
        <nav aria-label="Stories" className="page pb-10">
          <div className="flex items-center justify-between gap-6 border-t border-ink pt-2">
            <Link href="/editorial" className="label inline-flex min-h-11 items-center gap-2 link-quiet">
              <Icon name="arrowL" className="h-3.5 w-3.5" /> All stories
            </Link>
            <p className="label-sm nums text-mute">{pad(stories.length)} stories</p>
          </div>
          <ol className="grid gap-x-(--gutter) sm:grid-cols-2 lg:grid-cols-4">
            {stories.map((s, i) => {
              const current = s.slug === story.slug;
              return (
                <li key={s.slug} className="border-t border-line">
                  <Link
                    href={`/editorial/${s.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className={cn('group flex min-h-14 items-baseline gap-3 py-3 transition-colors', current ? 'text-ink' : 'text-mute hover:text-ink')}
                  >
                    <span className="label-sm nums">{pad(i + 1)}</span>
                    <span className={cn('text-sm leading-snug', current && 'font-semibold')}>{s.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </article>

      <NextPanel
        id="next-story"
        href={`/editorial/${next.slug}`}
        eyebrow="Next story"
        position={`${pad(stories.indexOf(next) + 1)} / ${pad(stories.length)}`}
        title={next.title}
        meta={`${next.kicker} · ${next.readingTime} min`}
        dek={next.standfirst}
        cta="Read the story"
        wide={next.images[0]}
        tall={next.cover}
        alt={alt(next.images[0])}
      />
    </>
  );
}

/**
 * The story's pictures as a spread: the first large, the second smaller and
 * dropped against it, each captioned with what it shows.
 */
function Plates({ names }: { names: string[] }) {
  const [a, b] = names;
  const frame = (name: string) => (isWide(name) ? 'frame-3-2' : pic(name).width === pic(name).height ? 'frame-1-1' : 'frame-4-5');
  const caption = (name: string, n: number) => (
    <figcaption className="mt-3 flex gap-3 text-xs leading-snug text-mute" data-reveal>
      <span className="label-sm nums shrink-0 text-ink">Plate {pad(n)}</span>
      <span>{alt(name)}</span>
    </figcaption>
  );

  return (
    <div className="page grid-page items-end gap-y-12 py-10 md:py-20">
      <figure className="col-span-4 md:col-span-4 lg:col-span-7">
        <div className={cn('frame', frame(a))} data-reveal-img>
          <div className="h-full w-full">
            <Image src={pic(a).src} alt="" width={pic(a).width} height={pic(a).height} sizes="(min-width:1024px) 56vw, (min-width:768px) 64vw, 100vw" />
          </div>
        </div>
        {caption(a, 1)}
      </figure>
      {b ? (
        <figure className="col-span-3 col-start-2 md:col-span-2 lg:col-span-4 lg:col-start-9">
          <div className={cn('frame', frame(b))} data-reveal-img>
            <div className="h-full w-full">
              <Image src={pic(b).src} alt="" width={pic(b).width} height={pic(b).height} sizes="(min-width:1024px) 31vw, (min-width:768px) 32vw, 75vw" />
            </div>
          </div>
          {caption(b, 2)}
        </figure>
      ) : null}
    </div>
  );
}
