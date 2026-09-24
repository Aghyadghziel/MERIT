import type { Product } from '@/lib/catalog';
import type { Locale } from './config';
import { PRODUCTS_AR } from './ar/products';

/** The product copy that is written per product (the rest goes through t()). */
export type ProductCopy = Partial<Pick<Product, 'name' | 'summary' | 'description' | 'fit' | 'materials' | 'care' | 'madeIn' | 'modelNote'>>;

/**
 * A product in the reader's language: its written copy swapped for the
 * Arabic, field by field (anything untranslated stays English). Slugs, prices,
 * sizes, images and stock never change.
 */
export function localizeProduct<P extends Product>(p: P, locale: Locale): P {
  if (locale !== 'ar') return p;
  const ar = PRODUCTS_AR[p.slug];
  return ar ? { ...p, ...ar } : p;
}
