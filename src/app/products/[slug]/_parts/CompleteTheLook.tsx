import Image from 'next/image';
import { ProductCard } from '@/components/commerce/ProductCard';
import { Price } from '@/components/commerce/Price';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import type { Product } from '@/lib/catalog';
import { pad2 } from '@/lib/format';
import { DEEP_MASK } from './mask';
import { fitClass, imageSrc } from './media';

const ITEM = 'relative w-[68%] shrink-0 snap-start md:w-[calc((100%-2*var(--gutter))/2.6)] lg:w-auto';
const SIZES = '(min-width:1024px) 23vw, (min-width:768px) 36vw, 66vw';

/**
 * The piece and what it is worn with, laid out as one outfit: this piece
 * first, then a plus between each of the others. Each card keeps its own
 * quick-add, so the look can be bought piece by piece without leaving.
 */
export function CompleteTheLook({ product, look }: { product: Product; look: Product[] }) {
  const img = product.images[0];
  return (
    <section aria-labelledby="look-title" className="pb-(--section-sm) pt-(--section)">
      <div className="page grid-page items-end gap-y-6">
        <div className="col-span-4 md:col-span-4 lg:col-span-8">
          <p className="label text-mute" data-reveal>
            Complete the look — {pad2(look.length + 1)} pieces
          </p>
          <h2 id="look-title" className={`display-xl mt-4 ${DEEP_MASK}`}>
            <Lines text="Worn together." />
          </h2>
        </div>
        <p
          className="col-span-4 max-w-sm text-sm leading-relaxed text-mute md:col-span-2 lg:col-span-4 lg:justify-self-end"
          data-reveal
        >
          Chosen from the collection to wear with the {product.name}. Each piece is sold on its own.
        </p>
      </div>

      <div className="page mt-12 md:mt-16" data-reveal>
        <ul className="no-bar -mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-(--gutter) overflow-x-auto px-(--gutter) pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          <li className={ITEM}>
            <div className="relative aspect-[4/5] overflow-hidden bg-bone-2">
              <Image src={imageSrc(img)} alt="" fill sizes={SIZES} className={fitClass(img)} />
              <span className="label-sm absolute left-3 top-3 bg-ink px-2 py-1 text-bone">This piece</span>
            </div>
            <div className="mt-3.5 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{product.name}</p>
                <p className="label-sm mt-1.5 text-mute">
                  <span className="nums">01 — </span>
                  {product.category}
                </p>
              </div>
              <Price amount={product.price} compareAt={product.compareAt} />
            </div>
          </li>

          {look.map((p, i) => (
            <li key={p.slug} className={ITEM}>
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 aspect-[4/5]">
                <span className="absolute left-[calc(var(--gutter)/-2)] top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-line bg-bone">
                  <Icon name="plus" className="h-3.5 w-3.5" />
                </span>
              </span>
              <ProductCard product={p} index={i + 1} sizes={SIZES} reveal={false} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
