import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/commerce/Gallery';
import { ProductPanel } from '@/components/commerce/ProductPanel';
import { RecentlyViewed } from '@/components/commerce/RecentlyViewed';
import { BRAND } from '@/lib/brand';
import { getCollection, getProduct, isSoldOut, products } from '@/lib/catalog';
import { localePath } from '@/i18n/config';
import { localizeProduct } from '@/i18n/products';
import { getLocale, getT } from '@/i18n/server';
import { Breadcrumb } from './_parts/Breadcrumb';
import { CollectionBand } from './_parts/CollectionBand';
import { CompleteTheLook } from './_parts/CompleteTheLook';
import { Details } from './_parts/Details';
import { imageKind } from './_parts/media';
import { alsoConsider, completeLook } from './_parts/pairing';
import { Rail } from './_parts/Rail';

export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<'/[lang]/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const found = getProduct(slug);
  if (!found) return {};
  const locale = await getLocale();
  const product = localizeProduct(found, locale);
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
    alternates: {
      canonical: localePath(`/products/${product.slug}`, locale),
      languages: { en: `/products/${product.slug}`, ar: `/ar/products/${product.slug}` },
    },
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
export default async function ProductPage({ params }: PageProps<'/[lang]/products/[slug]'>) {
  const { slug } = await params;
  const found = getProduct(slug);
  if (!found) notFound();
  const locale = await getLocale();
  const t = await getT();
  const product = localizeProduct(found, locale);

  const sold = isSoldOut(product);
  const collection = getCollection(product.collection);
  const look = completeLook(found);
  const consider = alsoConsider(found, look);
  const section = product.gender === 'men' ? '/men' : '/women';
  // Unisex pieces are listed by category alone; "Accessories / Accessories"
  // would say the same thing twice.
  const crumbs = [
    { name: t('Home'), href: '/' },
    ...(product.gender === 'unisex' ? [] : [{ name: t(product.gender === 'men' ? 'Men' : 'Women'), href: section }]),
    { name: t(product.category), href: `${section}?category=${encodeURIComponent(product.category)}` },
    { name: product.name, href: `/products/${product.slug}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        inLanguage: locale,
        description: product.description,
        image: product.images.map((i) => `${BRAND.domain}/img/${i}.webp`),
        sku: product.slug,
        brand: { '@type': 'Brand', name: BRAND.name },
        material: product.materials[0],
        color: product.colours.map((c) => t(c.name)).join(locale === 'ar' ? '، ' : ', '),
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'SAR',
          availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
          url: `${BRAND.domain}${localePath(`/products/${product.slug}`, locale)}`,
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: `${BRAND.domain}${localePath(c.href, locale)}`,
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
              kicker={collection ? `${collection.name} — ${t(collection.season)} ${collection.year}` : undefined}
            />
          </div>
        </div>
      </div>

      <Details product={product} />

      {collection ? <CollectionBand collection={collection} /> : null}

      {look.length > 0 ? (
        <CompleteTheLook product={product} look={look.map((p) => localizeProduct(p, locale))} />
      ) : null}

      {consider.length > 0 ? (
        <Rail title={t('You might also consider')} products={consider.map((p) => localizeProduct(p, locale))} />
      ) : null}

      <RecentlyViewed exclude={product.slug} />
    </>
  );
}
