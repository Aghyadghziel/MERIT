import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nothing personal lives here, but these pages have no value in an index.
      disallow: ['/cart', '/checkout', '/account', '/wishlist', '/search'],
    },
    sitemap: `${BRAND.domain}/sitemap.xml`,
  };
}
