import type { Metadata } from 'next';
import type { ListingStory } from '@/components/commerce/Listing';
import { ListingPage } from '@/components/commerce/ListingPage';
import { alt } from '@/components/editorial/data';
import { byGender, getStory } from '@/lib/catalog';

export const metadata: Metadata = {
  title: "Women's",
  description: "MERIT women's tailoring, outerwear, knitwear, shirting and accessories. Made in small counts in Italy and Portugal.",
  alternates: { canonical: '/women' },
};

/** A story from the catalogue, as a tile in the grid. Every word is the story's own. */
function tile(slug: string, image: string, wide: string): ListingStory {
  const story = getStory(slug)!;
  return {
    image,
    wide,
    alt: alt(image),
    kicker: `${story.kicker} — ${story.season} ${story.year}`,
    title: story.title,
    text: story.standfirst,
    href: `/editorial/${story.slug}`,
    cta: 'Read the story',
  };
}

export default function WomenPage() {
  return (
    <ListingPage
      pool={byGender('women')}
      eyebrow="Ready to wear"
      title="Women"
      description="Tailoring cut on our own blocks, outerwear made from double-faced cloth, and the Index pieces that are re-issued every year."
      stories={[
        tile('the-rule-line', 'campaign-rule-line', 'campaign-rule-line-wide'),
        tile('atrium-twelve-rooms', 'campaign-atrium', 'campaign-atrium-wide'),
      ]}
    />
  );
}
