import type { Metadata } from 'next';
import { ProductCarousel } from '@/components/commerce/ProductCarousel';
import { CollectionStatement } from '@/components/sections/CollectionStatement';
import { EditorialArchive } from '@/components/sections/EditorialArchive';
import { FeaturedCategories } from '@/components/sections/FeaturedCategories';
import { Hero } from '@/components/sections/Hero';
import { Manifesto } from '@/components/sections/Manifesto';
import { SignatureStory } from '@/components/sections/SignatureStory';
import { SectionHead } from '@/components/ui/SectionHead';
import { getCollection, getProduct, newArrivals, stories } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'MERIT — Contemporary fashion, Riyadh',
  description:
    'Autumn Winter 2026. Tailoring, outerwear and knitwear made in small counts in Riyadh, sold directly.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const foundation = getCollection('foundation')!;
  const signature = getProduct('column-wide-trouser')!;
  const arrivals = newArrivals();

  return (
    <>
      <Hero
        kicker="Autumn Winter 2026"
        title="Foundation"
        sentence="Twelve pieces that set the proportions for everything that follows."
        cta={{ label: 'Explore the collection', href: '/collections/foundation' }}
        imageWide="campaign-rule-line-wide"
        imagePortrait="campaign-rule-line"
        alt="A look from the MERIT Autumn Winter 2026 campaign, photographed against a plain wall"
      />

      <section className="page section-y" aria-labelledby="new-title">
        <SectionHead index={1} title="New arrivals" link={{ label: 'View all new', href: '/new' }} as="h2" />
        <h2 id="new-title" className="sr-only">New arrivals</h2>
        <div className="mt-12 md:mt-14">
          <ProductCarousel products={arrivals} label="New arrivals" />
        </div>
      </section>

      <CollectionStatement collection={foundation} index={2} />
      <FeaturedCategories index={3} />
      <SignatureStory product={signature} index={4} />
      <EditorialArchive stories={stories.slice(0, 4)} index={5} />
      <Manifesto />
    </>
  );
}
