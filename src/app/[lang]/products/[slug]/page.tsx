import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/commerce/Gallery';
import { ProductPanel } from '@/components/commerce/ProductPanel';
import { RecentlyViewed } from '@/components/commerce/RecentlyViewed';
import { BRAND } from '@/lib/brand';
import { getCollection, getProduct, isSoldOut, products } from '@/lib/catalog';
import { Breadcrumb } from './_parts/Breadcrumb';
import { CollectionBand } from './_parts/CollectionBand';
import { CompleteTheLook } from './_parts/CompleteTheLook';
import { Details } from './_parts/Details';
import { imageKind } from './_parts/media';
import { alsoConsider, completeLook } from './_parts/pairing';
import { Rail } from './_parts/Rail';

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  // The graded photographs are all 1400 × 1750. The Fitting Room cut-outs
  // (outfits/*) come in their own sizes, so for a piece that has only those
  // the size is left for the crawler to read rather than stated wrongly.
  const photo = product.images.find((i) => imageKind(i) === 'photo');
  const og = photo
    ? { url: `/img/${photo}.webp`, width: 1400, height: 1750, alt: product.name }
    : { url: `/img/${product.images[0]}.webp`, alt: product.name };
  return {
    title: product.name,
    description: `${product.summary} ${product.materials[0]}. ${product.madeIn}.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — ${BRAND.name}`,
      description: product.summary,
      images: [og],
    },
  };
}

/**
 * The product page, read top to bottom:
 *
 *   1. The spread — photographs on the left half, one per screen, and the
 *      buying panel on the right half, which stays while they pass.
 *   2. The piece — the description set large, the facts in ruled folds.
 *   3. The collection it belongs to, full bleed.
 *   4. The look — this piece and what it is worn with.
 *   5. More to consider, then what was looked at recently.
 */
export default async function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const sold = isSoldOut(product);
  const collection = getCollection(product.collection);
  const look = completeLook(product);
  const consider = alsoConsider(product, look);
  const section = product.gender === 'men' ? '/men' : '/women';
  // Unisex pieces are listed by category alone; "Accessories / Accessories"
  // would say the same thing twice.
  const crumbs = [
    { name: 'Home', href: '/' },
    ...(product.gender === 'unisex' ? [] : [{ name: product.gender === 'men' ? 'Men' : 'Women', href: section }]),
    { name: product.category, href: `${section}?category=${encodeURIComponent(product.category)}` },
    { name: product.name, href: `/products/${product.slug}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images.map((i) => `${BRAND.domain}/img/${i}.webp`),
        sku: product.slug,
        brand: { '@type': 'Brand', name: BRAND.name },
        material: product.materials[0],
        color: product.colours.map((c) => c.name).join(', '),
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'SAR',
          availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
          url: `${BRAND.domain}/products/${product.slug}`,
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: `${BRAND.domain}${c.href}`,
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="pt-(--nav-h)">
        <div className="lg:grid lg:grid-cols-2">
          <div className="min-w-0">
            {/* Named without a colour: the photographs are shared by every
                colourway, and the one chosen in the panel can change. */}
            <Gallery images={product.images} name={product.name} />
          </div>
          <div className="relative min-w-0">
            <ProductPanel
              product={product}
              lead={<Breadcrumb crumbs={crumbs} />}
              kicker={collection ? `${collection.name} — ${collection.season} ${collection.year}` : undefined}
            />
          </div>
        </div>
      </div>

      <Details product={product} />

      {collection ? <CollectionBand collection={collection} /> : null}

      {look.length > 0 ? <CompleteTheLook product={product} look={look} /> : null}

      {consider.length > 0 ? <Rail title="You might also consider" products={consider} /> : null}

      <RecentlyViewed exclude={product.slug} />
    </>
  );
}
