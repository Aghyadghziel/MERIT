import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';
import { collections, products, stories } from '@/lib/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string) => `${BRAND.domain}${path}`;
  const now = new Date();

  const fixed: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['/', 1, 'weekly'],
    ['/new', 0.9, 'weekly'],
    ['/women', 0.9, 'weekly'],
    ['/men', 0.9, 'weekly'],
    ['/collections', 0.8, 'monthly'],
    ['/editorial', 0.7, 'monthly'],
    ['/about', 0.6, 'yearly'],
    ['/stores', 0.6, 'yearly'],
    ['/contact', 0.5, 'yearly'],
    ['/faq', 0.5, 'yearly'],
    ['/size-guide', 0.5, 'yearly'],
    ['/shipping-returns', 0.5, 'yearly'],
    ['/privacy', 0.3, 'yearly'],
    ['/terms', 0.3, 'yearly'],
  ];

  return [
    ...fixed.map(([path, priority, changeFrequency]) => ({
      url: at(path), lastModified: now, changeFrequency, priority,
    })),
    ...products.map((p) => ({
      url: at(`/products/${p.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: at(`/collections/${c.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7,
    })),
    ...stories.map((s) => ({
      url: at(`/editorial/${s.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6,
    })),
  ];
}
