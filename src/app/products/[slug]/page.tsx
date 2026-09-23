import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/commerce/Gallery';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { ProductPanel } from '@/components/commerce/ProductPanel';
import { RecentlyViewed } from '@/components/commerce/RecentlyViewed';
import { Icon } from '@/components/ui/Icon';
import { BRAND } from '@/lib/brand';
import { getProduct, isSoldOut, products, related } from '@/lib/catalog';

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.summary} ${product.materials[0]}. ${product.madeIn}.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — ${BRAND.name}`,
      description: product.summary,
      images: [{ url: `/img/${product.images[0]}.webp`, width: 1400, height: 1750, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const sold = isSoldOut(product);
  const siblings = related(product, 4);
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: product.gender === 'men' ? 'Men' : product.gender === 'women' ? 'Women' : 'Accessories', href: product.gender === 'men' ? '/men' : '/women' },
    { name: product.category, href: `${product.gender === 'men' ? '/men' : '/women'}?category=${encodeURIComponent(product.category)}` },
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

      <div className="page pt-(--nav-h)">
        <nav aria-label="Breadcrumb" className="py-5">
          <ol className="label-sm flex flex-wrap items-center gap-2 text-mute">
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-2">
                {i > 0 ? <Icon name="chevR" className="h-3 w-3" /> : null}
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-ink">{c.name}</span>
                ) : (
                  <Link href={c.href} className="hover:text-ink">{c.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid-page pb-(--section-sm)">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <Gallery images={product.images} name={`${product.name}, ${product.colours[0].name}`} />
          </div>

          <div className="col-span-4 mt-10 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-0">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <ProductPanel product={product} />
            </div>
          </div>
        </div>
      </div>

      {siblings.length > 0 ? (
        <section className="page section-y-sm" aria-labelledby="related-title">
          <div className="rule-t pt-4">
            <h2 id="related-title" className="label">You might also consider</h2>
          </div>
          <div className="mt-10">
            <ProductGrid products={siblings} columns={4} />
          </div>
        </section>
      ) : null}

      <RecentlyViewed exclude={product.slug} />
    </>
  );
}
