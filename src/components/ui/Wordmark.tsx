import { LOGO, MARK } from '@/lib/brand';

type Props = {
  className?: string;
  symbol?: boolean;
  title?: string;
  /**
   * Draw each letterform as its own group (`[data-glyph]`), so the footer
   * signature and the menus can move them one after another. The outline is
   * identical either way.
   */
  split?: boolean;
};

/**
 * The logotype is one path of several closed shapes: the M, the joined E and
 * R, the R's counter, the I and the T. A shape whose horizontal extent sits
 * inside the one before it is that shape's counter, so it travels with it —
 * otherwise the hole would drift out of its letter mid-animation.
 */
function glyphs(d: string) {
  const parts = d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
  const groups: { d: string; min: number; max: number }[] = [];
  for (const part of parts) {
    const xs = (part.match(/-?\d*\.?\d+/g) ?? []).map(Number).filter((_, i) => i % 2 === 0);
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    const last = groups[groups.length - 1];
    if (last && min > last.min && max < last.max) last.d += ` ${part}`;
    else groups.push({ d: part, min, max });
  }
  return groups.map((g) => g.d);
}

const LOGO_GLYPHS = glyphs(LOGO.d);

/**
 * The MERIT logotype, drawn from its outlines so it never waits on a font.
 * Sized by height: the parent sets `h-*` and the aspect ratio does the rest.
 * `symbol` draws the M alone.
 */
export function Wordmark({ className, symbol = false, title, split = false }: Props) {
  const mark = symbol ? MARK : LOGO;
  return (
    <svg
      viewBox={mark.viewBox}
      className={className}
      fill="currentColor"
      fillRule="evenodd"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {split && !symbol ? (
        LOGO_GLYPHS.map((g, i) => (
          <g key={i} data-glyph={i}>
            <path d={g} />
          </g>
        ))
      ) : (
        <path d={mark.d} />
      )}
    </svg>
  );
}
