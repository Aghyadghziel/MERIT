import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/commerce/ListingPage';
import { ArtImage } from '@/components/editorial/ArtImage';
import {
  alt, collectionIndex, COVER_POSITION, coverWide, looksFor, pad, pic, sentences, storyFor,
} from '@/components/editorial/data';
import { JumpToPieces } from '@/components/editorial/JumpToPieces';
import { Lookbook } from '@/components/editorial/Lookbook';
import { NextPanel } from '@/components/editorial/NextPanel';
import { Poster } from '@/components/editorial/Poster';
import { PullQuote } from '@/components/editorial/PullQuote';
import { Stage } from '@/components/editorial/Stage';
import { Icon } from '@/components/ui/Icon';
import { collections, getCollection, products } from '@/lib/catalog';
import { plural } from '@/lib/format';

export const dynamicParams = false;
export const generateStaticParams = () => collections.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<'/collections/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug as never);
  if (!collection) return {};
  return {
    title: `${collection.name} — ${collection.season} ${collection.year}`,
    description: collection.note,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.name} — ${collection.season} ${collection.year}`,
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
export default async function CollectionPage({ params }: PageProps<'/collections/[slug]'>) {
  const { slug } = await params;
  const collection = getCollection(slug as never);
  if (!collection) notFound();

  const index = collectionIndex(collection.slug);
  const next = collections[(index + 1) % collections.length];
  const pool = products.filter((p) => p.collection === collection.slug);
  const looks = looksFor(collection);
  const story = storyFor(collection);
  const categories = [...new Set(pool.map((p) => p.category))];
  // The note's closing sentence, lifted out as the pull quote.
  const lines = sentences(collection.note);
  const quote = lines.length > 1 ? lines[lines.length - 1] : null;

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
              wide={coverWide(collection)}
              tall={collection.image}
              alt={alt(collection.image)}
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
              <Link href="/collections" className="link-quiet">Collections</Link>
              <span aria-hidden className="mx-2 text-bone/45">/</span>
              <span className="nums">{pad(index + 1)}</span>
              <span className="sr-only"> of {collections.length}</span>
            </p>
            <p className="label">{collection.season} <span className="nums">{collection.year}</span></p>
          </div>

          <div>
            <div className="mb-6 flex flex-col gap-6 md:mb-8 md:flex-row md:items-end md:justify-between">
              <p className="display-md max-w-[16ch]" data-reveal>{collection.statement}</p>
              <div className="flex shrink-0 items-center gap-6" data-reveal>
                <span className="label nums text-bone/75">{plural(pool.length, 'piece')}</span>
                <a href="#pieces" className="btn btn-solid">
                  Shop the collection <Icon name="arrowR" className="h-3.5 w-3.5 rotate-90" />
                </a>
              </div>
            </div>
            <Poster as="h1" text={collection.name} cap="34svh" />
          </div>
        </div>
      </Stage>

      {/* ─── The note ───────────────────────────────────────────────── */}
      <section aria-label="About the collection" className="page grid-page gap-y-10 pb-(--section-sm) pt-(--section)">
        <dl className="col-span-4 md:col-span-2 lg:col-span-3">
          {[
            ['Season', collection.season],
            ['Year', String(collection.year)],
            ['Pieces', pad(pool.length)],
            ['Looks', pad(looks.length)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-2.5" data-reveal>
              <dt className="label-sm text-mute">{k}</dt>
              <dd className="label-sm nums">{v}</dd>
            </div>
          ))}
          <div className="border-t border-line py-2.5" data-reveal>
            <dt className="label-sm text-mute">In the collection</dt>
            <dd className="mt-2 text-sm leading-relaxed">{categories.join(', ')}</dd>
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
          <h2 id="looks-title" className="label">The looks</h2>
          <p className="label nums text-mute">{pad(looks.length)} {looks.length === 1 ? 'look' : 'looks'} · shop each frame</p>
        </div>
        <Lookbook
          looks={looks}
          interlude={quote ? <Interlude quote={quote} detail={collection.detail} name={collection.name} /> : null}
        />
      </section>

      {/* ─── Every piece ────────────────────────────────────────────── */}
      <section id="pieces" aria-label={`Every piece in ${collection.name}`} className="border-t border-ink">
        <ListingPage pool={pool} eyebrow={`Shop ${collection.name}`} title="The pieces" variant="section" />
      </section>

      {/* ─── The story that goes with it ────────────────────────────── */}
      {story ? (
        <section aria-labelledby="story-title" className="page pb-(--section)">
          <div className="mb-10 flex items-baseline justify-between gap-6 border-t border-ink pt-4">
            <p className="label">The story</p>
            <p className="label nums text-mute">{story.kicker} · {story.readingTime} min</p>
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
                    sizes="(min-width:1024px) 56vw, 100vw"
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
                <span>Read the story</span>
                <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </article>
        </section>
      ) : null}

      <NextPanel
        id="next-collection"
        href={`/collections/${next.slug}`}
        eyebrow="Next collection"
        position={`${pad(collections.indexOf(next) + 1)} / ${pad(collections.length)}`}
        title={next.name}
        poster
        meta={`${next.season} ${next.year}`}
        dek={next.statement}
        cta={`Enter ${next.name}`}
        wide={coverWide(next)}
        tall={next.image}
        alt={alt(next.image)}
      />
    </>
  );
}

/**
 * The break in the run: the collection's cloth at full height beside the
 * last line of its note, on graphite.
 */
function Interlude({ quote, detail, name }: { quote: string; detail: string; name: string }) {
  const p = pic(detail);
  return (
    <Stage className="on-ink relative overflow-hidden bg-graphite text-bone">
      <div className="grid lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-12 px-(--gutter) py-(--section) lg:col-span-7">
          <p className="label text-bone/60">From the collection note</p>
          <PullQuote text={quote} source={name} />
        </div>
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-[2/1] lg:col-span-5 lg:aspect-auto lg:min-h-[44rem]">
          <div data-drift="14" className="absolute inset-x-0 -top-[8%] h-[116%]">
            <Image
              src={p.src}
              alt={alt(detail)}
              fill
              sizes="(min-width:1024px) 42vw, 100vw"
              className="object-cover [filter:saturate(0.9)_contrast(1.03)]"
            />
          </div>
        </div>
      </div>
    </Stage>
  );
}
