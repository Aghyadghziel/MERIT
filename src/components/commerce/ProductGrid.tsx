import { Fragment } from 'react';
import { ProductCard } from '@/components/commerce/ProductCard';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';

export type GridDensity = 'compact' | 'large';

/**
 * Anything set into the grid between cards — a campaign picture, a story.
 * `at` is the card it goes before; at or past the last card, it closes the grid.
 */
export type GridInsert = { at: number; key: string; node: React.ReactNode };

/**
 * The product grid. Two up on a phone, three on a tablet, four on a desktop —
 * or, in the large view, one and two. The column gap is kept tighter than the
 * page gutter and the row gap looser, so the grid reads as rows of a catalogue
 * rather than a table of tiles.
 *
 * Every card sits in a wrapper keyed by its slug (data-flip-id), which is what
 * lets a listing animate cards to their new places when a filter changes.
 */
export function ProductGrid({
  products, columns = 4, className, startIndex = 0, priorityCount = 0, label,
  density = 'compact', inserts, ref,
}: {
  products: Product[];
  columns?: 3 | 4;
  className?: string;
  startIndex?: number;
  priorityCount?: number;
  /** Names the grid for screen readers, and keeps the card headings at h3. */
  label?: string;
  density?: GridDensity;
  inserts?: GridInsert[];
  ref?: React.Ref<HTMLDivElement>;
}) {
  const large = density === 'large';
  const sizes = large
    ? '(min-width:768px) 48vw, 100vw'
    : columns === 4
      ? '(min-width:1024px) 24vw, (min-width:768px) 32vw, 48vw'
      : '(min-width:768px) 32vw, 48vw';

  return (
    <>
      {label ? <h2 className="sr-only">{label}</h2> : null}
      <div
        ref={ref}
        className={cn(
          'grid',
          large
            ? 'grid-cols-1 gap-x-(--gutter) gap-y-[clamp(3rem,2rem+3vw,6rem)] md:grid-cols-2'
            : cn(
                'grid-cols-2 gap-x-[clamp(0.625rem,0.25rem+1.2vw,1.5rem)] gap-y-[clamp(2.25rem,1.4rem+2.6vw,4.75rem)] md:grid-cols-3',
                columns === 4 && 'lg:grid-cols-4',
              ),
          inserts?.length ? 'grid-flow-row-dense' : null,
          className,
        )}
      >
        {products.map((p, i) => (
          <Fragment key={p.slug}>
            {inserts?.filter((x) => x.at === i).map((x) => <Fragment key={x.key}>{x.node}</Fragment>)}
            <div data-flip-id={p.slug} className="min-w-0">
              <ProductCard product={p} index={startIndex + i} priority={i < priorityCount} sizes={sizes} />
            </div>
          </Fragment>
        ))}
        {inserts?.filter((x) => x.at >= products.length).map((x) => <Fragment key={x.key}>{x.node}</Fragment>)}
      </div>
    </>
  );
}
