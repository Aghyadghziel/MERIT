'use client';

import { useStore } from '@/components/providers/Store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n/client';

export function WishButton({
  slug, name, className, onLight = false,
}: { slug: string; name: string; className?: string; onLight?: boolean }) {
  const { wishlist, toggleWish, ready } = useStore();
  const saved = ready && wishlist.includes(slug);
  const t = useT();
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(slug); }}
      aria-pressed={saved}
      aria-label={saved ? t('Remove {name} from wishlist', { name }) : t('Save {name} to wishlist', { name })}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center transition-opacity',
        onLight ? 'text-ink' : 'text-ink',
        saved ? 'text-oxide' : 'hover:opacity-60',
        className,
      )}
    >
      <Icon name="heart" filled={saved} className="h-[18px] w-[18px]" />
    </button>
  );
}
