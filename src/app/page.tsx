import type { Metadata } from 'next';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { BrandStatement } from '@/components/sections/BrandStatement';
import { CampaignIntro } from '@/components/sections/CampaignIntro';
import { OutfitCarousel, type OutfitItem } from '@/components/sections/OutfitCarousel';
import { SectionHead } from '@/components/ui/SectionHead';
import { getProduct } from '@/lib/catalog';
import { outfits } from '@/lib/outfits';

export const metadata: Metadata = {
  title: 'MERIT — Contemporary fashion, Riyadh',
  description: 'Foundation, Autumn Winter 2026. One tee, four jackets — turn the rail and see how each one sits.',
  alternates: { canonical: '/' },
};

const FEATURED = ['atrium-wool-coat', 'rule-single-breasted-blazer', 'column-wide-trouser', 'axis-structured-bag'];

export default function HomePage() {
  const items = outfits.map<OutfitItem>((o) => ({ ...o, product: getProduct(o.slug)! }));
  const featured = FEATURED.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <CampaignIntro />
      <OutfitCarousel items={items} />

      <section className="page section-y-sm" aria-labelledby="featured-title">
        <SectionHead index={1} title="Featured" link={{ label: 'View all new', href: '/new' }} as="p" />
        <h2 id="featured-title" className="sr-only">Featured pieces</h2>
        <div className="mt-8 md:mt-10">
          <ProductGrid products={featured} columns={4} />
        </div>
      </section>

      <BrandStatement />
    </>
  );
}
