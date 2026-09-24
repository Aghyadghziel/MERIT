import type { Category, CollectionSlug, Product } from '@/lib/catalog';
import { isSoldOut, products, related } from '@/lib/catalog';

/**
 * Where a piece sits on the body. A look is one piece per slot, so a coat is
 * never "completed" by a second coat.
 */
const SLOT: Record<Category, 'outer' | 'top' | 'bottom' | 'acc'> = {
  Outerwear: 'outer',
  Tailoring: 'outer',
  Knitwear: 'top',
  Shirting: 'top',
  Trousers: 'bottom',
  Dresses: 'bottom',
  Accessories: 'acc',
  Footwear: 'acc',
};

/**
 * Pieces to wear with this one, chosen from the catalogue: one per remaining
 * slot, from the same collection where there is one, and never sold out. A
 * unisex piece takes the gender of the first garment picked, so the look reads
 * as one person dressed rather than a mixed rail.
 */
export function completeLook(p: Product, count = 3): Product[] {
  const own = SLOT[p.category];
  const order = (['top', 'bottom', 'outer', 'acc'] as const).filter((s) => s !== own);
  const pool = products.filter((r) => r.slug !== p.slug && !isSoldOut(r));
  let gender = p.gender === 'unisex' ? null : p.gender;
  const picks: Product[] = [];

  for (const slot of order) {
    const pick = pool
      .filter((r) => SLOT[r.category] === slot && !picks.includes(r))
      .filter((r) => gender === null || r.gender === gender || r.gender === 'unisex')
      .map((r) => ({ r, score: (r.collection === p.collection ? 2 : 0) + (r.gender === gender ? 1 : 0) }))
      .sort((a, b) => b.score - a.score)[0]?.r;
    if (!pick) continue;
    picks.push(pick);
    if (gender === null && pick.gender !== 'unisex') gender = pick.gender;
    if (picks.length === count) break;
  }
  return picks;
}

/** The catalogue's own "related" ranking, minus the look and the other gender. */
export function alsoConsider(p: Product, exclude: Product[], count = 8): Product[] {
  return related(p, products.length)
    .filter((r) => !exclude.includes(r))
    .filter((r) => p.gender === 'unisex' || r.gender === p.gender || r.gender === 'unisex')
    .slice(0, count);
}

/**
 * The campaign picture behind each collection band: a wide frame for desktop,
 * a tall one for phones, and where the subject sits in each.
 *
 * Foundation's wide frame is cropped to the torso: across a full-bleed band it
 * reads as a field of corduroy with no one in it. The tall frame has the whole
 * figure, so desktop uses it too, held near the top so the head and the open
 * collar sit above the poster type.
 */
export const BAND: Record<CollectionSlug, { wide: string; tall: string; posWide: string; posTall: string }> = {
  foundation: { wide: 'campaign-foundation', tall: 'campaign-foundation', posWide: '50% 4%', posTall: '50% 30%' },
  atrium: { wide: 'campaign-atrium-wide', tall: 'campaign-atrium', posWide: '50% 45%', posTall: '50% 40%' },
  index: { wide: 'cat-essentials', tall: 'cat-essentials', posWide: '50% 28%', posTall: '50% 30%' },
  'runway-01': { wide: 'runway-01', tall: 'runway-01', posWide: '50% 30%', posTall: '80% 40%' },
};
