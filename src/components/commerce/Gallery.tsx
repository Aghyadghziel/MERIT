'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Desktop scrolls the photographs vertically beside a fixed panel. Phones get
 * a horizontal snap rail with a page count, which is the only gesture anyone
 * expects there.
 */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const onScroll = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <>
      {/* Phone */}
      <div className="lg:hidden">
        <div
          ref={rail}
          className="no-bar -mx-(--gutter) flex snap-x snap-mandatory overflow-x-auto"
          aria-label={`${name} — photographs`}
        >
          {images.map((img, i) => (
            <div key={img} className="w-full shrink-0 snap-center px-(--gutter)">
              <div className="frame frame-4-5">
                <Image
                  src={`/img/${img}.webp`}
                  alt={i === 0 ? name : `${name}, view ${i + 1}`}
                  width={1400}
                  height={1750}
                  sizes="100vw"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2" aria-hidden>
          {images.map((img, i) => (
            <span key={img} className={cn('h-px flex-1 transition-colors', i === page ? 'bg-ink' : 'bg-line')} />
          ))}
          <span className="label-sm nums ml-2 text-mute">
            {page + 1}/{images.length}
          </span>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:grid lg:gap-(--gutter)">
        {images.map((img, i) => (
          <div key={img} className="frame frame-4-5" {...(i > 0 ? { 'data-reveal-img': '' } : {})}>
            <Image
              src={`/img/${img}.webp`}
              alt={i === 0 ? name : `${name}, view ${i + 1}`}
              width={1400}
              height={1750}
              sizes="52vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </>
  );
}
