import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Every section opens the same way: a rule, an index number, a title, and an
 * optional link on the far right. It is the page's table of contents, read one
 * line at a time.
 */
export function SectionHead({
  index, title, link, className, as: As = 'h2',
}: {
  index: number;
  title: string;
  link?: { label: string; href: string };
  className?: string;
  as?: 'h2' | 'h3' | 'p';
}) {
  return (
    <div className={cn('rule-t flex items-baseline justify-between gap-6 pt-4', className)} data-reveal>
      <As className="label">
        <span className="nums mr-3 text-mute">{String(index).padStart(2, '0')}</span>
        {title}
      </As>
      {link ? (
        <Link href={link.href} className="label group inline-flex shrink-0 items-center gap-2 hover:opacity-60">
          <span className="hidden sm:inline">{link.label}</span>
          <span className="sm:hidden">All</span>
          <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
