import type { Colour } from '@/lib/catalog';

/** Small squares, not circles — the grid has no curves anywhere else. */
export function ColourDots({ colours }: { colours: Colour[] }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="sr-only">
        {colours.length === 1 ? 'One colour: ' : `${colours.length} colours: `}
        {colours.map((c) => c.name).join(', ')}
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
