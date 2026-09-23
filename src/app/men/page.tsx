import type { Metadata } from 'next';
import { ListingPage } from '@/components/commerce/ListingPage';
import { byGender } from '@/lib/catalog';

export const metadata: Metadata = {
  title: "Men's",
  description: "MERIT men's tailoring, overcoats, knitwear and shirting. Soft-shouldered jackets and wide trousers, made in small counts.",
  alternates: { canonical: '/men' },
};

export default function MenPage() {
  return (
    <ListingPage
      pool={byGender('men')}
      eyebrow="Ready to wear"
      title="Men"
      description="Soft shoulders, half canvas and a wide leg. The men's range shares its cloth with the women's and is cut on the same blocks."
    />
  );
}
