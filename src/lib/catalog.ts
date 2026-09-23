/**
 * MERIT catalogue — placeholder data for a fictional label.
 *
 * Everything here is invented: the products, the mills, the prices and the
 * stock. Nothing claims to be a real garment or a real supplier. Names come
 * from one lexicon on purpose — printing and architecture — so the range reads
 * as a range: Rule, Column, Margin, Baseline, Folio, Plane, Atrium, Meridian.
 */

export type Gender = 'women' | 'men' | 'unisex';
export type Status = 'new' | 'limited' | 'runway' | 'sale' | 'sold-out';

export type Colour = { name: string; hex: string };

export type Product = {
  slug: string;
  name: string;
  /** The line shown under the name on a card — category and collection. */
  category: Category;
  gender: Gender;
  collection: CollectionSlug;
  price: number;
  /** Set only when the product is marked down; the struck-through price. */
  compareAt?: number;
  colours: Colour[];
  sizes: string[];
  /** "Colour/Size" keys that cannot be bought. Everything else is in stock. */
  unavailable?: string[];
  /** Sizes with three or fewer left; the size button says so. */
  low?: string[];
  status?: Status;
  images: string[];
  /** One line for the card and the meta description. */
  summary: string;
  description: string;
  fit: string;
  materials: string[];
  care: string[];
  madeIn: string;
  /** Shown under the size selector, as on a real fitting note. */
  modelNote?: string;
};

export type Category =
  | 'Outerwear'
  | 'Tailoring'
  | 'Knitwear'
  | 'Shirting'
  | 'Trousers'
  | 'Dresses'
  | 'Accessories'
  | 'Footwear';

export type CollectionSlug = 'foundation' | 'atrium' | 'index' | 'runway-01';

const APPAREL = ['XS', 'S', 'M', 'L', 'XL'];
const MENS = ['44', '46', '48', '50', '52'];
const WAIST = ['26', '28', '30', '32', '34'];
const MENS_WAIST = ['30', '32', '34', '36', '38'];
const ONE = ['One size'];

export const products: Product[] = [
  // ─── Women · Outerwear ───────────────────────────────────────────────────
  {
    slug: 'atrium-wool-coat',
    name: 'Atrium Wool Coat',
    category: 'Outerwear',
    gender: 'women',
    collection: 'foundation',
    price: 4850,
    status: 'new',
    colours: [
      { name: 'Fog', hex: '#C8C8C4' },
      { name: 'Ink', hex: '#161614' },
      { name: 'Camel', hex: '#B08659' },
    ],
    sizes: APPAREL,
    unavailable: ['Camel/XS', 'Camel/XL', 'Ink/XS'],
    low: ['Fog/XL'],
    images: ['coat-atrium-1', 'coat-atrium-4', 'coat-atrium-2', 'coat-atrium-3'],
    summary: 'Double-faced wool, cut straight and left unlined.',
    description:
      'A coat built from a single double-faced cloth, which means no lining and no interfacing — the shape is held by the weave alone. The shoulder is dropped by two centimetres from a standard block so it sits over knitwear, and the seams are bound by hand in matching thread.',
    fit: 'Generous through the body. Take your usual size for a straight line, one down if you prefer it closer.',
    materials: ['92% virgin wool, 8% cashmere — double-faced, 780g', 'Horn buttons', 'Bound seams, unlined'],
    care: ['Dry clean only', 'Cool iron under a pressing cloth', 'Store on a broad hanger'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 178cm and wears a size S.',
  },
  {
    slug: 'meridian-belted-coat',
    name: 'Meridian Belted Coat',
    category: 'Outerwear',
    gender: 'women',
    collection: 'foundation',
    price: 5200,
    colours: [
      { name: 'Camel', hex: '#B08659' },
      { name: 'Ecru', hex: '#E4DCCB' },
    ],
    sizes: APPAREL,
    unavailable: ['Ecru/XS'],
    low: ['Camel/XS', 'Ecru/XL'],
    images: ['coat-meridian-1', 'coat-meridian-2', 'coat-meridian-3', 'coat-meridian-4'],
    summary: 'A wrap coat with no closure but the belt.',
    description:
      'There are no buttons. The coat wraps deep across the front and is held by a self belt that runs through the side seams, so the line stays unbroken from shoulder to hem. Cut long enough to cover a midi skirt.',
    fit: 'Cut close at the shoulder, wide below. True to size.',
    materials: ['80% wool, 20% alpaca — brushed melton', 'Cupro lining', 'Self belt, 4cm'],
    care: ['Dry clean only', 'Brush with the nap after wear'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 175cm and wears a size S.',
  },
  {
    slug: 'gallery-trench',
    name: 'Gallery Trench',
    category: 'Outerwear',
    gender: 'women',
    collection: 'atrium',
    price: 3300,
    compareAt: 4400,
    status: 'sale',
    colours: [
      { name: 'Chalk', hex: '#F5F3EF' },
      { name: 'Stone', hex: '#BDB6A9' },
    ],
    sizes: APPAREL,
    unavailable: ['Chalk/XS', 'Chalk/S', 'Stone/XS'],
    images: ['trench-gallery-1', 'trench-gallery-2', 'trench-gallery-3', 'material-wool'],
    summary: 'Dry cotton gabardine, cut long and narrow.',
    description:
      'The trench reduced to its structure: storm flap, throat latch and belt, with the epaulettes and D-rings removed. Woven from a dry gabardine that creases rather than drapes, and softens with wear.',
    fit: 'Narrow. Size up to wear over tailoring.',
    materials: ['100% cotton gabardine', 'Corozo buttons', 'Half-lined in cupro'],
    care: ['Dry clean only', 'Do not tumble dry'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 177cm and wears a size S.',
  },

  // ─── Women · Tailoring ───────────────────────────────────────────────────
  {
    slug: 'rule-single-breasted-blazer',
    name: 'Rule Single-Breasted Blazer',
    category: 'Tailoring',
    gender: 'women',
    collection: 'foundation',
    price: 3400,
    status: 'new',
    colours: [
      { name: 'Chalk', hex: '#F5F3EF' },
      { name: 'Ink', hex: '#161614' },
      { name: 'Olive', hex: '#6B6B4E' },
    ],
    sizes: APPAREL,
    unavailable: ['Olive/XS', 'Olive/XL'],
    low: ['Chalk/M'],
    images: ['blazer-rule-1', 'blazer-rule-2', 'blazer-rule-3', 'blazer-rule-4'],
    summary: 'A half-canvassed jacket with a long, clean lapel.',
    description:
      'The house jacket. Half-canvassed so the chest keeps its shape, with a single button set low and a lapel drawn long to lengthen the line. The sleeve head is set without padding.',
    fit: 'Close at the shoulder, straight through the body.',
    materials: ['74% wool, 26% linen — woven in Biella, Italy', 'Horsehair canvas chest piece', 'Bemberg cupro lining'],
    care: ['Dry clean only', 'Rest on a shaped hanger between wears'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 178cm and wears a size S.',
  },
  {
    slug: 'archive-check-blazer',
    name: 'Archive Check Blazer',
    category: 'Tailoring',
    gender: 'women',
    collection: 'runway-01',
    price: 4600,
    status: 'runway',
    colours: [{ name: 'Graphite Check', hex: '#4A4A47' }],
    sizes: APPAREL,
    unavailable: ['Graphite Check/XS', 'Graphite Check/XL'],
    low: ['Graphite Check/S', 'Graphite Check/L'],
    images: ['blazer-archive-1', 'blazer-archive-2', 'material-fold'],
    summary: 'Runway 01, look eleven. Forty made.',
    description:
      'The oversized check jacket from the first runway presentation, reproduced in the same cloth and the same count. Cut two sizes large on the original block, with the pocket flaps set at an angle taken from the men’s pattern.',
    fit: 'Deliberately oversized. Take your usual size.',
    materials: ['100% wool — glen check, woven in Yorkshire', 'Unlined body, lined sleeves'],
    care: ['Dry clean only'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 179cm and wears a size S.',
  },
  {
    slug: 'stone-tailored-vest',
    name: 'Stone Tailored Vest',
    category: 'Tailoring',
    gender: 'women',
    collection: 'foundation',
    price: 1950,
    colours: [
      { name: 'Stone', hex: '#BDB6A9' },
      { name: 'Ink', hex: '#161614' },
    ],
    sizes: APPAREL,
    low: ['Stone/S'],
    images: ['vest-stone-1', 'vest-stone-2', 'material-linen'],
    summary: 'A long vest that works as a layer or on its own.',
    description:
      'Cut from the blazer block with the sleeves removed and the armhole lowered, so it layers over a shirt without pulling. Five buttons, a deep V, and a back belt to draw the waist.',
    fit: 'Straight and long. True to size.',
    materials: ['74% wool, 26% linen', 'Cupro back and lining'],
    care: ['Dry clean only'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 175cm and wears a size S.',
  },

  // ─── Women · Trousers, Shirting, Knitwear, Dresses ───────────────────────
  {
    slug: 'column-wide-trouser',
    name: 'Column Wide Trouser',
    category: 'Trousers',
    gender: 'women',
    collection: 'index',
    price: 1680,
    colours: [
      { name: 'Oat', hex: '#DED5C6' },
      { name: 'Ink', hex: '#161614' },
      { name: 'Umber', hex: '#6E4E36' },
    ],
    sizes: WAIST,
    unavailable: ['Umber/26', 'Umber/34'],
    low: ['Oat/28'],
    images: ['trouser-column-1', 'trouser-column-2', 'trouser-column-3', 'trouser-column-4'],
    summary: 'High-rise, wide from the hip, left to fall.',
    description:
      'The trouser the rest of the range is drawn around. High at the waist, wide from the hip, and long enough to break once over the shoe. The waistband is faced rather than lined so it sits flat under a shirt, and the hem is deep enough to hold the weight of the cloth.',
    fit: 'Wide. Sized by waist in inches — see the size guide for the full table.',
    materials: ['78% virgin wool, 22% linen — woven in Biella, Italy', 'Bemberg cupro pocketing', 'Hook-and-bar closure'],
    care: ['Dry clean only', 'Cool iron on the reverse', 'Store folded over the bar'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 178cm and wears a 28. Inside leg 82cm.',
  },
  {
    slug: 'quiet-poplin-shirt',
    name: 'Quiet Poplin Shirt',
    category: 'Shirting',
    gender: 'women',
    collection: 'index',
    price: 980,
    colours: [
      { name: 'Chalk', hex: '#F5F3EF' },
      { name: 'Fog', hex: '#C8C8C4' },
    ],
    sizes: APPAREL,
    low: ['Chalk/XS'],
    images: ['shirt-quiet-1', 'shirt-quiet-2', 'shirt-quiet-3', 'shirt-quiet-4'],
    summary: 'Compact poplin, cut long over the hip.',
    description:
      'A shirt with the placket dropped and the collar built low, so it sits flat under a jacket. The poplin is compact enough to hold a crease through the day and is washed once before cutting so it will not shrink away from you.',
    fit: 'Relaxed, long at the back. Take your usual size.',
    materials: ['100% compact cotton poplin, 120 thread', 'Mother-of-pearl buttons', 'Single-needle side seams'],
    care: ['Machine wash 30°', 'Warm iron while damp', 'Do not tumble dry'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 176cm and wears a size S.',
  },
  {
    slug: 'margin-cashmere-crew',
    name: 'Margin Cashmere Crew',
    category: 'Knitwear',
    gender: 'women',
    collection: 'foundation',
    price: 2450,
    status: 'new',
    colours: [
      { name: 'Bone', hex: '#EDE9E0' },
      { name: 'Ash', hex: '#8E8C86' },
      { name: 'Oxide', hex: '#7B3B2C' },
    ],
    sizes: APPAREL,
    unavailable: ['Oxide/XS'],
    low: ['Bone/M', 'Oxide/L'],
    images: ['knit-margin-1', 'knit-margin-2', 'knit-margin-3', 'knit-margin-4'],
    summary: 'Four-ply cashmere, knitted to shape.',
    description:
      'Knitted to shape rather than cut from panels, which removes the seams at the shoulder and lets the rib sit where it should. Four-ply, heavy enough to wear alone in a cold room.',
    fit: 'Easy through the body, close at the cuff.',
    materials: ['100% Inner Mongolian cashmere, four-ply', 'Fully fashioned', 'Rib at neck, cuff and hem'],
    care: ['Hand wash cold, or dry clean', 'Dry flat', 'Store folded'],
    madeIn: 'Made in Scotland',
    modelNote: 'Model is 177cm and wears a size S.',
  },
  {
    slug: 'baseline-rib-knit',
    name: 'Baseline Rib Knit',
    category: 'Knitwear',
    gender: 'women',
    collection: 'index',
    price: 1290,
    colours: [
      { name: 'Bone', hex: '#EDE9E0' },
      { name: 'Graphite', hex: '#4A4A47' },
      { name: 'Camel', hex: '#B08659' },
    ],
    sizes: APPAREL,
    images: ['knit-baseline-1', 'knit-baseline-2', 'material-fold'],
    summary: 'A fine rib that holds its shape.',
    description:
      'A 2×2 rib in extra-fine merino, knitted at a tension tight enough to keep its line after a full day. The neck is bound rather than rolled so it will not stretch.',
    fit: 'Close. Size up for a straighter line.',
    materials: ['100% extra-fine merino wool, 18.5 micron', 'Bound neckline'],
    care: ['Machine wash cold on wool cycle', 'Dry flat'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 175cm and wears a size S.',
  },
  {
    slug: 'folio-cardigan',
    name: 'Folio Cardigan',
    category: 'Knitwear',
    gender: 'women',
    collection: 'foundation',
    price: 2780,
    status: 'limited',
    colours: [{ name: 'Oxide', hex: '#7B3B2C' }],
    sizes: APPAREL,
    unavailable: ['Oxide/XS', 'Oxide/XL'],
    low: ['Oxide/S'],
    images: ['cardigan-folio-1', 'cardigan-folio-2', 'knit-margin-3'],
    summary: 'Hand-framed in a single colour. Sixty made.',
    description:
      'A cable cardigan framed by hand on a domestic gauge, which limits what can be made in a season. The cable is drawn wide and shallow so it reads as texture rather than pattern.',
    fit: 'Oversized, dropped shoulder.',
    materials: ['70% lambswool, 30% alpaca', 'Hand-framed', 'Corozo buttons'],
    care: ['Hand wash cold', 'Dry flat, reshape while damp'],
    madeIn: 'Made in Scotland',
    modelNote: 'Model is 174cm and wears a size S.',
  },
  {
    slug: 'plane-slip-dress',
    name: 'Plane Slip Dress',
    category: 'Dresses',
    gender: 'women',
    collection: 'atrium',
    price: 1575,
    compareAt: 2100,
    status: 'sale',
    colours: [
      { name: 'Ink', hex: '#161614' },
      { name: 'Ecru', hex: '#E4DCCB' },
    ],
    sizes: APPAREL,
    unavailable: ['Ecru/XS', 'Ecru/S', 'Ecru/M', 'Ink/XS'],
    low: ['Ink/L'],
    images: ['dress-plane-1', 'dress-plane-2', 'dress-plane-3', 'material-silk'],
    summary: 'Bias-cut silk, two seams and a hem.',
    description:
      'Cut on the true bias from a heavy sandwashed silk, so the dress follows the body without clinging to it. Two seams, an adjustable strap, and a hem weighted to hang straight.',
    fit: 'Follows the body. Take your usual size.',
    materials: ['100% sandwashed silk, 19 momme', 'French seams', 'Adjustable strap'],
    care: ['Dry clean only', 'Do not wring'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 176cm and wears a size S.',
  },
  {
    slug: 'pivot-mule',
    name: 'Pivot Mule',
    category: 'Footwear',
    gender: 'women',
    collection: 'atrium',
    price: 1850,
    status: 'sold-out',
    colours: [{ name: 'Ink', hex: '#161614' }],
    sizes: ['36', '37', '38', '39', '40', '41'],
    unavailable: [
      'Ink/36', 'Ink/37', 'Ink/38', 'Ink/39', 'Ink/40', 'Ink/41',
    ],
    images: ['shoe-pivot-1', 'material-fold'],
    summary: 'A square-toed mule on a low stacked heel.',
    description:
      'Built on a square last with a 45mm stacked heel, lined and soled in vegetable-tanned leather. The vamp is cut low so the shoe stays on without a strap.',
    fit: 'Sized in EU. Runs true; take a half size up for a wider foot.',
    materials: ['Vegetable-tanned calf leather', 'Leather lining and sole', '45mm stacked heel'],
    care: ['Wipe with a soft cloth', 'Use a shoe tree between wears'],
    madeIn: 'Made in Italy',
  },

  // ─── Men ─────────────────────────────────────────────────────────────────
  {
    slug: 'meridian-overcoat',
    name: 'Meridian Overcoat',
    category: 'Outerwear',
    gender: 'men',
    collection: 'foundation',
    price: 5400,
    status: 'new',
    colours: [
      { name: 'Camel', hex: '#B08659' },
      { name: 'Graphite', hex: '#4A4A47' },
    ],
    sizes: MENS,
    unavailable: ['Camel/44', 'Graphite/52'],
    low: ['Camel/50'],
    images: ['coat-overcoat-1', 'coat-overcoat-2', 'coat-overcoat-3'],
    summary: 'A single-breasted overcoat, cut to the knee.',
    description:
      'Drawn from a 1950s chesterfield block with the waist suppression removed, so the coat falls straight from a natural shoulder. Long enough to cover a jacket, narrow enough to wear over a knit.',
    fit: 'Straight. Take your jacket size.',
    materials: ['85% wool, 15% cashmere — 690g melton', 'Horn buttons', 'Full cupro lining'],
    care: ['Dry clean only', 'Brush with the nap'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 186cm and wears a size 48.',
  },
  {
    slug: 'ledger-field-jacket',
    name: 'Ledger Field Jacket',
    category: 'Outerwear',
    gender: 'men',
    collection: 'atrium',
    price: 3600,
    colours: [
      { name: 'Olive', hex: '#6B6B4E' },
      { name: 'Stone', hex: '#BDB6A9' },
    ],
    sizes: MENS,
    low: ['Olive/48'],
    images: ['jacket-field-1', 'jacket-field-2', 'material-silk'],
    summary: 'Four pockets, dry cotton, no lining.',
    description:
      'A field jacket with the drawcord removed and the pockets set flat rather than bellowed, which keeps the front clean. Unlined, so it creases with wear and keeps the record.',
    fit: 'Relaxed. Take your usual size.',
    materials: ['100% dry cotton canvas, 320g', 'Unlined', 'Corozo buttons'],
    care: ['Machine wash 30°', 'Line dry', 'Warm iron'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 184cm and wears a size 48.',
  },
  {
    slug: 'rule-two-button-jacket',
    name: 'Rule Two-Button Jacket',
    category: 'Tailoring',
    gender: 'men',
    collection: 'foundation',
    price: 3900,
    colours: [
      { name: 'Navy', hex: '#26303F' },
      { name: 'Fog', hex: '#C8C8C4' },
    ],
    sizes: MENS,
    unavailable: ['Fog/44', 'Fog/52'],
    low: ['Navy/50'],
    images: ['jacket-rule-m-1', 'jacket-rule-m-2', 'material-linen'],
    summary: 'Half-canvassed, soft shoulder, two buttons.',
    description:
      'A jacket with a soft Neapolitan shoulder and a half canvas, finished with patch pockets and a three-roll-two front. Built to be worn open as often as closed.',
    fit: 'Close through the chest, straight at the hip.',
    materials: ['74% wool, 26% linen — woven in Biella, Italy', 'Horsehair canvas', 'Half-lined'],
    care: ['Dry clean only', 'Rest on a shaped hanger'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 185cm and wears a size 48.',
  },
  {
    slug: 'column-pleated-trouser',
    name: 'Column Pleated Trouser',
    category: 'Trousers',
    gender: 'men',
    collection: 'index',
    price: 1480,
    colours: [
      { name: 'Oat', hex: '#DED5C6' },
      { name: 'Ink', hex: '#161614' },
      { name: 'Olive', hex: '#6B6B4E' },
    ],
    sizes: MENS_WAIST,
    unavailable: ['Olive/30', 'Olive/38'],
    images: ['trouser-pleat-m-1', 'trouser-pleat-m-2', 'material-linen'],
    summary: 'A single forward pleat, high at the waist.',
    description:
      'One deep forward pleat, an extended waistband and a wide leg that tapers slightly from the knee. Finished with a 4cm turn-up, which can be removed on request.',
    fit: 'Wide. Sized by waist in inches.',
    materials: ['78% virgin wool, 22% linen', 'Cupro pocketing', 'Extended waistband, hook-and-bar'],
    care: ['Dry clean only', 'Cool iron on the reverse'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 186cm and wears a 32. Inside leg 84cm.',
  },
  {
    slug: 'quiet-oxford-shirt',
    name: 'Quiet Oxford Shirt',
    category: 'Shirting',
    gender: 'men',
    collection: 'index',
    price: 890,
    colours: [
      { name: 'Chalk', hex: '#F5F3EF' },
      { name: 'Fog', hex: '#C8C8C4' },
    ],
    sizes: APPAREL,
    low: ['Chalk/M'],
    images: ['shirt-oxford-m-1', 'shirt-oxford-m-2', 'material-silk'],
    summary: 'Washed oxford with an unlined collar.',
    description:
      'A heavy oxford, garment-washed so it is soft from the first wear. The collar is unlined and cut with a long point, which lets it roll rather than stand.',
    fit: 'Relaxed. Take your usual size.',
    materials: ['100% cotton oxford, 140g', 'Unlined collar', 'Single-needle seams'],
    care: ['Machine wash 30°', 'Warm iron while damp'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 183cm and wears a size M.',
  },
  {
    slug: 'margin-merino-crew',
    name: 'Margin Merino Crew',
    category: 'Knitwear',
    gender: 'men',
    collection: 'foundation',
    price: 1850,
    colours: [
      { name: 'Ink', hex: '#161614' },
      { name: 'Bone', hex: '#EDE9E0' },
      { name: 'Ash', hex: '#8E8C86' },
    ],
    sizes: APPAREL,
    unavailable: ['Ash/XS'],
    low: ['Ink/L'],
    images: ['knit-merino-m-1', 'knit-merino-m-2', 'knit-margin-3'],
    summary: 'Fine merino, fully fashioned, no seams at the shoulder.',
    description:
      'Knitted to shape in an extra-fine merino, with a shallow crew neck and a rib deep enough to sit over a trouser waistband. Light enough to wear under a jacket.',
    fit: 'Close. Size up to wear over a shirt.',
    materials: ['100% extra-fine merino wool, 18.5 micron', 'Fully fashioned'],
    care: ['Machine wash cold on wool cycle', 'Dry flat'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 185cm and wears a size M.',
  },
  {
    slug: 'plinth-derby',
    name: 'Plinth Derby',
    category: 'Footwear',
    gender: 'men',
    collection: 'atrium',
    price: 2400,
    colours: [{ name: 'Ink', hex: '#161614' }],
    sizes: ['40', '41', '42', '43', '44', '45'],
    unavailable: ['Ink/40', 'Ink/45'],
    low: ['Ink/42'],
    images: ['shoe-derby-1', 'material-fold'],
    summary: 'A blake-stitched derby on a rounded last.',
    description:
      'Three eyelets on a rounded last, blake-stitched so the sole stays close to the foot. Built in a box calf that takes a polish and keeps it.',
    fit: 'Sized in EU. Runs true.',
    materials: ['Box calf leather', 'Leather lining', 'Blake-stitched leather sole'],
    care: ['Wipe with a soft cloth', 'Use a shoe tree between wears'],
    madeIn: 'Made in Italy',
  },

  {
    slug: 'baseline-tee',
    name: 'Baseline Tee',
    category: 'Knitwear',
    gender: 'men',
    collection: 'index',
    price: 490,
    colours: [
      { name: 'Ink', hex: '#161614' },
      { name: 'Bone', hex: '#EDE9E0' },
    ],
    sizes: APPAREL,
    low: ['Bone/L'],
    images: ['outfits/base', 'outfits/preview-tee'],
    summary: 'Heavy jersey, cut boxy, bound at the neck.',
    description:
      'The tee the outerwear is drawn over. A 240g organic cotton jersey with a bound crew neck that will not stretch, cut boxy through the body and short in the sleeve so a jacket sits cleanly over it.',
    fit: 'Boxy. Take your usual size.',
    materials: ['100% organic cotton jersey, 240g', 'Bound neckline', 'Single-needle hems'],
    care: ['Machine wash 30°', 'Line dry'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 185cm and wears a size M.',
  },
  {
    slug: 'margin-overshirt',
    name: 'Margin Overshirt',
    category: 'Outerwear',
    gender: 'men',
    collection: 'foundation',
    price: 2150,
    status: 'new',
    colours: [
      { name: 'Stone', hex: '#BDB6A9' },
      { name: 'Olive', hex: '#6B6B4E' },
    ],
    sizes: APPAREL,
    unavailable: ['Olive/XS'],
    low: ['Stone/M'],
    images: ['shirt-oxford-m-2', 'material-linen'],
    summary: 'A wool overshirt that does the work of a jacket.',
    description:
      'A shirt in a brushed wool flannel heavy enough to be a jacket, with two chest pockets and a proper collar. Worn open over the tee or buttoned to the neck.',
    fit: 'Relaxed. Size down to wear buttoned.',
    materials: ['85% wool, 15% cashmere — brushed flannel, 420g', 'Corozo buttons', 'Unlined'],
    care: ['Dry clean only', 'Brush with the nap'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 185cm and wears a size M.',
  },
  {
    slug: 'plane-technical-jacket',
    name: 'Plane Technical Jacket',
    category: 'Outerwear',
    gender: 'men',
    collection: 'foundation',
    price: 1850,
    status: 'new',
    colours: [
      { name: 'Sand', hex: '#C9B99A' },
      { name: 'Ink', hex: '#161614' },
    ],
    sizes: APPAREL,
    unavailable: ['Ink/XS'],
    low: ['Sand/M'],
    images: ['outfits/jacket-01', 'outfits/preview-technical'],
    summary: 'A zip blouson in bonded cotton, cut short and square.',
    description:
      'A blouson in a bonded cotton twill that holds its shape without padding, finished with a two-way zip and an elasticated hem and cuff. Cut short so it ends at the waist of the trouser and square so it sits flat over the tee.',
    fit: 'Boxy and short. Take your usual size.',
    materials: ['Bonded cotton twill, 300g', 'Two-way zip', 'Elasticated hem and cuff'],
    care: ['Machine wash 30°', 'Line dry'],
    madeIn: 'Made in Portugal',
    modelNote: 'Model is 185cm and wears a size M.',
  },
  {
    slug: 'axis-leather-jacket',
    name: 'Axis Leather Jacket',
    category: 'Outerwear',
    gender: 'men',
    collection: 'foundation',
    price: 3600,
    status: 'new',
    colours: [{ name: 'Ink', hex: '#161614' }],
    sizes: APPAREL,
    unavailable: ['Ink/XS', 'Ink/XL'],
    low: ['Ink/L'],
    images: ['outfits/jacket-02', 'outfits/preview-leather'],
    summary: 'Lambskin, cut like the tee, lined in cupro.',
    description:
      'The tee\'s pattern in a vegetable-tanned lambskin, with a two-way zip and nothing else on the front. Lined in cupro so it slides on over a sleeve and softens with wear rather than creasing.',
    fit: 'Boxy. Take your usual size.',
    materials: ['Vegetable-tanned lambskin', 'Cupro lining', 'Two-way zip'],
    care: ['Specialist leather clean only', 'Store on a broad hanger'],
    madeIn: 'Made in Italy',
    modelNote: 'Model is 185cm and wears a size M.',
  },

  // ─── Accessories ─────────────────────────────────────────────────────────
  {
    slug: 'axis-structured-bag',
    name: 'Axis Structured Bag',
    category: 'Accessories',
    gender: 'unisex',
    collection: 'index',
    price: 2950,
    colours: [
      { name: 'Bone', hex: '#EDE9E0' },
      { name: 'Ink', hex: '#161614' },
    ],
    sizes: ONE,
    low: ['Bone/One size'],
    images: ['bag-axis-1', 'bag-axis-2', 'bag-axis-3'],
    summary: 'A rectangle with a handle and nothing else.',
    description:
      'Cut from four panels of vegetable-tanned leather and held square by its own thickness. One internal pocket, a detachable strap, and a turn-lock machined from solid brass.',
    fit: '28cm wide, 20cm high, 11cm deep. Fits a 13-inch laptop.',
    materials: ['Vegetable-tanned calf leather', 'Solid brass hardware', 'Suede lining'],
    care: ['Wipe with a dry cloth', 'Keep out of direct sun', 'Store in the dust bag'],
    madeIn: 'Made in Italy',
  },
  {
    slug: 'knot-leather-bag',
    name: 'Knot Leather Bag',
    category: 'Accessories',
    gender: 'unisex',
    collection: 'foundation',
    price: 2450,
    status: 'new',
    colours: [{ name: 'Ink', hex: '#161614' }],
    sizes: ONE,
    images: ['bag-knot-1', 'bag-knot-2'],
    summary: 'Soft nappa, gathered at a single point.',
    description:
      'One piece of nappa, gathered and knotted at the handle so the bag takes its shape from what is inside it. Unlined, unstructured, and light enough to fold away.',
    fit: '34cm at the widest point. Shoulder carry.',
    materials: ['Soft nappa leather', 'Unlined', 'Magnetic closure'],
    care: ['Wipe with a dry cloth', 'Store flat in the dust bag'],
    madeIn: 'Made in Italy',
  },
  {
    slug: 'hairline-chain',
    name: 'Hairline Chain',
    category: 'Accessories',
    gender: 'unisex',
    collection: 'index',
    price: 720,
    colours: [{ name: 'Brass', hex: '#B79862' }],
    sizes: ONE,
    low: ['Brass/One size'],
    images: ['chain-hairline-1', 'material-fold'],
    summary: 'A flat snake chain, 42cm.',
    description:
      'A flat snake chain in gold-plated brass, weighted to sit at the collarbone and lie flat against the skin. The clasp is machined to the same width as the chain, so the line does not break.',
    fit: '42cm. Adjustable to 40cm.',
    materials: ['Gold-plated brass, 3 micron', 'Machined clasp'],
    care: ['Remove before swimming', 'Store in the pouch provided'],
    madeIn: 'Made in Italy',
  },
  {
    slug: 'signal-scarf',
    name: 'Signal Scarf',
    category: 'Accessories',
    gender: 'unisex',
    collection: 'foundation',
    price: 860,
    colours: [
      { name: 'Ecru', hex: '#E4DCCB' },
      { name: 'Olive', hex: '#6B6B4E' },
    ],
    sizes: ONE,
    images: ['scarf-signal-1', 'scarf-signal-2'],
    summary: 'Silk and wool, hand-rolled at the edge.',
    description:
      'A square in a silk-wool blend with enough weight to hold a knot. The edge is rolled and stitched by hand, which is why no two are exactly the same size.',
    fit: '90 × 90cm.',
    materials: ['70% silk, 30% wool', 'Hand-rolled edge'],
    care: ['Dry clean only', 'Store flat'],
    madeIn: 'Made in Italy',
  },
];

// ─── Collections ───────────────────────────────────────────────────────────

export type Collection = {
  slug: CollectionSlug;
  name: string;
  season: string;
  year: number;
  statement: string;
  note: string;
  image: string;
  detail: string;
};

export const collections: Collection[] = [
  {
    slug: 'foundation',
    name: 'Foundation',
    season: 'Autumn Winter',
    year: 2026,
    statement: 'Everything else is drawn from here.',
    note: 'Twelve pieces that set the proportions for the rest of the range — a coat, a jacket, a trouser, a knit. The cloth is heavier than last season and the colour has been pulled back to four.',
    image: 'campaign-foundation',
    detail: 'material-wool',
  },
  {
    slug: 'atrium',
    name: 'Atrium',
    season: 'Spring Summer',
    year: 2026,
    statement: 'Built for the hour before the heat.',
    note: 'A lighter register: dry cotton, sandwashed silk, and tailoring taken off the canvas. Shown in a courtyard in Riyadh at six in the morning.',
    image: 'campaign-atrium',
    detail: 'material-silk',
  },
  {
    slug: 'index',
    name: 'Index',
    season: 'Permanent',
    year: 2026,
    statement: 'Made every season, changed only when it is wrong.',
    note: 'The pieces that do not move. Cut from the same patterns each year, in the same cloth, and re-issued rather than redesigned.',
    image: 'cat-essentials',
    detail: 'material-linen',
  },
  {
    slug: 'runway-01',
    name: 'Runway 01',
    season: 'Runway',
    year: 2026,
    statement: 'Twenty-four looks, one room, no music.',
    note: 'The first presentation. Held in a stripped office floor on King Fahd Road with the blinds up, so the clothes were seen in daylight.',
    image: 'runway-01',
    detail: 'statement-detail',
  },
];

// ─── Editorial ─────────────────────────────────────────────────────────────

export type Story = {
  slug: string;
  title: string;
  kicker: string;
  season: string;
  year: number;
  readingTime: number;
  cover: string;
  images: string[];
  standfirst: string;
  body: string[];
  /** Products the story links out to, by slug. */
  shop: string[];
};

export const stories: Story[] = [
  {
    slug: 'the-rule-line',
    title: 'The Rule Line',
    kicker: 'Campaign',
    season: 'Autumn Winter',
    year: 2026,
    readingTime: 4,
    cover: 'campaign-rule-line',
    images: ['campaign-rule-line-wide', 'blazer-rule-2', 'statement-detail'],
    standfirst:
      'The Foundation campaign was shot against a single wall over two afternoons, with the light left exactly as it was found.',
    body: [
      'There is one wall in the building on Al Urubah Road that holds the afternoon for about forty minutes. We shot the whole of Foundation against it, twice, and used nothing else — no reflector, no second set-up, no second location.',
      'The restriction was the point. When the light cannot be adjusted, the clothes have to do the work: the fall of a trouser, the way a lapel sits when the shoulder is unpadded, the difference between a cloth that creases and one that drapes. Everything in the frame is either the garment or the wall.',
      'The campaign runs as eleven frames. They are meant to be read in order, the way a contact sheet is read, which is why the crops get tighter as they go — from the full look, to the jacket, to the seam.',
    ],
    shop: ['rule-single-breasted-blazer', 'column-wide-trouser', 'quiet-poplin-shirt'],
  },
  {
    slug: 'atrium-twelve-rooms',
    title: 'Atrium: Twelve Rooms',
    kicker: 'Collection',
    season: 'Spring Summer',
    year: 2026,
    readingTime: 5,
    cover: 'campaign-atrium',
    images: ['campaign-atrium-wide', 'trench-gallery-1', 'material-silk'],
    standfirst:
      'A spring collection organised around a courtyard house, and the twelve rooms that open onto it.',
    body: [
      'An atrium is a room that is also a route. You pass through it more often than you sit in it, and it sets the temperature of everything around it. The collection borrows that: pieces that are not the point of an outfit but decide how the rest of it behaves.',
      'The cloth was chosen for the hour before the heat. Dry cotton that creases and stays creased. Sandwashed silk with enough weight to hang straight. Tailoring taken off the canvas entirely, so a jacket folds into a bag without a mark.',
      'Twelve looks, photographed in a courtyard at six in the morning, when the walls are still cold.',
    ],
    shop: ['gallery-trench', 'plane-slip-dress', 'ledger-field-jacket'],
  },
  {
    slug: 'runway-01-riyadh',
    title: 'Runway 01, Riyadh',
    kicker: 'Runway',
    season: 'Autumn Winter',
    year: 2026,
    readingTime: 3,
    cover: 'runway-01',
    images: ['runway-01', 'blazer-archive-1', 'manifesto-rail'],
    standfirst:
      'Twenty-four looks shown on a stripped office floor on King Fahd Road, in daylight, without music.',
    body: [
      'We took a floor that had been empty for two years and removed nothing except the carpet. The blinds went up at four. The show started at half past, when the light was still direct, and ran for eleven minutes.',
      'There was no music. The only sound was the floor. Several people said afterwards that it made them look at the clothes for longer than they wanted to, which is the most useful review we have had.',
      'Six pieces from the twenty-four are made for sale, in the counts shown. The rest stay in the archive.',
    ],
    shop: ['archive-check-blazer', 'atrium-wool-coat'],
  },
  {
    slug: 'on-making-the-basted-jacket',
    title: 'On Making: The Basted Jacket',
    kicker: 'Atelier',
    season: 'Atelier',
    year: 2026,
    readingTime: 6,
    cover: 'atelier-basting',
    images: ['atelier-basting-wide', 'jacket-rule-m-1', 'material-linen'],
    standfirst:
      'Why the Rule jacket is still assembled in white thread before it is assembled properly.',
    body: [
      'Before a jacket is sewn it is basted: held together with long white stitches so it can be tried, pulled apart, and corrected. The thread is meant to be removed. We photograph it because the basted stage is when the jacket is most honest about how it was made.',
      'A half-canvassed chest is three layers — cloth, horsehair canvas, domette — that have to move independently and still return to the same shape. The canvas is attached with a pad stitch worked by hand, at roughly eleven stitches to the inch. It takes about forty minutes per side and it is the reason the chest holds its line after five years.',
      'Everything after that is subtraction. The basting comes out, the seams are pressed open over a ham, and the jacket stops looking like a set of instructions.',
    ],
    shop: ['rule-two-button-jacket', 'rule-single-breasted-blazer'],
  },
];

// ─── Lookups ───────────────────────────────────────────────────────────────

export const categories: Category[] = [
  'Outerwear', 'Tailoring', 'Knitwear', 'Shirting', 'Trousers', 'Dresses', 'Accessories', 'Footwear',
];

/**
 * Sizes come from four different systems and they collide: a 36 is a women's
 * shoe and a men's waist. Facets key on the system as well as the label so
 * "waist 36" never drags a pair of shoes into the results.
 */
export type SizeSystem = 'apparel' | 'jacket' | 'waist' | 'shoe' | 'one';

export const SIZE_SYSTEM_LABEL: Record<SizeSystem, string> = {
  apparel: 'Clothing',
  jacket: 'Jacket',
  waist: 'Waist (in)',
  shoe: 'Shoe (EU)',
  one: 'One size',
};

export function sizeSystemOf(p: Product): SizeSystem {
  if (p.sizes[0] === 'One size') return 'one';
  if (p.category === 'Footwear') return 'shoe';
  if (p.category === 'Trousers') return 'waist';
  if (['XS', 'S', 'M', 'L', 'XL'].includes(p.sizes[0])) return 'apparel';
  return 'jacket';
}

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const getStory = (slug: string) => stories.find((s) => s.slug === slug);

export const isSoldOut = (p: Product) =>
  p.unavailable !== undefined &&
  p.colours.every((c) => p.sizes.every((s) => p.unavailable!.includes(`${c.name}/${s}`)));

export const statusLabel = (p: Product): { text: string; tone: 'ink' | 'oxide' | 'mute' } | null => {
  if (isSoldOut(p)) return { text: 'Sold out', tone: 'mute' };
  if (p.compareAt) return { text: 'Sale', tone: 'oxide' };
  if (p.status === 'runway') return { text: 'Runway', tone: 'ink' };
  if (p.status === 'limited') return { text: 'Limited', tone: 'ink' };
  if (p.status === 'new') return { text: 'New', tone: 'ink' };
  return null;
};

/** Products in the order they should appear on a listing page. */
export const byGender = (gender: Gender | 'all') =>
  gender === 'all'
    ? products
    : products.filter((p) => p.gender === gender || p.gender === 'unisex');

export const newArrivals = () =>
  products.filter((p) => p.status === 'new' || p.collection === 'foundation').slice(0, 8);

export const related = (p: Product, count = 4) =>
  products
    .filter((r) => r.slug !== p.slug)
    .map((r) => ({
      r,
      score:
        (r.collection === p.collection ? 2 : 0) +
        (r.category === p.category ? 1 : 0) +
        (r.gender === p.gender ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.r);
