/**
 * Word masks with room for the whole of every letter at display settings.
 * Put it on the heading that holds a <Lines>.
 *
 * The house mask is cut to the word's box plus 0.08em underneath, and two
 * things at display size fall outside that box:
 *
 *  - Descenders. At leading under 0.9 the tail of a g or y hangs below the
 *    mask and is sliced flat ("Bag", "Gallery", "together.").
 *  - The last letter's right edge. Tracking of -0.055em pulls the word's box
 *    in past the ink of its final letter, so the round of an e, the arm of an
 *    r and the stroke of a w are shaved flat ("Cashmere", "Blazer", "Crew").
 *
 * Below, the extra depth goes on the travelling word rather than on the mask,
 * so the mask grows with it and a word waiting under its line (at 105% of its
 * own height) stays fully out of sight before the reveal. On the right the
 * mask takes padding. Both are given back with negative margins, so line
 * spacing and word spacing are exactly as before.
 *
 * The house rule is unlayered, so the two overrides of what it sets need `!`.
 */
export const MASK_ROOM = [
  '[&_[data-reveal-line]>span]:pb-0!',
  '[&_[data-reveal-line]>span]:-mb-[0.2em]!',
  '[&_[data-reveal-line]>span]:pr-[0.1em]',
  '[&_[data-reveal-line]>span]:-mr-[0.1em]',
  '[&_[data-reveal-line]>span>span]:pb-[0.2em]',
].join(' ');
