import Link from 'next/link';

export type Crumb = { name: string; href: string };

/**
 * The trail to the piece. The last step is the page itself, and the heading
 * right under it already says its name, so it is kept for assistive tech only.
 */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const last = crumbs.length - 1;
  return (
    <nav aria-label="Breadcrumb" className="mb-7 lg:mb-[clamp(1.25rem,3.6vh,2.25rem)]">
      <ol className="label-sm flex flex-wrap items-center text-mute">
        {crumbs.map((c, i) =>
          i === last ? (
            <li key={c.href} className="sr-only">
              <span aria-current="page">{c.name}</span>
            </li>
          ) : (
            <li key={c.href} className="flex items-center">
              {i > 0 ? <span aria-hidden className="mx-2.5 text-line-2">/</span> : null}
              <Link href={c.href} className="inline-flex min-h-6 items-center transition-colors hover:text-ink">
                {c.name}
              </Link>
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
