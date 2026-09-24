import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';
import { collections, products, stories } from '@/lib/catalog';
import { localePath } from '@/i18n/config';

type Entry = MetadataRoute.Sitemap[number];

/**
 * Every page twice: the English at its bare path and the Arabic under /ar,
 * each listing the other (and itself) as hreflang alternates, with English
 * as the x-default.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string) => `${BRAND.domain}${path}`;
  const now = new Date();

  const fixed: [string, number, Entry['changeFrequency']][] = [
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

  const pages: [string, number, Entry['changeFrequency']][] = [
    ...fixed,
    ...products.map((p) => [`/products/${p.slug}`, 0.8, 'weekly'] as [string, number, Entry['changeFrequency']]),
    ...collections.map((c) => [`/collections/${c.slug}`, 0.7, 'monthly'] as [string, number, Entry['changeFrequency']]),
    ...stories.map((s) => [`/editorial/${s.slug}`, 0.6, 'monthly'] as [string, number, Entry['changeFrequency']]),
  ];

  return pages.flatMap(([path, priority, changeFrequency]) => {
    const en = at(path);
    const ar = at(localePath(path, 'ar'));
    const alternates = { languages: { en, ar, 'x-default': en } };
    return [
      { url: en, lastModified: now, changeFrequency, priority, alternates },
      { url: ar, lastModified: now, changeFrequency, priority, alternates },
    ];
  });
}
