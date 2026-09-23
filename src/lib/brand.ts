/**
 * MERIT — wordmark geometry.
 *
 * Five letters drawn as monoline strokes on a 100-unit cap height, except the
 * fourth: the I is a plain rule that overshoots the cap line above and below.
 * That rule is the brand's whole idea — the structure showing through the word
 * — and it detaches to work on its own as the symbol.
 *
 * tools/logo/build.mjs renders the same numbers to static SVG files.
 */

export const CAP = 100;
export const STROKE = 8;
export const OVERSHOOT = 18;
const GAP = 28;

const LETTERS = {
  // M — two stems and a vee that stops short of the baseline.
  m: { w: 72, d: 'M4 100V0l32 58L68 0v100' },
  // E — the middle bar is shorter than the other two.
  e: { w: 52, d: 'M52 0H4v100h48M4 50h40' },
  // R — a half-circle bowl on a straight stem, with the leg leaving the bowl.
  r: { w: 58, d: 'M4 100V0h26a26 26 0 0 1 0 52H4m24 0 28 48' },
  // I — the rule.
  i: { w: 8, d: `M4 ${-OVERSHOOT}v${CAP + OVERSHOOT * 2}` },
  // T — one bar, one stem.
  t: { w: 64, d: 'M0 0h64M32 0v100' },
} as const;

const ORDER = ['m', 'e', 'r', 'i', 't'] as const;

function lay(order: readonly (keyof typeof LETTERS)[]) {
  let x = 0;
  const parts = order.map((key) => {
    const { w, d } = LETTERS[key];
    const at = x;
    x += w + GAP;
    return { key, d, x: at };
  });
  return { parts, width: x - GAP };
}

const wordmark = lay(ORDER);
const symbol = lay(['m', 'i']);

/** The full word. Height includes the rule's overshoot. */
export const WORDMARK = {
  paths: wordmark.parts,
  width: wordmark.width,
  viewBox: `${-STROKE / 2} ${-OVERSHOOT - STROKE / 2} ${wordmark.width + STROKE} ${CAP + OVERSHOOT * 2 + STROKE}`,
};

/** M and the rule — the mark for favicons, app icons and tight spaces. */
export const SYMBOL = {
  paths: symbol.parts,
  width: symbol.width,
  viewBox: `${-STROKE / 2} ${-OVERSHOOT - STROKE / 2} ${symbol.width + STROKE} ${CAP + OVERSHOOT * 2 + STROKE}`,
};

export const BRAND = {
  name: 'MERIT',
  legal: 'Merit Atelier',
  city: 'Riyadh',
  country: 'Saudi Arabia',
  founded: 2019,
  line: 'Quiet structure, expressive movement.',
  domain: 'https://merit.example',
  email: 'clients@merit.example',
  phone: '+966 11 000 0000',
  instagram: 'merit.atelier',
} as const;
