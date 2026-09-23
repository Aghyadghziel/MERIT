/**
 * Word masks deep enough for descenders at display leading. Put it on the
 * heading that holds a <Lines>.
 *
 * The house mask leaves 0.08em under each word, which slices the tail off a
 * g or y set this tight ("Bag", "Gallery", "together."). The extra depth goes
 * on the travelling word rather than on the mask, so the mask grows with it
 * and a word waiting below its line (at 105% of its own height) stays fully
 * out of sight before the reveal. Line spacing is unchanged: the mask gives
 * the same depth back with a negative margin.
 *
 * The house rule is unlayered, so the two overrides on the mask need `!`.
 */
export const DEEP_MASK =
  '[&_[data-reveal-line]>span]:pb-0! [&_[data-reveal-line]>span]:-mb-[0.2em]! [&_[data-reveal-line]>span>span]:pb-[0.2em]';
