/**
 * The catalogue mixes two kinds of picture. Most are graded photographs that
 * can be cropped to any frame. The Fitting Room pieces are studio cut-outs on a
 * transparent ground (outfits/*): a standing figure, or the garment laid flat
 * (outfits/preview-*). Cropping those cuts off a head or a sleeve, so they are
 * always shown whole, on the bone well, with room around them.
 */
export type ImageKind = 'photo' | 'figure' | 'flat';

export const imageKind = (img: string): ImageKind =>
  !img.startsWith('outfits/') ? 'photo' : img.startsWith('outfits/preview') ? 'flat' : 'figure';

export const imageSrc = (img: string) => `/img/${img}.webp`;

/** Classes for an <Image fill> of this kind inside a sized, bone-2 frame. */
export const fitClass = (img: string) => {
  const kind = imageKind(img);
  if (kind === 'flat') return 'object-contain p-[9%]';
  if (kind === 'figure') return 'object-contain object-bottom pt-[4%]';
  return 'object-cover [filter:saturate(0.9)_contrast(1.03)]';
};
