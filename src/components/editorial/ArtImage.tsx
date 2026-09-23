import { getImageProps } from 'next/image';
import { cn } from '@/lib/cn';
import { pic } from '@/components/editorial/data';

type Props = {
  /** The landscape master, shown from `from` up. */
  wide: string;
  /** The portrait crop for phones. Omit to use `wide` everywhere. */
  tall?: string;
  alt: string;
  sizes?: string;
  /** Above the fold: fetch first, never lazily. */
  priority?: boolean;
  className?: string;
  /** Where the landscape picture takes over. */
  from?: string;
};

/**
 * One picture, two crops. A full-bleed opener is a landscape on a desk and a
 * portrait in the hand, and a centre crop of either is rarely the picture.
 * The browser picks the source before it downloads anything, so a phone never
 * fetches the 2560px master.
 */
export function ArtImage({ wide, tall, alt, sizes = '100vw', priority = false, className, from = '(min-width: 768px)' }: Props) {
  const load = priority ? ({ fetchPriority: 'high', loading: 'eager' } as const) : ({ loading: 'lazy' } as const);
  const img = cn('block h-full w-full object-cover [filter:saturate(0.9)_contrast(1.03)]', className);

  if (!tall || tall === wide) {
    const { props } = getImageProps({ ...pic(wide), alt, sizes, ...load });
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} className={img} />;
  }

  const { props: { srcSet: desktop } } = getImageProps({ ...pic(wide), alt, sizes });
  const { props: { srcSet: mobile, ...rest } } = getImageProps({ ...pic(tall), alt, sizes, ...load });
  return (
    <picture className="block h-full w-full">
      <source media={from} srcSet={desktop} sizes={sizes} />
      <source srcSet={mobile} sizes={sizes} />
      {/* alt arrives in the spread, from getImageProps. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...rest} srcSet={mobile} className={img} />
    </picture>
  );
}
