import Link from '@/i18n/link';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Room for a <Lines> headline's word masks. Put it on the element that wraps
 * <Lines>.
 *
 * Each word is clipped to its own box. At the leading and tracking used by
 * display type (0.82–0.9, down to -0.065em), that box is shorter than the
 * descenders and narrower than a round final letter, so a g, p or y lost its
 * tail and an o or e was shaved flat. The box is not simply padded, because
 * the hidden word sits one box-height lower and a taller box would show the
 * tops of its capitals. Instead its line-height grows by half an em (`1lh` in
 * line-height is the parent's), so the box and the distance the word
 * travels grow together, and negative margins give the space back, so the
 * lines of the headline sit exactly where they did. The `!` on the bottom
 * edge beats the unlayered mask rule in globals.css.
 */
export const LINE_ROOM = [
  '[&_[data-reveal-line]>span]:leading-[calc(1lh+0.5em)]',
  '[&_[data-reveal-line]>span]:-mt-[0.25em]',
  '[&_[data-reveal-line]>span]:-mb-[0.25em]!',
  '[&_[data-reveal-line]>span]:pb-0!',
  '[&_[data-reveal-line]>span]:px-[0.12em]',
  '[&_[data-reveal-line]>span]:-mx-[0.12em]',
].join(' ');

/**
 * Every chapter opens the same way: a rule, an index number, a title, and an
 * optional note or link on the far right. Read down a page, the heads are its
 * table of contents, one line at a time.
 *
 * `tone="ink"` draws the rule in full black for the chapters of the manifesto;
 * inside an `.on-ink` room the rule and the number follow the room.
 */
export function SectionHead({
  index, title, link, note, className, tone = 'line', as: As = 'h2', id,
}: {
  index: number;
  title: string;
  link?: { label: string; href: string };
  note?: string;
  className?: string;
  tone?: 'line' | 'ink';
  as?: 'h2' | 'h3' | 'p';
  id?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-6 border-t pt-4',
        tone === 'ink' ? 'border-current' : 'border-line [.on-ink_&]:border-line-ink-2',
        className,
      )}
      data-reveal
    >
      <As id={id} className="label flex items-baseline gap-4">
        {/* The space keeps the accessible name "01 The idea", not "01The idea";
            flex drops it from the layout. */}
        <span className="nums text-mute [.on-ink_&]:text-mute-ink">{String(index).padStart(2, '0')}</span>{' '}
        <span>{title}</span>
      </As>
      {link ? (
        <Link href={link.href} className="label group inline-flex min-h-11 shrink-0 items-center gap-2 -my-3.5 hover:opacity-60">
          {link.label}
          <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ) : note ? (
        <p className="label-sm nums shrink-0 text-mute [.on-ink_&]:text-mute-ink">{note}</p>
      ) : null}
    </div>
  );
}
