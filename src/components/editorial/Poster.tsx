import { Fragment } from 'react';
import { cn } from '@/lib/cn';
import { posterFit } from '@/components/editorial/data';

type Props = {
  text: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
  /** Upper bound on the size, so a five-letter word stays a word. */
  cap?: string;
  className?: string;
  id?: string;
  /** Word-mask reveal. Off where the poster sits inside a link that moves. */
  reveal?: boolean;
};

/**
 * A word set in capitals from edge to edge of its column, the way the
 * logotype spans the footer: the first stroke on the starting edge, the last
 * on the far one. The element is its own size container, so the type fits whatever
 * column it is dropped into, at any width, without a script.
 */
export function Poster({ text, as: Tag = 'p', cap, className, id, reveal = true }: Props) {
  const { fontSize, flatSize, marginInlineStart, dir } = posterFit(text, cap);
  const style = { '--poster': fontSize, '--poster-flat': flatSize, marginInlineStart } as React.CSSProperties;
  return (
    <Tag id={id} className={cn('@container block w-full', className)}>
      {/* A Latin name keeps its own direction on an Arabic page, so its first
          stroke still lands on the left edge it was measured from. */}
      <span
        dir={dir}
        className="block whitespace-nowrap text-(length:--poster) font-semibold uppercase leading-[0.8] tracking-[-0.055em] [&:lang(ar)]:text-(length:--poster-flat)"
        style={style}
      >
        {reveal ? <Mask text={text} /> : text}
      </span>
    </Tag>
  );
}

/**
 * The house word mask (the same markup <Lines> writes, so the one reveal
 * system drives it), with room at the sides: at this size a letter's ink can
 * reach past its own box — the legs of an X, the trailing tracking — and a
 * mask cut flush to the box would shave it off.
 */
function Mask({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <span data-reveal-line>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="-mx-[0.12em] px-[0.12em]">
            <span>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
