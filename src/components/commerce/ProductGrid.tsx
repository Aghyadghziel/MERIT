import { ProductCard } from '@/components/commerce/ProductCard';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';

/**
 * Two columns on a phone, three or four on a desktop. The gap grows with the
 * page gutter so the grid keeps the same rhythm as everything else.
 */
export function ProductGrid({
  products, columns = 4, className, startIndex = 0, priorityCount = 0, label,
}: {
  products: Product[];
  columns?: 3 | 4;
  className?: string;
  startIndex?: number;
  priorityCount?: number;
  /** Names the grid for screen readers, and keeps the card headings at h3. */
  label?: string;
}) {
  return (
    <>
      {label ? <h2 className="sr-only">{label}</h2> : null}
      <div
      className={cn(
        'grid grid-cols-2 gap-x-(--gutter) gap-y-12 md:grid-cols-3',
        columns === 4 && 'lg:grid-cols-4',
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard
          key={p.slug}
          product={p}
          index={startIndex + i}
          priority={i < priorityCount}
          sizes={
            columns === 4
              ? '(min-width:1024px) 23vw, (min-width:768px) 31vw, 47vw'
              : '(min-width:768px) 31vw, 47vw'
          }
        />
      ))}
      </div>
    </>
  );
}
