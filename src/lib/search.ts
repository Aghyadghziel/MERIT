import { collections, products, stories } from '@/lib/catalog';
import type { Locale } from '@/i18n/config';
import { translate } from '@/i18n/dictionary';
import { localizeProduct } from '@/i18n/products';

export type Hit =
  | { kind: 'product'; slug: string; title: string; meta: string; image: string; price: number; compareAt?: number }
  | { kind: 'collection'; slug: string; title: string; meta: string; image: string }
  | { kind: 'story'; slug: string; title: string; meta: string; image: string };

export const SUGGESTED = [
  'Tailoring', 'Wool coat', 'Wide trouser', 'Cashmere', 'Foundation AW26', 'Runway 01',
];

/**
 * The Arabic suggestions: the words an Arabic reader would type, not the
 * English ones translated. Any that finds nothing is dropped by the caller.
 */
const SUGGESTED_AR = ['معطف', 'بليزر', 'بنطلون واسع', 'كشمير', 'الأساس', 'العرض الأول'];

export const suggestedFor = (locale: Locale) => (locale === 'ar' ? SUGGESTED_AR : SUGGESTED);

/**
 * Folded for matching. Latin: lower case, accents off. Arabic: short vowels
 * and tatweel off, the hamza-carrying alefs to a bare alef, ta marbuta to ha
 * and alef maqsura to ya, so "معطف صوفى" finds "معطف صوفي".
 */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064A');

/** Query words, with the Arabic article taken off so "الكشمير" finds "كشمير". */
const words = (q: string) =>
  q.split(/\s+/).filter(Boolean).map((w) => (/^(ال|وال)[\u0600-\u06FF]{2,}/.test(w) ? w.replace(/^و?ال/, '') : w));

/**
 * A small weighted match — name beats category beats description. The whole
 * query scores most; failing that, every word of it found somewhere (in any
 * order, across fields) scores a little, which is how Arabic word order and
 * the article stop getting in the way.
 */
function score(haystacks: [string, number][], q: string) {
  let total = 0;
  const hay = haystacks.map(([text, weight]) => [norm(text), weight] as const);
  for (const [t, weight] of hay) {
    if (t.startsWith(q)) total += weight * 3;
    else if (t.includes(q)) total += weight;
  }
  if (total > 0) return total;
  const ws = words(q);
  if (ws.length < 1 || ws.every((w) => w === q)) return 0;
  let partial = 0;
  for (const w of ws) {
    const best = Math.max(0, ...hay.filter(([t]) => t.includes(w)).map(([, weight]) => weight));
    if (!best) return 0;
    partial += best;
  }
  return partial / 2;
}

export function search(query: string, locale: Locale = 'en'): { products: Hit[]; other: Hit[] } {
  const q = norm(query.trim());
  if (q.length < 2) return { products: [], other: [] };
  const t = (s: string) => translate(locale, s);
  const ar = locale === 'ar';
  // On an Arabic page the English names still match, so a reader can type a
  // collection or product name in Latin letters as it is printed.
  const both = (s: string) => (ar ? `${t(s)} ${s}` : s);

  const p = products
    .map((raw) => {
      const item = localizeProduct(raw, locale);
      return {
        item,
        s: score(
          [
            [item.name, 10],
            [ar ? raw.name : '', 8],
            [both(item.category), 6],
            [both(collections.find((c) => c.slug === item.collection)?.name ?? ''), 4],
            [both(item.gender === 'unisex' ? 'Unisex' : item.gender === 'women' ? 'Women' : 'Men'), 3],
            [item.colours.map((c) => both(c.name)).join(' '), 3],
            [item.summary, 2],
            [item.description, 1],
            [item.materials.join(' '), 1],
          ],
          q,
        ),
      };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map<Hit>(({ item }) => ({
      kind: 'product',
      slug: item.slug,
      title: item.name,
      meta: `${t(item.category)} · ${t(item.gender === 'unisex' ? 'Unisex' : item.gender === 'women' ? "Women's" : "Men's")}`,
      image: item.images[0],
      price: item.price,
      compareAt: item.compareAt,
    }));

  const c = collections
    .filter((item) => score([[both(item.name), 10], [both(item.season), 4], [t(item.statement), 2], [t(item.note), 1]], q) > 0)
    .slice(0, 3)
    .map<Hit>((item) => ({
      kind: 'collection',
      slug: item.slug,
      title: t(item.name),
      meta: `${t(item.season)} ${item.year}`,
      image: item.image,
    }));

  const s = stories
    .filter((item) => score([[both(item.title), 10], [both(item.kicker), 4], [t(item.standfirst), 2], [item.body.map(t).join(' '), 1]], q) > 0)
    .slice(0, 3)
    .map<Hit>((item) => ({
      kind: 'story',
      slug: item.slug,
      title: t(item.title),
      meta: `${t(item.kicker)} · ${item.year}`,
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
