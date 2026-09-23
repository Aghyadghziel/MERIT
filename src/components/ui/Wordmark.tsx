import { SYMBOL, STROKE, WORDMARK } from '@/lib/brand';

type Props = { className?: string; symbol?: boolean; title?: string };

/**
 * The wordmark is drawn, not typeset, so its proportions never depend on a
 * webfont arriving. Sized by height: the parent sets `h-*` and the aspect
 * ratio does the rest.
 */
export function Wordmark({ className, symbol = false, title }: Props) {
  const mark = symbol ? SYMBOL : WORDMARK;
  return (
    <svg
      viewBox={mark.viewBox}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {mark.paths.map((p) => (
        <path key={p.key} d={p.d} transform={`translate(${p.x} 0)`} />
      ))}
    </svg>
  );
}
