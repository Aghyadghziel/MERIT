import type { Collection, Product, Story } from '@/lib/catalog';
import { collections, getProduct, products, stories } from '@/lib/catalog';

/**
 * Presentation data for the storytelling pages: how pictures are cropped,
 * which frames make a lookbook, which sentence becomes a pull quote. Nothing
 * here adds a claim — every word shown comes from the catalogue, and every
 * quote is checked against the text it is drawn from.
 */

// ─── Pictures ──────────────────────────────────────────────────────────────

/** Landscape masters. Everything else is a 4:5 portrait, bar one square. */
const WIDE = new Set([
  'atelier-basting-wide',
  'campaign-atrium-wide',
  'campaign-foundation-wide',
  'campaign-rule-line-wide',
  'manifesto-rail',
  'runway-01',
]);

export type Pic = { src: string; width: number; height: number };

export function pic(name: string): Pic {
  if (WIDE.has(name)) return { src: `/img/${name}.webp`, width: 2560, height: 1440 };
  if (name === 'statement-detail') return { src: `/img/${name}.webp`, width: 1400, height: 1400 };
  return { src: `/img/${name}.webp`, width: 1400, height: 1750 };
}

export const isWide = (name: string) => WIDE.has(name);

/** What each editorial picture shows, for screen readers. Descriptions only. */
const ALT: Record<string, string> = {
  'campaign-rule-line-wide': 'A model in a pale cropped jacket and trousers against a brown plaster wall.',
  'campaign-rule-line': 'A model in a pale cropped jacket and trousers walking past a brown plaster wall.',
  'campaign-atrium-wide': 'Close crop of an ivory double-breasted coat worn open over a navy knit, one hand at the lapel.',
  'campaign-atrium': 'A model in an ivory double-breasted coat over a navy knit, head bowed.',
  'campaign-foundation-wide': 'A figure in an olive jacket and trousers, lit low against a dark ground.',
  'campaign-foundation': 'A figure in an olive jacket and trousers, lit low against a dark ground.',
  'cat-essentials': 'A model in a white shirt and wide stone trousers, seated on a stool against a brown backdrop.',
  'runway-01': 'A model on the runway in a pale draped dress and a knotted scarf, the audience in shadow.',
  'atelier-basting-wide': 'A navy jacket on a tailor’s dummy, held together with white basting stitches.',
  'atelier-basting': 'A navy jacket on a tailor’s dummy, held together with white basting stitches.',
  'blazer-rule-2': 'Black and white: a model in a pale suit, seated on a bentwood chair.',
  'statement-detail': 'Close detail of a grey wool coat and its tie belt.',
  'trench-gallery-1': 'Black and white: a model in a trench coat, hair caught by the wind.',
  'material-silk': 'Pale cloth folded in soft light.',
  'material-wool': 'Close texture of a grey wool cloth.',
  'material-linen': 'Close texture of natural linen.',
  'blazer-archive-1': 'A model seen from behind in a dark check blazer.',
  'manifesto-rail': 'Empty white hangers on a steel rail.',
  'jacket-rule-m-1': 'Shirts and jackets hanging on a rail.',
};

export const alt = (name: string) => ALT[name] ?? '';

// ─── Poster type ───────────────────────────────────────────────────────────

/**
 * Advance widths of the display face at weight 600 and -0.055em tracking,
 * measured in the browser (Inter Tight, standing in for Neue Haas Grotesk).
 * They let a poster word fill its container in CSS alone — no measuring after
 * load, so nothing jumps. Re-measure if the face changes.
 */
const EM: Record<string, number> = {
  A: 0.631, B: 0.565, C: 0.651, D: 0.632, E: 0.515, F: 0.493, G: 0.662, H: 0.651, I: 0.182,
  J: 0.468, K: 0.585, L: 0.474, M: 0.816, N: 0.649, O: 0.683, P: 0.551, Q: 0.683, R: 0.558,
  S: 0.557, T: 0.567, U: 0.641, V: 0.631, W: 0.917, X: 0.598, Y: 0.612, Z: 0.56,
  0: 0.575, 1: 0.33, 2: 0.529, 3: 0.559, 4: 0.573, 5: 0.539, 6: 0.554, 7: 0.484, 8: 0.555, 9: 0.554,
  ' ': 0.156, ':': 0.227, ',': 0.242, '.': 0.227, '-': 0.373, '&': 0.569, "'": 0.234,
};

/**
 * A font size that sets `text` in capitals across the full width of the
 * nearest `@container`, capped so a short word does not swallow the screen.
 * Box-based and a little generous, for type that shares its line.
 */
export function posterSize(text: string, cap = '38svh') {
  const em = [...text.toUpperCase()].reduce((w, c) => w + (EM[c] ?? 0.62), 0) * 1.012;
  return `min(calc(100cqi / ${em.toFixed(3)}), ${cap})`;
}

/**
 * The words that stand alone as posters, measured by their ink rather than
 * their advances: where the first stroke starts and the last one ends, in em,
 * kerning included (A–T alone takes an eighth of an em out of FOUNDATION).
 * The trailing tracking falls outside the box, and a letter like X reaches
 * past it, so advances cannot say where a word visibly ends.
 */
const INK: Record<string, [left: number, right: number]> = {
  COLLECTIONS: [0.034, 6.113],
  EDITORIAL: [0.052, 4.424],
  FOUNDATION: [0.052, 5.688],
  ATRIUM: [0.006, 3.31],
  INDEX: [0.052, 2.621],
  'RUNWAY 01': [0.052, 4.93],
};

/**
 * The same, for the Arabic words that stand as posters, in IBM Plex Sans
 * Arabic at 600 (Arabic is never tracked): where the first stroke starts and
 * the last one ends, measured from the right, since the word runs that way.
 */
const INK_AR: Record<string, [start: number, end: number]> = {
  // The page names, as src/i18n/ar/editorial.ts gives them for Collections and Editorial.
  'المجموعات': [0.064, 4.492],
  'المجلة': [0.064, 2.575],
};

const ARABIC = /[\u0600-\u06FF]/;
export const isArabic = (text: string) => ARABIC.test(text);

/**
 * Size and optical offset for a poster word: the first stroke on the column's
 * starting edge and the last on its far edge, with nothing to measure after
 * load. A Latin word (a collection name) is always set left to right, even on
 * an Arabic page; an Arabic word right to left. An unmeasured word falls back
 * to its advances.
 */
export function posterFit(
  text: string,
  cap = '38svh',
): { fontSize: string; flatSize: string; marginInlineStart: string; dir: 'ltr' | 'rtl' } {
  const arabic = isArabic(text);
  const dir = arabic ? 'rtl' : 'ltr';
  const size = (em: number) => `min(calc(100cqi / ${em.toFixed(4)}), ${cap})`;
  // Arabic pages never track (letters must join), and that rule reaches a
  // Latin name set on them too: without its -0.055em after every letter but
  // the last, the same word runs that much wider, so it gets its own size.
  const untrack = arabic ? 0 : TRACK * Math.max(0, [...text].length - 1);
  const ink = arabic ? INK_AR[text] : INK[text.toUpperCase()];
  if (!ink) {
    // Arabic runs narrower per character than the Latin capitals.
    const em = arabic
      ? [...text].length * 0.5
      : [...text.toUpperCase()].reduce((w, c) => w + (EM[c] ?? 0.62), 0) * 1.012;
    return { fontSize: size(em), flatSize: size(em + untrack), marginInlineStart: '0', dir };
  }
  const [left, right] = ink;
  const em = (right - left) * 1.002;
  return { fontSize: size(em), flatSize: size(em + untrack), marginInlineStart: `-${left}em`, dir };
}

/** The display tracking the Latin measurements above include. */
const TRACK = 0.055;

// ─── Text ──────────────────────────────────────────────────────────────────

/** Whole sentences: split after a full stop that a capital, or an Arabic letter, follows. */
export const sentences = (text: string) => text.split(/(?<=[.!?؟])\s+(?=[A-Z\u0600-\u06FF])/).map((s) => s.trim()).filter(Boolean);

/** Chosen lines, each a verbatim sentence of the story it belongs to. */
const QUOTES: Record<string, string> = {
  'the-rule-line': 'The restriction was the point.',
  'atrium-twelve-rooms': 'An atrium is a room that is also a route.',
  'runway-01-riyadh': 'There was no music. The only sound was the floor.',
  'on-making-the-basted-jacket': 'Everything after that is subtraction.',
};

/**
 * The pull quote for a story. A chosen line is used only if it still appears
 * word for word in the body; otherwise the shortest whole sentence stands in,
 * so the quote can never say something the story does not.
 */
export function pullQuote(story: Story, chosen: string | null = QUOTES[story.slug] ?? null): string | null {
  const body = story.body.join(' ');
  if (chosen && body.includes(chosen)) return chosen;
  const pool = story.body.flatMap(sentences).filter((s) => s.length >= 24 && s.length <= 110);
  return pool.sort((a, b) => a.length - b.length)[0] ?? null;
}

// ─── Collections ───────────────────────────────────────────────────────────

/** Landscape crops for full-bleed covers. Portrait covers stay for phones. */
const WIDE_COVER: Partial<Record<string, string>> = {
  foundation: 'campaign-foundation-wide',
  atrium: 'campaign-atrium-wide',
};

export const coverWide = (c: Collection) => WIDE_COVER[c.slug] ?? c.image;

/** How a collection's cover sits behind its type, per crop. */
export const COVER_POSITION: Partial<Record<string, string>> = {
  index: 'object-[50%_6%]',
  'runway-01': 'object-[46%_center]',
};

export type Look = { product: Product; image: string };

/**
 * The lookbook, frame by frame: the product each frame sells and the picture
 * that shows it best, chosen by eye from that product's own photographs —
 * none with another house's mark on it, and no two neighbours alike.
 */
const LOOKS: Record<string, [slug: string, image: string][]> = {
  foundation: [
    ['atrium-wool-coat', 'coat-atrium-1'],
    ['rule-single-breasted-blazer', 'blazer-rule-1'],
    ['meridian-belted-coat', 'coat-meridian-2'],
    ['margin-cashmere-crew', 'knit-margin-1'],
    ['meridian-overcoat', 'coat-overcoat-2'],
    ['stone-tailored-vest', 'vest-stone-2'],
  ],
  atrium: [
    ['gallery-trench', 'trench-gallery-2'],
    ['plane-slip-dress', 'dress-plane-1'],
    ['pivot-mule', 'shoe-pivot-1'],
    ['plinth-derby', 'shoe-derby-1'],
  ],
  index: [
    ['quiet-poplin-shirt', 'shirt-quiet-3'],
    ['quiet-oxford-shirt', 'shirt-oxford-m-1'],
    ['column-pleated-trouser', 'trouser-pleat-m-1'],
    ['column-wide-trouser', 'trouser-column-3'],
    ['axis-structured-bag', 'bag-axis-1'],
    ['hairline-chain', 'chain-hairline-1'],
  ],
  'runway-01': [['archive-check-blazer', 'blazer-archive-1']],
};

export function looksFor(c: Collection): Look[] {
  const chosen = (LOOKS[c.slug] ?? [])
    .map(([slug, image]) => {
      const product = getProduct(slug);
      return product && product.collection === c.slug ? { product, image } : null;
    })
    .filter((l): l is Look => l !== null);
  if (chosen.length) return chosen;
  return products
    .filter((p) => p.collection === c.slug)
    .slice(0, 6)
    .map((product) => ({ product, image: product.images[0] }));
}

/**
 * The story that belongs with a collection: one that names it. A story that
 * only sells a few of its pieces is about something else, so it is not shown
 * as this collection's story.
 */
export function storyFor(c: Collection): Story | undefined {
  return stories.find((s) => `${s.title} ${s.standfirst}`.includes(c.name));
}

export const collectionIndex = (slug: string) => collections.findIndex((c) => c.slug === slug);
export const storyIndex = (slug: string) => stories.findIndex((s) => s.slug === slug);

export const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A collection's season as every page prints it (pass t() to print it in the
 * reader's language): "Autumn Winter 2026",
 * "Runway 2026", and "Permanent" alone, since a permanent range has no year.
 */
export const collectionSeason = (c: { season: string; year: number }, t: (s: string) => string = same) =>
  c.season === 'Permanent' ? t(c.season) : `${t(c.season)} ${c.year}`;

/** "Autumn Winter 2026", or just "2026" where the season repeats the kicker. */
export const seasonOf = (s: { season: string; year: number; kicker?: string }, t: (s: string) => string = same) =>
  s.season === s.kicker ? String(s.year) : `${t(s.season)} ${s.year}`;

function same(s: string) {
  return s;
}
