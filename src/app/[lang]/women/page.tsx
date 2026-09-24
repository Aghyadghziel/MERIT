import type { Metadata } from 'next';
import type { ListingStory } from '@/components/commerce/Listing';
import { ListingPage } from '@/components/commerce/ListingPage';
import { alt } from '@/components/editorial/data';
import { byGender, getStory } from '@/lib/catalog';
import { localePath } from '@/i18n/config';
import type { T } from '@/i18n/dictionary';
import { getLocale, getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT();
  return {
    title: locale === 'ar' ? t('Women') : "Women's",
    description: t("MERIT women's tailoring, outerwear, knitwear, shirting and accessories. Made in small counts in Italy and Portugal."),
    alternates: { canonical: localePath('/women', locale), languages: { en: '/women', ar: '/ar/women' } },
  };
}

/**
 * A story from the catalogue, as a tile in the grid. Every word is the
 * story's own; the season is left out where it only repeats the kicker.
 */
function tile(t: T, slug: string, image: string, wide: string): ListingStory {
  const story = getStory(slug)!;
  const when = story.season === story.kicker ? `${story.year}` : `${t(story.season)} ${story.year}`;
  return {
    image,
    wide,
    alt: t(alt(image)),
    kicker: t('{kicker} — {when}', { kicker: t(story.kicker), when }),
    title: t(story.title),
    text: t(story.standfirst),
    href: `/editorial/${story.slug}`,
    cta: t('Read the story'),
  };
}

export default async function WomenPage() {
  const t = await getT();
  return (
    <ListingPage
      pool={byGender('women')}
      eyebrow={t('Ready to wear')}
      title={t('Women')}
      description={t('Tailoring cut on our own blocks, outerwear made from double-faced cloth, and the Index pieces that are re-issued every year.')}
      stories={[
        tile(t, 'the-rule-line', 'campaign-rule-line', 'campaign-rule-line-wide'),
        tile(t, 'atrium-twelve-rooms', 'campaign-atrium', 'campaign-atrium-wide'),
      ]}
      next={{ kicker: t("Men's ready to wear"), title: t('Men'), href: '/men', count: byGender('men').length }}
    />
  );
}
