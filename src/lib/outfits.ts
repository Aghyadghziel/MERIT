/**
 * The outfit carousel's image contract.
 *
 * Every outfit is one full-frame picture of the SAME model in the SAME pose,
 * in the same light, at the same scale, on the same plain background. Only the
 * garment differs. The carousel never moves the model: it keeps the base frame
 * on screen and crossfades the others through a mask that covers the torso and
 * arms, so a face or a trouser leg that drifted a pixel between shots is never
 * seen changing.
 *
 * To replace the placeholder figure with photography, supply one file per
 * outfit at the paths below and flip PLACEHOLDER to false. Nothing else changes.
 *
 *   public/img/outfits/base.webp        model, tee, trousers — no jacket
 *   public/img/outfits/jacket-01.webp   same frame, first jacket
 *   public/img/outfits/jacket-02.webp   …
 *
 * Frame:  1200 × 1800 px (2:3), portrait, model centred, feet at ~97% height,
 *         crown at ~8%. Background #F4F2ED, or transparent.
 * Mask:   the region that is allowed to change between frames, as fractions of
 *         the frame. Everything outside it is always drawn from the base.
 */
export const FRAME = {
  width: 1200,
  height: 1800,
  mask: { top: 0.12, bottom: 0.72, left: 0.02, right: 0.98, feather: 0.06 },
} as const;

/** True while the frames are drawn placeholders rather than photographs. */
export const PLACEHOLDER = true;

export type Outfit = {
  /** Product this frame shows; name, price and sizes come from the catalogue. */
  slug: string;
  /** File under /img/outfits/, with extension. */
  file: string;
  /** The colour depicted, which is the colour "Add to bag" adds. */
  colour: string;
  /** Meaningful alternative text for the whole outfit. */
  alt: string;
};

export const outfits: Outfit[] = [
  {
    slug: 'baseline-tee',
    file: 'base.svg',
    colour: 'Bone',
    alt: 'The model in the Baseline Tee in bone and Column trousers in stone, standing square to the camera, arms at the sides.',
  },
  {
    slug: 'meridian-overcoat',
    file: 'jacket-01.svg',
    colour: 'Camel',
    alt: 'The same model and pose, wearing the Meridian Overcoat in camel open over the tee. The coat reaches mid-thigh.',
  },
  {
    slug: 'rule-two-button-jacket',
    file: 'jacket-02.svg',
    colour: 'Navy',
    alt: 'The same model and pose, wearing the Rule Two-Button Jacket in navy, fastened, with the tee showing at the neck.',
  },
  {
    slug: 'ledger-field-jacket',
    file: 'jacket-03.svg',
    colour: 'Olive',
    alt: 'The same model and pose, wearing the Ledger Field Jacket in olive open over the tee, with four patch pockets.',
  },
  {
    slug: 'margin-overshirt',
    file: 'jacket-04.svg',
    colour: 'Stone',
    alt: 'The same model and pose, wearing the Margin Overshirt in stone, unbuttoned over the tee.',
  },
];

/** CSS for the torso mask, shared by the stage and by anything previewing it. */
export function maskStyle(): React.CSSProperties {
  const { top, bottom, left, right, feather } = FRAME.mask;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const vertical = `linear-gradient(to bottom, transparent ${pct(top - feather)}, #000 ${pct(top)}, #000 ${pct(bottom)}, transparent ${pct(bottom + feather)})`;
  const horizontal = `linear-gradient(to right, transparent ${pct(left - feather / 2)}, #000 ${pct(left)}, #000 ${pct(right)}, transparent ${pct(right + feather / 2)})`;
  return {
    WebkitMaskImage: `${vertical}, ${horizontal}`,
    maskImage: `${vertical}, ${horizontal}`,
    WebkitMaskComposite: 'source-in',
    maskComposite: 'intersect',
  };
}
