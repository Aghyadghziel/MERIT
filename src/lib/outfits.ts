/**
 * The Fitting Room's media contract.
 *
 * One model, one pose, one frame. Look 0 is the base still: the tee and the
 * jeans. Every jacket brings two filmed clips — putting it on, taking it off —
 * that start and end on that same standing pose, so any clip can follow any
 * other and the hand-off to a still is invisible.
 *
 * The clips were generated, then stabilised frame by frame onto the base
 * still's figure (head at 5.6%, feet at 96.6% of the frame), flattened, and cut
 * out: they carry an alpha channel, so the model stands on whatever is behind
 * him. Two encodes of each, because no single codec does alpha everywhere:
 *
 *   <clip>.webm        VP9 + alpha   Chrome, Edge, Firefox
 *   <clip>.hevc.mp4    HEVC + alpha  Safari (macOS, iOS)
 *   <clip>-m.*         480 × 720     phones
 *
 * Frame: 2:3. Stills are RGBA WebP of the clip's own last frame.
 * Pipeline and scripts: merit-video-kit/ (outside the repo).
 */
export const FRAME = { width: 1200, height: 1800 } as const;

/**
 * Where the figure sits inside that frame, as fractions of it. Measured from
 * the alpha channel of every frame of all four clips (desktop and phone
 * encodes) and of every still, so it holds for the whole film, not only the
 * pose at rest. The stage is laid out from these numbers rather than from the
 * viewport: the logotype behind him is sized from his height and placed on
 * his body, so the two never drift apart on a wide or a tall screen.
 */
export const FIGURE = {
  /** The highest pixel of his hair in any frame (he rises a little as he dresses). */
  crown: 0.049,
  /** Where his soles meet the floor. */
  floor: 0.962,
  /** How wide the pair of shoes stands, for the contact shadow. */
  stance: 0.26,
  /**
   * The upper chest: the one patch of the frame that is opaque in every
   * frame, whatever his arms and the jacket are doing. The counter of the
   * R in the logotype is centred here so it is always behind him.
   */
  chest: { x: 0.511, y: 0.301 },
  /**
   * The widest the logotype may be, as a multiple of the frame's height, for
   * that counter to stay inside the chest with about ten pixels to spare at
   * full resolution. Any wider and a thin warm-white sliver of it shows past
   * his shoulder at some point in a clip, and reads as a halo.
   */
  logoMax: 1.55,
} as const;

export type Outfit = {
  /** Product this look shows; name, price and sizes come from the catalogue. */
  slug: string;
  /** The colour depicted, which is the colour "Add to bag" adds. */
  colour: string;
  /** Meaningful alternative text for the whole look. */
  alt: string;
  /** The base look only: its still. */
  still?: { file: string; mobile?: string };
  /** A jacket: the flat shot on the rail, and its two clips. */
  jacket?: {
    preview: string;
    /** Clip base names, without size suffix or extension. */
    on: string;
    off: string;
    /** RGBA stills of the on-clip's last frame. */
    dressed: string;
    dressedMobile: string;
  };
};

export const outfits: Outfit[] = [
  {
    slug: 'baseline-tee',
    colour: 'Ink',
    alt: 'The model in the Baseline Tee in ink and washed grey Column jeans, standing square to the camera, arms at his sides.',
    still: { file: 'base.webp', mobile: 'base-m.webp' },
  },
  {
    slug: 'plane-technical-jacket',
    colour: 'Sand',
    alt: 'The same model wearing the Plane Technical Jacket in sand, open over the tee.',
    jacket: {
      preview: 'preview-technical.webp',
      on: 'dress-01',
      off: 'undress-01',
      dressed: 'outfit-01-dressed.webp',
      dressedMobile: 'outfit-01-dressed-m.webp',
    },
  },
  {
    slug: 'axis-leather-jacket',
    colour: 'Ink',
    alt: 'The same model wearing the Axis Leather Jacket in black, open over the tee.',
    jacket: {
      preview: 'preview-leather.webp',
      on: 'dress-02',
      off: 'undress-02',
      dressed: 'outfit-02-dressed.webp',
      dressedMobile: 'outfit-02-dressed-m.webp',
    },
  },
];
