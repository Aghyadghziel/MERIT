import { Fragment } from 'react';

/**
 * Splits a headline into words and wraps each in its own mask, so the reveal
 * survives any line break. Done at render time rather than by measuring text
 * after the fact, which would race the webfont.
 */
export function Lines({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span data-reveal-line className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span>
            <span>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
