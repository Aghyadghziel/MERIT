import type { Metadata } from 'next';
import type { ListingStory } from '@/components/commerce/Listing';
import { ListingPage } from '@/components/commerce/ListingPage';
import { alt } from '@/components/editorial/data';
import { getStory, products } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'New arrivals',
  description: 'The most recent pieces from MERIT — Foundation Autumn Winter 2026 and the permanent Index range.',
  alternates: { canonical: '/new' },
};

/** A story from the catalogue, as a tile in the grid. Every word is the story's own. */
function tile(slug: string, image: string, wide?: string, crop?: string): ListingStory {
  const story = getStory(slug)!;
  return {
    image,
    wide,
    crop,
    alt: alt(image),
    kicker: `${story.kicker} — ${story.season} ${story.year}`,
    title: story.title,
    text: story.standfirst,
    href: `/editorial/${story.slug}`,
    cta: 'Read the story',
  };
}

export default function NewPage() {
  // Newest first: this season's pieces, then the permanent range.
  const pool = [...products].sort((a, b) => {
    const rank = (c: string) => (c === 'foundation' ? 0 : c === 'runway-01' ? 1 : c === 'index' ? 2 : 3);
    return rank(a.collection) - rank(b.collection);
  });

  return (
    <ListingPage
      pool={pool}
      eyebrow="This season"
      title="New arrivals"
      description="Foundation lands in three deliveries between September and December. Everything below is in the studio now."
      campaign={{
        image: 'campaign-foundation-wide',
        tall: 'campaign-foundation',
        kicker: 'Autumn Winter 2026 — Foundation',
        alt: alt('campaign-foundation-wide'),
      }}
      stories={[
        tile('the-rule-line', 'campaign-rule-line', 'campaign-rule-line-wide'),
        tile('on-making-the-basted-jacket', 'atelier-basting', 'atelier-basting-wide'),
        tile('runway-01-riyadh', 'runway-01', 'runway-01', 'object-[58%_center]'),
      ]}
    />
  );
}
