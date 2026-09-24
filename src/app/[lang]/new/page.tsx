import type { Metadata } from 'next';
import type { ListingStory } from '@/components/commerce/Listing';
import { ListingPage } from '@/components/commerce/ListingPage';
import { alt } from '@/components/editorial/data';
import { getStory, isSoldOut, products } from '@/lib/catalog';
import { localePath } from '@/i18n/config';
import type { T } from '@/i18n/dictionary';
import { getLocale, getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT();
  return {
    title: t('New arrivals'),
    description: t('This season at MERIT: Foundation, Autumn Winter 2026, and what is made for sale from Runway 01.'),
    alternates: { canonical: localePath('/new', locale), languages: { en: '/new', ar: '/ar/new' } },
  };
}

/**
 * A story from the catalogue, as a tile in the grid. Every word is the
 * story's own; the season is left out where it only repeats the kicker.
 */
function tile(t: T, slug: string, image: string, wide?: string, crop?: string): ListingStory {
  const story = getStory(slug)!;
  const when = story.season === story.kicker ? `${story.year}` : `${t(story.season)} ${story.year}`;
  return {
    image,
    wide,
    crop,
    alt: t(alt(image)),
    kicker: t('{kicker} — {when}', { kicker: t(story.kicker), when }),
    title: t(story.title),
    text: t(story.standfirst),
    href: `/editorial/${story.slug}`,
    cta: t('Read the story'),
  };
}

/**
 * This season only: Foundation, then the runway pieces made for sale. Last
 * season, markdowns and anything sold out belong to the other listings.
 */
const pool = products.filter(
  (p) => (p.collection === 'foundation' || p.collection === 'runway-01') && !p.compareAt && !isSoldOut(p),
).sort((a, b) => (a.collection === 'foundation' ? 0 : 1) - (b.collection === 'foundation' ? 0 : 1));

const index = products.filter((p) => p.collection === 'index');

export default async function NewPage() {
  const t = await getT();
  return (
    <ListingPage
      pool={pool}
      eyebrow={t('This season')}
      title={t('New arrivals')}
      description={t('Foundation, Autumn Winter 2026, and what is made for sale from Runway 01. The cloth is heavier than last season, and the colour has been pulled back to four.')}
      // The Rule Line is the Foundation campaign, and none of its frames is
      // also a product photograph.
      campaign={{
        image: 'campaign-rule-line-wide',
        tall: 'campaign-rule-line',
        kicker: t('Autumn Winter 2026 — Foundation'),
        alt: t(alt('campaign-rule-line-wide')),
      }}
      stories={[
        tile(t, 'runway-01-riyadh', 'runway-01', 'runway-01', 'object-[58%_center]'),
        tile(t, 'the-rule-line', 'statement-detail', 'statement-detail'),
      ]}
      next={{ kicker: t('The permanent range'), title: t('Index'), href: '/collections/index', count: index.length }}
    />
  );
}
