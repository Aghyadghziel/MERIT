'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EMPTY } from '@/lib/filter';

/** The query keys that ask for pieces. Anything else (a campaign tag) does not. */
const KEYS = [...Object.keys(EMPTY), 'sort'];

/**
 * A collection link that carries a filter (a menu's "Shirting", a shared
 * filtered view) is asking for the pieces, not the lookbook, so the page opens
 * at the grid. That holds on arrival and on every later change of filter —
 * including a menu link to another filter of the page already open, after
 * which Next has put the reader back at the top. A filter changed from the
 * grid's own bar leaves the scroll alone: the grid is on screen already.
 */
export function JumpToPieces({ id = 'pieces' }: { id?: string }) {
  return (
    <Suspense fallback={null}>
      <Jump id={id} />
    </Suspense>
  );
}

function Jump({ id }: { id: string }) {
  const params = useSearchParams();
  const filter = KEYS.map((k) => params.get(k) ?? '').join('|');
  const asking = filter.replace(/\|/g, '') !== '';

  useEffect(() => {
    if (!asking) return;
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const { top, bottom } = el.getBoundingClientRect();
      if (top < window.innerHeight && bottom > 0) return;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [filter, asking, id]);

  return null;
}
