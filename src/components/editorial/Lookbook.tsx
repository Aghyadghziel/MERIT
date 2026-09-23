import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { Price } from '@/components/commerce/Price';
import { WishButton } from '@/components/commerce/WishButton';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { pad, pic, type Look } from '@/components/editorial/data';

type Size = 'lead' | 'side' | 'solo';

/**
 * The looks, hung as spreads rather than a grid: one large frame and one
 * smaller one dropped against it, the pair mirrored on the next spread. Every
 * frame sells the piece it shows — name, price and the way to it sit on the
 * frame's own rule. `interlude` is set after the first spread, where a
 * magazine would break the run with a full page.
 */
export function Lookbook({ looks, interlude }: { looks: Look[]; interlude?: React.ReactNode }) {
  const rows: Look[][] = [];
  for (let i = 0; i < looks.length; i += 2) rows.push(looks.slice(i, i + 2));

  return (
    <div>
      {rows.map((row, r) => {
        const mirrored = r % 2 === 1;
        const first = r * 2;
        return (
          <Fragment key={row[0].product.slug}>
            <div className={cn('page grid-page gap-y-16', r > 0 && 'mt-24 md:mt-32 lg:mt-44')}>
              {row.length === 1 ? (
                <LookFrame look={row[0]} n={first + 1} size="solo" className="col-span-4 md:col-span-4 md:col-start-2 lg:col-span-6 lg:col-start-4" />
              ) : mirrored ? (
                <>
                  <LookFrame look={row[0]} n={first + 1} size="side"
                    className="col-span-3 md:col-span-3 lg:col-span-4 lg:col-start-1 lg:mt-[clamp(10rem,16vw,17rem)]" />
                  <LookFrame look={row[1]} n={first + 2} size="lead"
                    className="col-span-4 md:col-span-5 md:col-start-2 lg:col-span-7 lg:col-start-6" />
                </>
              ) : (
                <>
                  <LookFrame look={row[0]} n={first + 1} size="lead" priority={r === 0}
                    className="col-span-4 md:col-span-5 lg:col-span-7" />
                  <LookFrame look={row[1]} n={first + 2} size="side"
                    className="col-span-3 col-start-2 md:col-span-3 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:mt-[clamp(10rem,16vw,17rem)]" />
                </>
              )}
            </div>
            {r === 0 && interlude ? <div className="mt-24 md:mt-32 lg:mt-44">{interlude}</div> : null}
          </Fragment>
        );
      })}
    </div>
  );
}

function LookFrame({
  look, n, size, className, priority = false,
}: { look: Look; n: number; size: Size; className?: string; priority?: boolean }) {
  const { product } = look;
  const href = `/products/${product.slug}`;
  const image = pic(look.image);

  return (
    <article className={cn('group relative', className)}>
      <div className="relative">
        <div className={cn('frame', size === 'side' ? 'frame-3-4' : 'frame-4-5')} data-reveal-img>
          <div className="h-full w-full">
            <Image
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              sizes={size === 'lead' ? '(min-width:1024px) 56vw, (min-width:768px) 80vw, 100vw' : '(min-width:1024px) 32vw, 75vw'}
              loading={priority ? 'eager' : 'lazy'}
              className="transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]"
            />
          </div>
        </div>
        <span className="absolute right-2 top-2 z-10">
          <WishButton slug={product.slug} name={product.name} className="bg-bone/80 backdrop-blur-[2px]" />
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4 border-t border-ink pt-3" data-reveal>
        <div className="min-w-0">
          <p className="label-sm text-mute">
            <span className="nums">Look {pad(n)}</span> · {product.category}
          </p>
          <h3 className={cn('mt-1.5', size === 'side' ? 'text-base font-medium leading-snug tracking-[-0.01em]' : 'display-sm')}>
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Price amount={product.price} compareAt={product.compareAt} />
          <span aria-hidden className="label-sm inline-flex items-center gap-1.5">
            Shop
            <Icon name="arrowR" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
