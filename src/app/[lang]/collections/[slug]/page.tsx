import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/i18n/link';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/commerce/ListingPage';
import { ArtImage } from '@/components/editorial/ArtImage';
import {
  alt, collectionIndex, collectionSeason, COVER_POSITION, coverWide, isWide, looksFor, pad, pic, sentences, storyFor,
} from '@/components/editorial/data';
import { JumpToPieces } from '@/components/editorial/JumpToPieces';
import { Lookbook } from '@/components/editorial/Lookbook';
import { NextPanel } from '@/components/editorial/NextPanel';
import { Poster } from '@/components/editorial/Poster';
import { PullQuote } from '@/components/editorial/PullQuote';
import { Stage } from '@/components/editorial/Stage';
import { Icon } from '@/components/ui/Icon';
import { collections, getCollection, products } from '@/lib/catalog';
import { localePath } from '@/i18n/config';
import { localizeProduct } from '@/i18n/products';
import { getLocale, getT } from '@/i18n/server';
import { count, localizeCollection, localizeStory } from '@/i18n/stories';

export const dynamicParams = false;
export const generateStaticParams = () => collections.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<'/[lang]/collections/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const found = getCollection(slug as never);
  if (!found) return {};
  const locale = await getLocale();
  const t = await getT();
  const collection = localizeCollection(found, locale);
  const title = `${collection.name} — ${collectionSeason(collection, t)}`;
  return {
    title,
    description: collection.note,
    alternates: {
      canonical: localePath(`/collections/${collection.slug}`, locale),
      languages: { en: `/collections/${collection.slug}`, ar: `/ar/collections/${collection.slug}` },
    },
    openGraph: {
      title,
      description: collection.note,
      images: [{ url: `/img/${collection.image}.webp` }],
    },
  };
}

/**
 * A collection as a lookbook you can shop from: the name set edge to edge over
 * its campaign picture, the note, the looks hung as spreads with a price on
 * every frame, then every piece with the full filters, the story that goes
 * with it, and the next collection.
 */
export default async function CollectionPage({ params }: PageProps<'/[lang]/collections/[slug]'>) {
  const { slug } = await params;
  const found = getCollection(slug as never);
  if (!found) notFound();
  const locale = await getLocale();
  const t = await getT();
  const collection = localizeCollection(found, locale);

  const index = collectionIndex(collection.slug);
  const next = localizeCollection(collections[(index + 1) % collections.length], locale);
  const pool = products.filter((p) => p.collection === collection.slug);
  const looks = looksFor(found).map((l) => ({ ...l, product: localizeProduct(l.product, locale) }));
  // Matched on the English, which names the collection; shown in the reader's language.
  const matched = storyFor(found);
  const story = matched ? localizeStory(matched, locale) : undefined;
  const categories = [...new Set(pool.map((p) => t(p.category)))];
  // The note's closing sentence, lifted out as the pull quote.
  const lines = sentences(collection.note);
  const quote = lines.length > 1 ? lines[lines.length - 1] : null;
  const cover = coverWide(collection);
  // Frames, not looks: "look" is the house's word for a runway or campaign
  // look, and Runway 01 had twenty-four of them.
  const frames = count(locale, looks.length, 'frame', pad(looks.length));

  return (
    <>
      <JumpToPieces />

      {/* ─── Cover ──────────────────────────────────────────────────── */}
      <Stage
        as="header"
        opener
        data-header-over
        className="on-ink relative h-svh min-h-[36rem] overflow-hidden bg-ink text-bone"
      >
        <div data-zoom="1.08" className="absolute inset-0">
          <div data-reveal-img className="h-full w-full">
            <ArtImage
              wide={cover}
              tall={collection.image}
              alt={t(alt(collection.image))}
              // Drawn at whichever of width or height the crop fills first.
              sizes={fills(cover)}
              tallSizes={fills(collection.image)}
              priority
              className={COVER_POSITION[collection.slug]}
            />
          </div>
        </div>
        <div aria-hidden data-dim className="absolute inset-0 bg-black opacity-0" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/45" />

        <div className="page relative flex h-full flex-col justify-between pb-[calc(var(--gutter)*0.75)] pt-[calc(var(--nav-h)+1.25rem)]">
          <div className="flex items-baseline justify-between gap-6 border-t border-bone/35 pt-4">
            <p className="label">
              <Link href="/collections" className="link-quiet">{t('Collections')}</Link>
              <span aria-hidden className="mx-2 text-bone/45">/</span>
              <span className="nums">{pad(index + 1)}</span>
              <span className="sr-only"> {t('of {n}', { n: collections.length })}</span>
            </p>
            <p className="label nums">{collectionSeason(collection, t)}</p>
          </div>

          <div>
            <div className="mb-6 flex flex-col gap-6 md:mb-8 md:flex-row md:items-end md:justify-between">
              <p className="display-md max-w-[16ch]" data-reveal>{collection.statement}</p>
              <div className="flex shrink-0 items-center gap-6" data-reveal>
                <span className="label nums text-bone/75">{count(locale, pool.length, 'piece')}</span>
                <a href="#pieces" className="btn btn-solid">
                  {t('Shop the collection')} <Icon name="arrowR" className="h-3.5 w-3.5 rotate-90 rtl:-rotate-90" />
                </a>
              </div>
            </div>
            <Poster as="h1" text={collection.name} cap="34svh" />
          </div>
        </div>
      </Stage>

      {/* ─── The note ───────────────────────────────────────────────── */}
      <section aria-label={t('About the collection')} className="page grid-page gap-y-10 pb-(--section-sm) pt-(--section)">
        <dl className="col-span-4 md:col-span-2 lg:col-span-3">
          {[
            [t('Season'), collectionSeason(collection, t)],
            [t('In this lookbook'), frames],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-2.5" data-reveal>
              <dt className="label-sm text-mute">{k}</dt>
              <dd className="label-sm nums">{v}</dd>
            </div>
          ))}
          <div className="border-t border-line py-2.5" data-reveal>
            <dt className="label-sm text-mute">{t('In the collection')}</dt>
            <dd className="mt-2 text-sm leading-relaxed">{categories.join(locale === 'ar' ? '، ' : ', ')}</dd>
          </div>
        </dl>
        <p
          className="col-span-4 md:col-span-4 lg:col-span-8 lg:col-start-5 text-[clamp(1.625rem,0.95rem+2.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.045em] [text-wrap:balance]"
          data-reveal
        >
          {collection.note}
        </p>
      </section>

      {/* ─── The looks ──────────────────────────────────────────────── */}
      <section aria-labelledby="looks-title" className="pb-(--section)">
        <div className="page mb-10 flex items-baseline justify-between gap-6 border-t border-ink pt-4 md:mb-14">
          <h2 id="looks-title" className="label">{t('The lookbook')}</h2>
          <p className="label nums text-mute">
            {frames} · {t(looks.length === 1 ? 'shop it' : 'shop each one')}
          </p>
        </div>
        <Lookbook
          looks={looks}
          interlude={quote ? <Interlude quote={quote} detail={collection.detail} name={collection.name} label={t('From the collection note')} alt={t(alt(collection.detail))} /> : null}
        />
      </section>

      {/* ─── Every piece ────────────────────────────────────────────── */}
      <section id="pieces" aria-label={t('Every piece in {name}', { name: collection.name })} className="border-t border-ink">
        <ListingPage pool={pool} eyebrow={t('Shop {name}', { name: collection.name })} title={t('The pieces')} variant="section" />
      </section>

      {/* ─── The story that goes with it ────────────────────────────── */}
      {story ? (
        <section aria-labelledby="story-title" className="page pb-(--section)">
          <div className="mb-10 flex items-baseline justify-between gap-6 border-t border-ink pt-4">
            <p className="label">{t('The story')}</p>
            <p className="label nums text-mute">{t(story.kicker)} · {count(locale, story.readingTime, 'min')}</p>
          </div>
          <article className="group relative grid-page items-end gap-y-8">
            <div className="col-span-4 md:col-span-4 lg:col-span-7">
              <div className="frame frame-3-2" data-reveal-img>
                <div className="h-full w-full">
                  <Image
                    src={pic(story.images[0]).src}
                    alt=""
                    width={pic(story.images[0]).width}
                    height={pic(story.images[0]).height}
                    // A landscape in this 3:2 frame fills its height and is
                    // drawn about a fifth wider than the frame.
                    sizes={isWide(story.images[0]) ? '(min-width:1024px) 67vw, (min-width:768px) 76vw, 110vw' : '(min-width:1024px) 56vw, (min-width:768px) 64vw, 92vw'}
                    className="transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-4 lg:col-start-9">
              <h2 id="story-title" className="display-lg">
                <Link href={`/editorial/${story.slug}`} className="after:absolute after:inset-0 after:content-['']">
                  {story.title}
                </Link>
              </h2>
              <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-mute" data-reveal>{story.standfirst}</p>
              <span aria-hidden className="label mt-7 inline-flex items-center gap-2 border-b border-ink pb-1.5">
                <span>{t('Read the story')}</span>
                <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </span>
            </div>
          </article>
        </section>
      ) : null}

      <NextPanel
        id="next-collection"
        href={`/collections/${next.slug}`}
        eyebrow={t('Next collection')}
        position={`${pad(((index + 1) % collections.length) + 1)} / ${pad(collections.length)}`}
        title={next.name}
        poster
        meta={collectionSeason(next, t)}
        dek={next.statement}
        cta={t('Enter {name}', { name: next.name })}
        wide={coverWide(next)}
        tall={next.image}
        alt={t(alt(next.image))}
      />
    </>
  );
}

/**
 * The width a picture is drawn at when it covers a full screen: a landscape
 * fills the height and runs past the sides, a portrait fills the width on a
 * desk and the height in the hand.
 */
const fills = (image: string) => (isWide(image) ? 'max(100vw, 178svh)' : 'max(100vw, 80svh)');

/**
 * The break in the run: the collection's cloth at full height beside the
 * last line of its note, on graphite.
 */
function Interlude({
  quote, detail, name, label, alt: altText,
}: { quote: string; detail: string; name: string; label: string; alt: string }) {
  const p = pic(detail);
  return (
    <Stage className="on-ink relative overflow-hidden bg-graphite text-bone">
      <div className="grid lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-12 px-(--gutter) py-(--section) lg:col-span-7">
          <p className="label text-bone/60">{label}</p>
          <PullQuote text={quote} source={name} />
        </div>
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-[2/1] lg:col-span-5 lg:aspect-auto lg:min-h-[44rem]">
          <div data-drift="14" className="absolute inset-x-0 -top-[8%] h-[116%]">
            <Image
              src={p.src}
              alt={altText}
              fill
              // The column is taller than it is wide, so the cloth is drawn
              // wider than the column: sized for the height it fills.
              sizes="(min-width:1024px) max(42vw, 58rem), 100vw"
              className="object-cover [filter:saturate(0.9)_contrast(1.03)]"
            />
          </div>
        </div>
      </div>
    </Stage>
  );
}
