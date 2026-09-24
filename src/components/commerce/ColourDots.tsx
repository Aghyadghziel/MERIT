'use client';

import type { Colour } from '@/lib/catalog';
import { useT } from '@/i18n/client';

/** Small squares, not circles — the grid has no curves anywhere else. */
export function ColourDots({ colours }: { colours: Colour[] }) {
  const t = useT();
  const names = colours.map((c) => t(c.name)).join(t(', '));
  return (
    <span className="flex items-center gap-1.5">
      <span className="sr-only">
        {colours.length === 1 ? t('One colour: {names}', { names }) : t('{n} colours: {names}', { n: colours.length, names })}
      </span>
      {colours.map((c) => (
        <span
          key={c.name}
          aria-hidden
          className="block h-2 w-2 ring-1 ring-line-2 ring-inset"
          style={{ background: c.hex }}
        />
      ))}
    </span>
  );
}
