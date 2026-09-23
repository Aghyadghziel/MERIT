import { collections, products, stories } from '@/lib/catalog';

export type Hit =
  | { kind: 'product'; slug: string; title: string; meta: string; image: string; price: number; compareAt?: number }
  | { kind: 'collection'; slug: string; title: string; meta: string; image: string }
  | { kind: 'story'; slug: string; title: string; meta: string; image: string };

export const SUGGESTED = [
  'Tailoring', 'Wool coat', 'Wide trouser', 'Cashmere', 'Foundation AW26', 'Runway 01',
];

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

/** A small weighted match — name beats category beats description. */
function score(haystacks: [string, number][], q: string) {
  let total = 0;
  for (const [text, weight] of haystacks) {
    const t = norm(text);
    if (t.startsWith(q)) total += weight * 3;
    else if (t.includes(q)) total += weight;
  }
  return total;
}

export function search(query: string): { products: Hit[]; other: Hit[] } {
  const q = norm(query.trim());
  if (q.length < 2) return { products: [], other: [] };

  const p = products
    .map((item) => ({
      item,
      s: score(
        [
          [item.name, 10],
          [item.category, 6],
          [item.collection, 4],
          [item.gender, 3],
          [item.colours.map((c) => c.name).join(' '), 3],
          [item.summary, 2],
          [item.description, 1],
          [item.materials.join(' '), 1],
        ],
        q,
      ),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map<Hit>(({ item }) => ({
      kind: 'product',
      slug: item.slug,
      title: item.name,
      meta: `${item.category} · ${item.gender === 'unisex' ? 'Unisex' : item.gender === 'women' ? "Women's" : "Men's"}`,
      image: item.images[0],
      price: item.price,
      compareAt: item.compareAt,
    }));

  const c = collections
    .filter((item) => score([[item.name, 10], [item.season, 4], [item.statement, 2], [item.note, 1]], q) > 0)
    .slice(0, 3)
    .map<Hit>((item) => ({
      kind: 'collection',
      slug: item.slug,
      title: item.name,
      meta: `${item.season} ${item.year}`,
      image: item.image,
    }));

  const s = stories
    .filter((item) => score([[item.title, 10], [item.kicker, 4], [item.standfirst, 2], [item.body.join(' '), 1]], q) > 0)
    .slice(0, 3)
    .map<Hit>((item) => ({
      kind: 'story',
      slug: item.slug,
      title: item.title,
      meta: `${item.kicker} · ${item.year}`,
      image: item.cover,
    }));

  return { products: p, other: [...c, ...s] };
}

export const hrefOf = (hit: Hit) =>
  hit.kind === 'product'
    ? `/products/${hit.slug}`
    : hit.kind === 'collection'
      ? `/collections/${hit.slug}`
      : `/editorial/${hit.slug}`;

const RECENT_KEY = 'merit:searches';

export function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function pushRecent(q: string) {
  const t = q.trim();
  if (t.length < 2) return;
  try {
    const next = [t, ...readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
}
