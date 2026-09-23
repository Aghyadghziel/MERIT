'use client';

import { useEffect } from 'react';

/**
 * A collection link that already carries a filter (a menu's "Tailoring", a
 * shared filtered view) is asking for the pieces, not the lookbook. Arriving
 * with one, the page opens at the grid. Only on arrival: changing a filter
 * afterwards leaves the scroll where the reader put it.
 */
export function JumpToPieces({ id = 'pieces' }: { id?: string }) {
  useEffect(() => {
    if (!window.location.search) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [id]);
  return null;
}
