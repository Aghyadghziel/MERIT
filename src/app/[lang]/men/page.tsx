import type { Metadata } from 'next';
import type { ListingStory } from '@/components/commerce/Listing';
import { ListingPage } from '@/components/commerce/ListingPage';
import { alt } from '@/components/editorial/data';
import { byGender, getCollection, getStory } from '@/lib/catalog';
import { localePath } from '@/i18n/config';
import type { T } from '@/i18n/dictionary';
import { getLocale, getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT();
  return {
    title: locale === 'ar' ? t('Men') : "Men's",
    description: t("MERIT men's tailoring, overcoats, knitwear and shirting. Soft-shouldered jackets and wide trousers, made in small counts."),
    alternates: { canonical: localePath('/men', locale), languages: { en: '/men', ar: '/ar/men' } },
  };
}

const foundation = getCollection('foundation')!;
const basted = getStory('on-making-the-basted-jacket')!;

/**
 * Tiles in the grid, worded from the catalogue's own collection and story.
 * The Foundation tile uses the cloth detail from the Foundation campaign
 * rather than the collection's cover, which is also the Ledger Field Jacket's
 * product photograph and would sit two cards away from it.
 */
const stories = (t: T): ListingStory[] => [
  {
    image: 'statement-detail',
    wide: 'statement-detail',
    alt: t(alt('statement-detail')),
    kicker: t('{kicker} — {when}', { kicker: t('Collection'), when: `${t(foundation.season)} ${foundation.year}` }),
    title: t(foundation.name),
    text: t(foundation.statement),
    href: `/collections/${foundation.slug}`,
    cta: t('View the collection'),
  },
  {
    image: 'atelier-basting',
    wide: 'atelier-basting-wide',
    alt: t(alt('atelier-basting')),
    kicker: t('{kicker} — {when}', { kicker: t(basted.kicker), when: `${basted.year}` }),
    title: t(basted.title),
    text: t(basted.standfirst),
    href: `/editorial/${basted.slug}`,
    cta: t('Read the story'),
  },
];

export default async function MenPage() {
  const t = await getT();
  return (
    <ListingPage
      pool={byGender('men')}
      eyebrow={t('Ready to wear')}
      title={t('Men')}
      description={t("Soft shoulders, half canvas and a wide leg. The men's range shares its cloth with the women's and is cut on the same blocks.")}
      stories={stories(t)}
      next={{ kicker: t("Women's ready to wear"), title: t('Women'), href: '/women', count: byGender('women').length }}
    />
  );
}
