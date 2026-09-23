import { CATEGORY_ORDER } from '@/lib/nav';
import type { Category, CollectionSlug, Product, SizeSystem } from '@/lib/catalog';
import { collections, isSoldOut, SIZE_SYSTEM_LABEL, sizeSystemOf } from '@/lib/catalog';

export type SortKey = 'featured' | 'new' | 'price-asc' | 'price-desc';

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'new', label: 'Newest' },
  { key: 'price-asc', label: 'Price, low to high' },
  { key: 'price-desc', label: 'Price, high to low' },
];

export type Filters = {
  category: string[];
  size: string[];
  colour: string[];
  collection: string[];
  fit: string[];
  /** Price bands, as "min-max" in SAR. */
  price: string[];
  availability: string[];
};

export const EMPTY: Filters = {
  category: [], size: [], colour: [], collection: [], fit: [], price: [], availability: [],
};

export const PRICE_BANDS = [
  { key: '0-1000', label: 'Under 1,000' },
  { key: '1000-2500', label: '1,000 – 2,500' },
  { key: '2500-4000', label: '2,500 – 4,000' },
  { key: '4000-99999', label: 'Over 4,000' },
];

export const FIT_LABELS: Record<string, string> = {
  women: "Women's",
  men: "Men's",
  unisex: 'Unisex',
};

/** Every value that actually exists in the given set of products. */
export function facets(pool: Product[]) {
  const cats = new Set<string>();
  const sizes = new Map<SizeSystem, Set<string>>();
  const cols = new Map<string, string>();
  const colls = new Set<string>();
  const fits = new Set<string>();

  for (const p of pool) {
    cats.add(p.category);
    const system = sizeSystemOf(p);
    if (!sizes.has(system)) sizes.set(system, new Set());
    p.sizes.forEach((s) => sizes.get(system)!.add(s));
    p.colours.forEach((c) => cols.set(c.name, c.hex));
    colls.add(p.collection);
    fits.add(p.gender);
  }

  return {
    category: CATEGORY_ORDER.filter((c) => cats.has(c)) as Category[],
    size: (['apparel', 'jacket', 'waist', 'shoe', 'one'] as SizeSystem[])
      .filter((sys) => sizes.has(sys))
      .map((sys) => ({
        system: sys,
        label: SIZE_SYSTEM_LABEL[sys],
        values: [...sizes.get(sys)!].sort(sizeOrder).map((v) => ({ key: `${sys}:${v}`, label: v })),
      })),
    colour: [...cols].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name)),
    collection: collections.filter((c) => colls.has(c.slug)).map((c) => ({ slug: c.slug, name: c.name })),
    fit: (['women', 'men', 'unisex'] as const).filter((f) => fits.has(f)),
  };
}

const LETTERS = ['XS', 'S', 'M', 'L', 'XL'];
function sizeOrder(a: string, b: string) {
  const ai = LETTERS.indexOf(a);
  const bi = LETTERS.indexOf(b);
  if (ai !== -1 || bi !== -1) {
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }
  const an = Number(a);
  const bn = Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
  return a.localeCompare(b);
}

export function apply(pool: Product[], f: Filters, sort: SortKey) {
  let out = pool.filter((p) => {
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.collection.length && !f.collection.includes(p.collection)) return false;
    if (f.fit.length && !f.fit.includes(p.gender)) return false;
    if (f.size.length) {
      const system = sizeSystemOf(p);
      if (!p.sizes.some((s) => f.size.includes(`${system}:${s}`))) return false;
    }
    if (f.colour.length && !p.colours.some((c) => f.colour.includes(c.name))) return false;
    if (f.price.length) {
      const hit = f.price.some((band) => {
        const [min, max] = band.split('-').map(Number);
        return p.price >= min && p.price < max;
      });
      if (!hit) return false;
    }
    if (f.availability.length) {
      const sold = isSoldOut(p);
      if (f.availability.includes('in-stock') && sold) return false;
      if (f.availability.includes('sale') && !p.compareAt) return false;
    }
    return true;
  });

  const rank = (p: Product) =>
    (p.status === 'new' ? 0 : 1) + (isSoldOut(p) ? 4 : 0);

  out = [...out];
  if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
  else if (sort === 'new') out.sort((a, b) => rank(a) - rank(b));
  else out.sort((a, b) => (isSoldOut(a) ? 1 : 0) - (isSoldOut(b) ? 1 : 0));
  return out;
}

export function countActive(f: Filters) {
  return Object.values(f).reduce((n, v) => n + v.length, 0);
}

export type Chip = { group: keyof Filters; value: string; label: string };

export function chips(f: Filters): Chip[] {
  const out: Chip[] = [];
  const label = (group: keyof Filters, value: string) => {
    if (group === 'price') return PRICE_BANDS.find((b) => b.key === value)?.label ?? value;
    if (group === 'collection') return collections.find((c) => c.slug === value)?.name ?? value;
    if (group === 'fit') return FIT_LABELS[value] ?? value;
    if (group === 'availability') return value === 'in-stock' ? 'In stock' : 'On sale';
    if (group === 'size') {
      const [system, label] = value.split(':');
      return system === 'one' ? 'One size' : `${SIZE_SYSTEM_LABEL[system as SizeSystem]} ${label}`;
    }
    return value;
  };
  (Object.keys(f) as (keyof Filters)[]).forEach((group) => {
    f[group].forEach((value) => out.push({ group, value, label: label(group, value) }));
  });
  return out;
}

export function toggle(f: Filters, group: keyof Filters, value: string): Filters {
  const has = f[group].includes(value);
  return { ...f, [group]: has ? f[group].filter((v) => v !== value) : [...f[group], value] };
}

/** Filters survive a reload and a shared link. */
export function toQuery(f: Filters, sort: SortKey) {
  const q = new URLSearchParams();
  (Object.keys(f) as (keyof Filters)[]).forEach((g) => {
    if (f[g].length) q.set(g, f[g].join(','));
  });
  if (sort !== 'featured') q.set('sort', sort);
  return q.toString();
}

export function fromQuery(params: URLSearchParams): { filters: Filters; sort: SortKey } {
  const f: Filters = { ...EMPTY };
  (Object.keys(EMPTY) as (keyof Filters)[]).forEach((g) => {
    const v = params.get(g);
    if (v) f[g] = v.split(',').filter(Boolean);
  });
  const s = params.get('sort') as SortKey | null;
  return { filters: f, sort: s && SORTS.some((x) => x.key === s) ? s : 'featured' };
}

export const collectionOf = (slug: CollectionSlug) => collections.find((c) => c.slug === slug)!;
