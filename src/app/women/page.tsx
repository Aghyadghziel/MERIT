import type { Metadata } from 'next';
import { ListingPage } from '@/components/commerce/ListingPage';
import { byGender } from '@/lib/catalog';

export const metadata: Metadata = {
  title: "Women's",
  description: "MERIT women's tailoring, outerwear, knitwear, shirting and accessories. Made in small counts in Italy and Portugal.",
  alternates: { canonical: '/women' },
};

export default function WomenPage() {
  return (
    <ListingPage
      pool={byGender('women')}
      eyebrow="Ready to wear"
      title="Women"
      description="Tailoring cut on our own blocks, outerwear made from double-faced cloth, and the Index pieces that are re-issued every year."
    />
  );
}
