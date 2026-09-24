import { Fragment } from 'react';

const ARABIC = /[؀-ۿ]/;

/**
 * Splits a headline into words and wraps each in its own mask, so the reveal
 * survives any line break. Done at render time rather than by measuring text
 * after the fact, which would race the webfont.
 *
 * On Arabic pages the masks are inline-blocks in a right-to-left line, so a
 * run of Latin words ("Rule Line") would come out in reverse. `dir="auto"`
 * keeps an all-Latin headline left-to-right, and inside an Arabic headline a
 * Latin run shares one mask.
 */
export function Lines({ text, className }: { text: string; className?: string }) {
  const raw = text.split(' ');
  const words: string[] = [];
  if (ARABIC.test(text)) {
    for (const w of raw) {
      const prev = words[words.length - 1];
      if (prev !== undefined && !ARABIC.test(w) && /[A-Za-z]/.test(w) && !ARABIC.test(prev) && /[A-Za-z]/.test(prev)) {
        words[words.length - 1] = `${prev} ${w}`;
      } else words.push(w);
    }
  } else words.push(...raw);
  return (
    <span data-reveal-line dir="auto" className={className}>
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
