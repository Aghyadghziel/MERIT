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
  /** Phone-sized version of `file` (800×1200), served under 768px. Optional. */
  mobile?: string;
  /**
   * A filmed dressing transition for this garment. When present the carousel
   * plays it instead of animating: the model physically puts the jacket on.
   * `dressed` MUST be the video's own last frame, so the hand-off from video
   * to still is pixel-identical; `start` is its first frame.
   *
   * The clip is pre-processed to the still contract by tools/outfits/video.md:
   * the studio vignette is divided out so the backdrop is flat bone and the
   * rectangle is invisible, and the crop is aligned on the model's head axis
   * so he does not move between still, video and still.
   */
  video?: {
    mp4: string;
    webm?: string;
    /** Phone-sized mp4, served under 768px. */
    mobile?: string;
    /** Taking it off again — the same clip reversed. */
    reverseMp4?: string;
    reverseMobile?: string;
    /** Full-figure still matching the last video frame exactly. */
    dressed: string;
    dressedMobile?: string;
    /** Full-figure still matching the first video frame. */
    start?: string;
    width: number;
    height: number;
  };
  /**
   * The put-on sequence: 6–8 intermediate frames, in order, from "jacket
   * entering behind the shoulders" to "folds settling", NOT including the base
   * or the final worn frame. Same contract as `file`. When absent the carousel
   * uses its fallback: the final frame forms around the model through a
   * shoulder-to-torso clip, a small drop, a breath of scale and a soft shadow.
   */
  frames?: string[];
  /** Phone-sized versions of `frames`, same order. Optional. */
  framesMobile?: string[];
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
    mobile: 'base-m.webp',
    preview: 'preview-tee.webp',
    colour: 'Ink',
    alt: 'The model in the Baseline Tee in ink and washed grey Column jeans, standing square to the camera, arms at the sides.',
  },
  {
    slug: 'plane-technical-jacket',
    file: 'jacket-01.webp',
    mobile: 'jacket-01-m.webp',
    video: {
      mp4: 'dress-01.mp4',
      webm: 'dress-01.webm',
      mobile: 'dress-01-m.mp4',
      reverseMp4: 'undress-01.mp4',
      reverseMobile: 'undress-01-m.mp4',
      dressed: 'outfit-01-dressed.webp',
      dressedMobile: 'outfit-01-dressed-m.webp',
      start: 'outfit-01-start.webp',
      width: 1040,
      height: 1200,
    },
    preview: 'preview-technical.webp',
    colour: 'Sand',
    alt: 'The same model and pose, wearing the Plane Technical Jacket in sand, zipped open over the tee.',
  },
  {
    slug: 'axis-leather-jacket',
    file: 'jacket-02.webp',
    mobile: 'jacket-02-m.webp',
    preview: 'preview-leather.webp',
    colour: 'Ink',
    alt: 'The same model and pose, wearing the Axis Leather Jacket in ink, open over the tee.',
  },
];

/**
 * The clip and its matching still are rectangles of near-bone, not cut-outs.
 * Flattening the studio vignette gets the backdrop to within a few levels of
 * the page, and this dissolves the last of it: the outer band fades out, so
 * there is no edge to see. Applied to BOTH the video and the still it hands
 * off to, or the hand-off would show the mask appearing.
 *
 * The bands are clear of the model — his arms reach the middle 60% at most,
 * his head starts at 5.6% and his shoes end at 96.6% of the frame.
 */
export function edgeFadeStyle(): React.CSSProperties {
  const h = 'linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%)';
  const v = 'linear-gradient(to bottom, transparent 0%, #000 3%, #000 97.5%, transparent 100%)';
  return {
    WebkitMaskImage: `${h}, ${v}`,
    maskImage: `${h}, ${v}`,
    WebkitMaskComposite: 'source-in',
    maskComposite: 'intersect',
  };
}

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
