import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/commerce/ListingPage';
import { collections, getCollection, products } from '@/lib/catalog';

export const dynamicParams = false;
export const generateStaticParams = () => collections.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<'/collections/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug as never);
  if (!collection) return {};
  return {
    title: `${collection.name} — ${collection.season} ${collection.year}`,
    description: collection.note,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.name} — ${collection.season} ${collection.year}`,
      description: collection.note,
      images: [{ url: `/img/${collection.image}.webp` }],
    },
  };
}

export default async function CollectionPage({ params }: PageProps<'/collections/[slug]'>) {
  const { slug } = await params;
  const collection = getCollection(slug as never);
  if (!collection) notFound();

  const pool = products.filter((p) => p.collection === collection.slug);

  return (
    <ListingPage
      pool={pool}
      eyebrow={`${collection.season} ${collection.year}`}
      title={collection.name}
      description={collection.note}
      campaign={{
        image: collection.image,
        kicker: `${collection.name} — ${collection.season} ${collection.year}`,
        alt: `${collection.name}, ${collection.season} ${collection.year}`,
      }}
    />
  );
}
