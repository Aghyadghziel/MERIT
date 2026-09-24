import type { Metadata } from 'next';
import type { ListingStory } from '@/components/commerce/Listing';
import { ListingPage } from '@/components/commerce/ListingPage';
import { alt } from '@/components/editorial/data';
import { byGender, getCollection, getStory } from '@/lib/catalog';

export const metadata: Metadata = {
  title: "Men's",
  description: "MERIT men's tailoring, overcoats, knitwear and shirting. Soft-shouldered jackets and wide trousers, made in small counts.",
  alternates: { canonical: '/men' },
};

const foundation = getCollection('foundation')!;
const basted = getStory('on-making-the-basted-jacket')!;

/**
 * Tiles in the grid, worded from the catalogue's own collection and story.
 * The Foundation tile uses the cloth detail from the Foundation campaign
 * rather than the collection's cover, which is also the Ledger Field Jacket's
 * product photograph and would sit two cards away from it.
 */
const stories: ListingStory[] = [
  {
    image: 'statement-detail',
    wide: 'statement-detail',
    alt: alt('statement-detail'),
    kicker: `Collection — ${foundation.season} ${foundation.year}`,
    title: foundation.name,
    text: foundation.statement,
    href: `/collections/${foundation.slug}`,
    cta: 'View the collection',
  },
  {
    image: 'atelier-basting',
    wide: 'atelier-basting-wide',
    alt: alt('atelier-basting'),
    kicker: `${basted.kicker} — ${basted.year}`,
    title: basted.title,
    text: basted.standfirst,
    href: `/editorial/${basted.slug}`,
    cta: 'Read the story',
  },
];

export default function MenPage() {
  return (
    <ListingPage
      pool={byGender('men')}
      eyebrow="Ready to wear"
      title="Men"
      description="Soft shoulders, half canvas and a wide leg. The men's range shares its cloth with the women's and is cut on the same blocks."
      stories={stories}
      next={{ kicker: "Women's ready to wear", title: 'Women', href: '/women', count: byGender('women').length }}
    />
  );
}
