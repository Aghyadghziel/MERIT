/**
 * The Fitting Room's media contract.
 *
 * One model, one pose, one frame. Look 0 is the base still: the tee and the
 * jeans. Every jacket brings two filmed clips — putting it on, taking it off —
 * that start and end on that same standing pose, so any clip can follow any
 * other and the hand-off to a still is invisible.
 *
 * The clips were generated, then stabilised frame by frame onto the base
 * still's figure (head at 5.6%, feet at 96.6% of the frame) and flattened onto
 * one even studio backdrop, #F4F2EE, with his real floor shadow left in. They
 * are plain H.264, tagged BT.709, and the page shows them inside a framed room
 * cut from that backdrop (see ROOM in the Fitting Room), so no alpha channel
 * is needed and every browser plays the same file:
 *
 *   <clip>.mp4       720 × 1080
 *   <clip>-m.mp4     480 × 720     phones at 1x, or saving data
 *
 * A phone with a dense screen gets the 720 × 1080 encodes: the 480 ones would
 * be drawn at nearly three device pixels each and read soft. Frame: 2:3. Stills
 * are WebP of the clips' own first and last frames.
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

/**
 * What each clip's own frames need from the page, measured from its alpha.
 *
 * The clips were stabilised by scaling and shifting every frame of the source
 * film, so the film's own left and right edges sit inside the 2:3 canvas and
 * move a little from frame to frame. Wherever he reaches past them — for the
 * jacket on its hook, or hanging it back — his hand or the sleeve would stop
 * dead on a straight vertical line in mid-air. `l` and `r` are those two
 * edges, in thousandths of the frame's width, sampled evenly from the first
 * frame to the last (read between samples linearly: within a pixel at full
 * size). The page feathers the clip just inside them, so a limb fades into
 * the light instead of being cut.
 *
 * `handoff` is the frame at which the jacket crosses into the frame (an
 * on-clip: he has taken it off the rail) or out of it again (an off-clip: it
 * is back on the rail). The rail follows the film at exactly that moment.
 *
 * `hide` clears what the cut-out left behind: soft rectangles, keyed by frame
 * as [frame, x0, x1, y0, y1, strength], all in thousandths of the frame and
 * read between keys linearly. In undress-01 the matte kept a pale ghost of the
 * jacket by his feet after it has left, a fragment of it after that, and a
 * little floor glow beside his right shoe. Nothing of him is inside them.
 *
 * Measured by merit-video-kit/ (outside the repo). Re-measure after any
 * re-export of the clips.
 */
export type ClipTrack = {
  frames: number;
  handoff: number;
  l: readonly number[];
  r: readonly number[];
  hide?: readonly (readonly [frame: number, x0: number, x1: number, y0: number, y1: number, strength: number])[];
};

export const CLIPS: Readonly<Record<string, ClipTrack>> = {
  'dress-01': {
    frames: 226,
    handoff: 24,
    l: [82, 81, 80, 79, 78, 78, 77, 77, 77, 77, 77, 76, 76, 76, 75, 75, 74, 74, 73, 72, 70, 69, 67, 66, 63, 61, 58, 55, 52, 49, 45, 41, 36, 31, 26, 20, 14, 7, 0],
    r: [924, 925, 925, 926, 926, 927, 927, 927, 927, 927, 928, 928, 928, 929, 929, 930, 930, 931, 932, 933, 935, 936, 938, 940, 943, 945, 948, 951, 955, 959, 963, 968, 972, 978, 983, 989, 996, 1000, 1000],
  },
  'undress-01': {
    frames: 203,
    handoff: 121,
    l: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 58, 58, 58, 58, 58, 57, 57, 57, 57, 56, 56, 55, 55],
    r: [968, 968, 967, 967, 967, 967, 967, 967, 967, 967, 967, 967, 967, 967, 968, 968, 968, 968, 968, 968, 968, 969, 969, 969, 968, 968, 968, 968, 968, 967, 967, 966, 965, 965, 964],
    hide: [
      [96, 735, 975, 870, 990, 0],
      [99, 735, 975, 870, 990, 1],
      [107, 735, 975, 870, 990, 1],
      [110, 735, 975, 870, 990, 0],
      [116, 35, 356, 470, 955, 0],
      [120, 35, 356, 470, 955, 1],
      [139, 35, 356, 470, 955, 1],
      [141, 35, 356, 620, 955, 1],
      [146, 35, 356, 620, 955, 1],
      [150, 35, 356, 620, 955, 0],
    ],
  },
  'dress-02': {
    frames: 239,
    handoff: 44,
    l: [79, 77, 76, 74, 73, 71, 70, 68, 67, 66, 64, 63, 61, 60, 59, 57, 56, 54, 53, 52, 50, 48, 47, 45, 43, 42, 40, 38, 36, 34, 32, 29, 27, 25, 22, 20, 17, 14, 11, 8, 5],
    r: [923, 925, 927, 929, 930, 932, 934, 936, 937, 939, 941, 942, 944, 946, 948, 949, 951, 953, 955, 957, 958, 960, 962, 964, 966, 969, 971, 973, 975, 978, 980, 982, 985, 987, 990, 993, 996, 998, 1000, 1000, 1000],
  },
  'undress-02': {
    frames: 193,
    handoff: 135,
    l: [35, 35, 34, 34, 33, 32, 32, 31, 30, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 15, 14, 13, 12, 10, 9, 8, 6, 5, 4],
    r: [979, 980, 980, 981, 982, 982, 983, 984, 985, 985, 986, 987, 987, 988, 989, 990, 991, 991, 992, 993, 994, 995, 996, 997, 997, 998, 999, 1000, 1000, 1000, 1000, 1000, 1000],
  },
};
