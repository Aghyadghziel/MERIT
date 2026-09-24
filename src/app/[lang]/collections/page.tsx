import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/i18n/link';
import { Fragment } from 'react';
import { ArtImage } from '@/components/editorial/ArtImage';
import { ChapterStack } from '@/components/editorial/ChapterStack';
import { collectionSeason, isWide, looksFor, pad, pic } from '@/components/editorial/data';
import { Poster } from '@/components/editorial/Poster';
import { Price } from '@/components/commerce/Price';
import { Icon } from '@/components/ui/Icon';
import { collections, products, type Collection } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/config';
import type { T } from '@/i18n/dictionary';
import { localizeProduct } from '@/i18n/products';
import { getLocale, getT } from '@/i18n/server';
import { count, localizeCollection } from '@/i18n/stories';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT();
  return {
    title: t('Collections'),
    description: t('Foundation, Atrium, Index and Runway 01 — the four MERIT collections, seasonal and permanent.'),
    alternates: { canonical: localePath('/collections', locale), languages: { en: '/collections', ar: '/ar/collections' } },
  };
}

/** Each chapter is its own room: black, warm white, stone, graphite. */
const ROOM: Record<string, { bg: string; dark: boolean }> = {
  foundation: { bg: 'bg-ink', dark: true },
  atrium: { bg: 'bg-bone-2', dark: false },
  index: { bg: 'bg-stone-brand', dark: false },
  'runway-01': { bg: 'bg-graphite', dark: true },
};

/**
 * The collections as a book: a masthead and its contents, then one chapter
 * per collection. On a desktop the chapters stack — each pins under the header
 * and the next slides over it — so the four read as pages turned, not rows
 * scrolled past.
 */
export default async function CollectionsPage() {
  const locale = await getLocale();
  const t = await getT();
  const seasons = collections.filter((c) => c.season !== 'Permanent' && c.season !== 'Runway').length;

  return (
    <>
      {/* ─── Masthead ─────────────────────────────────────────────────── */}
      <header className="page pt-(--nav-h)">
        <div className="mt-8 flex items-baseline justify-between gap-6 border-b border-ink pb-3 md:mt-12">
          <p className="label" data-reveal>{t('Seasonal and permanent')}</p>
          <p className="label nums" data-reveal>{count(locale, collections.length, 'collection', pad(collections.length))}</p>
        </div>
        <Poster as="h1" text={t('Collections')} cap="34svh" className="mt-3 md:mt-5" />

        <div className="grid-page mt-5 gap-y-10 border-t border-ink pb-(--section-sm) pt-5 md:mt-7">
          <p
            className="col-span-4 md:col-span-3 lg:col-span-5 text-[clamp(1.5rem,1rem+1.9vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]"
            data-reveal
          >
            {t(seasons === 2 ? 'Two seasons, one permanent range, and the archive.' : 'The seasons, the permanent range, and the archive.')}
          </p>

          <nav aria-label={t('Collections')} className="col-span-4 md:col-span-3 lg:col-span-6 lg:col-start-7">
            <p className="label-sm text-mute" data-reveal>{t('Contents')}</p>
            <ol className="mt-3">
              {collections.map((c, i) => (
                <li key={c.slug} className="border-t border-line last:border-b" data-reveal>
                  <a href={`#${c.slug}`} className="group flex min-h-12 items-center gap-4 py-2.5">
                    <span className="label-sm nums w-6 shrink-0 text-mute">{pad(i + 1)}</span>
                    <span className="flex-1 text-[0.9375rem] font-medium leading-snug transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] md:group-hover:translate-x-1.5 rtl:md:group-hover:-translate-x-1.5">
                      {c.name}
                    </span>
                    <span className="label-sm nums hidden shrink-0 text-mute sm:inline">
                      {collectionSeason(c, t)} · {pieceCount(c, locale)}
                    </span>
                    <Icon name="arrowR" className="h-3.5 w-3.5 shrink-0 rotate-90 rtl:-rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      {/* ─── The chapters ─────────────────────────────────────────────── */}
      <ChapterStack>
        {collections.map((c, i) => (
          <Fragment key={c.slug}>
            <Chapter collection={localizeCollection(c, locale)} n={i} flip={i % 2 === 1} t={t} locale={locale} />
            {/* A held beat: the pinned chapter stays whole for a while before
                the next one starts to cover it. Only where chapters pin. */}
            {i < collections.length - 1 ? (
              <div aria-hidden className="hidden h-[55svh] lg:[@media(min-height:640px)]:block" />
            ) : null}
          </Fragment>
        ))}
      </ChapterStack>

      <div className="page section-y">
        <Link href="/editorial" className="group flex flex-col gap-3 border-y border-ink py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-8">
          <span className="label text-mute">{t('How they were made and shown')}</span>
          <span className="inline-flex items-center justify-between gap-3 whitespace-nowrap text-[clamp(1.5rem,0.9rem+1.4vw,2.25rem)] font-semibold tracking-[-0.035em]">
            {t('Editorial')}
            <Icon name="arrowR" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
          </span>
        </Link>
      </div>
    </>
  );
}

const pieceCount = (c: Collection, locale: Locale) => count(locale, products.filter((p) => p.collection === c.slug).length, 'piece');

/**
 * The width a chapter's picture is drawn at. A portrait fills its half of the
 * screen; a landscape (Runway 01 has no portrait) fills the height and runs
 * far past the sides, and is drawn — and must be fetched — that wide.
 */
const chapterSizes = (image: string) =>
  isWide(image)
    ? '(min-width:1024px) max(50vw, 178svh), (min-width:768px) 119vw, 223vw'
    : '(min-width:1024px) max(50vw, 80svh), 100vw';

function Chapter({ collection: c, n, flip, t, locale }: { collection: Collection; n: number; flip: boolean; t: T; locale: Locale }) {
  const room = ROOM[c.slug] ?? { bg: 'bg-bone-2', dark: false };
  const href = `/collections/${c.slug}`;
  const pieces = looksFor(c).slice(0, 3).map((l) => ({ ...l, product: localizeProduct(l.product, locale) }));

  return (
    <section
      id={c.slug}
      data-chapter
      aria-labelledby={`chapter-${c.slug}`}
      className={cn(
        'relative overflow-hidden',
        room.bg,
        room.dark ? 'on-ink text-bone' : 'text-ink',
        // A full screen, pinned, only where a chapter fits one; otherwise it
        // scrolls. The header floats over the top of it either way.
        'lg:[@media(min-height:640px)]:sticky lg:[@media(min-height:640px)]:top-0 lg:[@media(min-height:640px)]:h-svh',
        // A pinned chapter is a whole screen with room for the header built
        // in, so a contents link lands it flush with the top, cancelling the
        // page's scroll padding.
        'lg:[@media(min-height:640px)]:scroll-mt-[calc(-1*(var(--nav-h)+1rem))]',
      )}
    >
      <div data-chapter-inner className="grid h-full lg:grid-cols-12">
        {/* The picture, edge to edge on its half. */}
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className={cn(
            'group relative block aspect-[4/5] overflow-hidden md:aspect-[3/2] lg:col-span-6 lg:aspect-auto lg:h-full',
            flip && 'lg:order-2',
          )}
        >
          <div data-reveal-img className="absolute inset-0">
            <div className="h-full w-full transition-transform duration-[1600ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]">
              <ArtImage wide={c.image} alt="" sizes={chapterSizes(c.image)} priority={n === 0} />
            </div>
          </div>
          <span className="label absolute start-(--gutter) top-5 text-bone mix-blend-difference lg:hidden">{pad(n + 1)}</span>
        </Link>

        {/* The words, and a way in. */}
        <div
          className={cn(
            'flex flex-col justify-between gap-10 px-(--gutter) pb-12 pt-8 lg:col-span-6',
            'lg:pb-[clamp(1.5rem,4svh,3rem)] lg:pt-[calc(var(--nav-h)+clamp(1rem,3svh,2.5rem))]',
            flip && 'lg:order-1',
          )}
        >
          <div className={cn('flex items-baseline justify-between gap-6 border-t pt-4', room.dark ? 'border-bone/25' : 'border-ink/25')}>
            <p className="label nums">{pad(n + 1)} <span className="opacity-50">/ {pad(collections.length)}</span></p>
            <p className="label nums">{collectionSeason(c, t)}</p>
          </div>

          <div>
            <Poster as="h2" id={`chapter-${c.slug}`} text={c.name} cap="clamp(3rem,20svh,12rem)" />
            <p className="display-sm mt-6 max-w-[22ch] [text-wrap:balance] lg:mt-8" data-reveal>{c.statement}</p>
            <p className={cn('mt-4 max-w-md text-sm leading-relaxed', room.dark ? 'text-bone/70' : 'text-mute')} data-reveal>{c.note}</p>
          </div>

          <div>
            {pieces.length ? (
              <ul aria-label={t('From {name}', { name: c.name })} className="grid grid-cols-3 gap-3">
                {pieces.map(({ product }) => (
                  <li key={product.slug} data-reveal>
                    <Link href={`/products/${product.slug}`} className="group/piece flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
                      <span className="frame frame-4-5 block w-full shrink-0 lg:w-14">
                        <Image
                          src={pic(product.images[0]).src}
                          alt=""
                          width={pic(product.images[0]).width}
                          height={pic(product.images[0]).height}
                          sizes="(min-width:1024px) 56px, 30vw"
                          className="transition-transform duration-700 group-hover/piece:scale-[1.06]"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium leading-snug group-hover/piece:underline group-hover/piece:underline-offset-2">{product.name}</span>
                        <Price amount={product.price} compareAt={product.compareAt} className={cn('mt-0.5 text-xs!', room.dark ? 'text-bone/70' : 'text-mute')} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8">
              <Link href={href} className="btn btn-solid">
                {t('Enter {name}', { name: c.name })} <Icon name="arrowR" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden data-chapter-shade className="pointer-events-none absolute inset-0 bg-black opacity-0" />
    </section>
  );
}

