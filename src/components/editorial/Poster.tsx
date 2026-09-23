import { Lines } from '@/components/ui/Lines';
import { cn } from '@/lib/cn';
import { posterSize } from '@/components/editorial/data';

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
 * logotype spans the footer. The element is its own size container, so the
 * type fits whatever column it is dropped into, at any width, without a script.
 */
export function Poster({ text, as: Tag = 'p', cap, className, id, reveal = true }: Props) {
  return (
    <Tag id={id} className={cn('@container block w-full', className)}>
      <span
        className="block whitespace-nowrap font-semibold uppercase leading-[0.8] tracking-[-0.055em]"
        style={{ fontSize: posterSize(text, cap) }}
      >
        {reveal ? <Lines text={text} /> : text}
      </span>
    </Tag>
  );
}
