import type { Metadata } from 'next';
import { ListingPage } from '@/components/commerce/ListingPage';
import { products } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'New arrivals',
  description: 'The most recent pieces from MERIT — Foundation Autumn Winter 2026 and the permanent Index range.',
  alternates: { canonical: '/new' },
};

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
        image: 'campaign-rule-line-wide',
        kicker: 'Autumn Winter 2026 — Foundation',
        alt: 'A look from the Foundation campaign against a plain wall',
      }}
    />
  );
}
