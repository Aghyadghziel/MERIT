/**
 * The outfit carousel's image contract.
 *
 * Every outfit is one full-frame picture of the SAME model in the SAME pose,
 * in the same light, at the same scale, on a transparent background. Only the
 * garment differs. The carousel never moves the model: it keeps the base frame
 * on screen and crossfades the others through a mask that covers the torso and
 * arms, so a face or a trouser leg that drifted a pixel between shots is never
 * seen changing.
 *
 * The frames are photography-style renders supplied by the client, cut out and
 * normalised to the contract below (figure height, feet line and horizontal
 * centre matched across files). The mask still governs what may change between
 * frames; everything outside it is always drawn from the base.
 *
 *   public/img/outfits/base.webp        model, tee, jeans — no jacket
 *   public/img/outfits/jacket-01.webp   same frame, first jacket
 *   public/img/outfits/jacket-02.webp   …
 *   public/img/outfits/preview-*.webp   the garment alone, flat, shown beside
 *                                       the model in the ring
 *
 * Frame:  1200 × 1800 px (2:3), portrait, model centred, feet at ~97% height,
 *         crown at ~6%. Transparent background.
 * Preview: 900 × 900 px, garment centred, transparent background.
 * Mask:   the region that is allowed to change between frames, as fractions of
 *         the frame. Everything outside it is always drawn from the base.
 */
export const FRAME = {
  width: 1200,
  height: 1800,
  mask: { top: 0.12, bottom: 0.72, left: 0.02, right: 0.98, feather: 0.06 },
} as const;

/** True while the frames are drawn placeholders rather than photographs. */
export const PLACEHOLDER = false;

export type Outfit = {
  /** Product this frame shows; name, price and sizes come from the catalogue. */
  slug: string;
  /** File under /img/outfits/, with extension. */
  file: string;
  /** File under /img/outfits/ for the flat garment shown beside the model. */
  preview: string;
  /** The colour depicted, which is the colour "Add to bag" adds. */
  colour: string;
  /** Meaningful alternative text for the whole outfit. */
  alt: string;
};

export const outfits: Outfit[] = [
  {
    slug: 'baseline-tee',
    file: 'base.webp',
    preview: 'preview-tee.webp',
    colour: 'Ink',
    alt: 'The model in the Baseline Tee in ink and washed grey Column jeans, standing square to the camera, arms at the sides.',
  },
  {
    slug: 'plane-technical-jacket',
    file: 'jacket-01.webp',
    preview: 'preview-technical.webp',
    colour: 'Sand',
    alt: 'The same model and pose, wearing the Plane Technical Jacket in sand, zipped open over the tee.',
  },
  {
    slug: 'axis-leather-jacket',
    file: 'jacket-02.webp',
    preview: 'preview-leather.webp',
    colour: 'Ink',
    alt: 'The same model and pose, wearing the Axis Leather Jacket in ink, open over the tee.',
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
