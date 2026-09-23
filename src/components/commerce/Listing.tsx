'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Suspense, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore,
} from 'react';
import { Flip } from 'gsap/Flip';
import { ProductGrid, type GridDensity, type GridInsert } from '@/components/commerce/ProductGrid';
import { ArtImage } from '@/components/editorial/ArtImage';
import { posterSize } from '@/components/editorial/data';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';
import type { Category, Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import {
  apply, chips, countActive, EMPTY, facets, FIT_LABELS, fromQuery, PRICE_BANDS, SORTS,
  toggle, toQuery, type Filters, type SortKey,
} from '@/lib/filter';
import { pad2, plural } from '@/lib/format';

/** A picture from a campaign or a story, set into the grid between pieces. */
export type ListingStory = {
  /** Portrait image, for the tile that spans two columns and two rows. */
  image: string;
  /** Landscape image, for the full-width tile in the large view. */
  wide?: string;
  /** A Tailwind object-position class for the portrait crop, e.g. "object-[58%_center]". */
  crop?: string;
  alt: string;
  kicker: string;
  title: string;
  text?: string;
  href: string;
  cta: string;
};

export type ListingProps = {
  pool: Product[];
  title: string;
  description?: string;
  /**
   * A campaign picture the page opens on, full bleed, with the title over it.
   * `image` is the landscape master; `tall` the portrait crop for phones.
   */
  campaign?: { image: string; tall?: string; kicker: string; alt: string };
  eyebrow?: string;
  /** Campaign and story tiles set into the unfiltered grid. */
  stories?: ListingStory[];
  /**
   * `page` opens the page (h1, breadcrumb); `section` sits inside another page,
   * as the pieces of a collection do. Unset, a listing under /collections/ is
   * a section and everything else a page.
   */
  variant?: 'page' | 'section';
};

type ViewProps = ListingProps & {
  /** The filter and sort state, as a query string. */
  query: string;
  onQuery: (query: string) => void;
};

/**
 * One listing behind every product page: New, Women, Men and each
 * collection's pieces. Filters live in the query string, so a filtered view
 * can be bookmarked, shared and reloaded; they are written with the native
 * history API, which Next keeps in step with its router without a round trip,
 * so a filter answers on the same frame.
 *
 * The query is read from the address bar as an external store rather than
 * with useSearchParams, so the listing needs no Suspense boundary of its own:
 * the prerendered page is the real, unfiltered listing and it hydrates with
 * the rest of the page, in one pass. Only an empty watcher sits in Suspense,
 * to hear Next's own navigations (a menu link to ?category=…).
 */
export function Listing(props: ListingProps) {
  const pathname = usePathname();
  const query = useLocationQuery();
  const onQuery = useCallback((q: string) => {
    window.history.replaceState(null, '', q ? `${pathname}?${q}` : pathname);
    notifyQuery();
  }, [pathname]);
  return (
    <>
      <Suspense fallback={null}>
        <QueryWatch />
      </Suspense>
      <ListingView {...props} query={query} onQuery={onQuery} />
    </>
  );
}

// ─── The query, as an external store ───────────────────────────────────────

const queryListeners = new Set<() => void>();
/** Call after writing the address bar with the history API. */
export const notifyQuery = () => queryListeners.forEach((l) => l());
function subscribeQuery(cb: () => void) {
  queryListeners.add(cb);
  window.addEventListener('popstate', cb);
  return () => {
    queryListeners.delete(cb);
    window.removeEventListener('popstate', cb);
  };
}
const readQuery = () => window.location.search.replace(/^\?/, '');
const serverQuery = () => '';

/**
 * The address bar's query string, read as a store: empty on the server and
 * while hydrating, the real value straight after, and never a Suspense
 * boundary. Pair it with <QueryWatch /> to hear Next's own navigations.
 */
export function useLocationQuery() {
  return useSyncExternalStore(subscribeQuery, readQuery, serverQuery);
}

/** Renders nothing; tells the store when Next has changed the query. */
export function QueryWatch() {
  const q = useSearchParams().toString();
  useEffect(() => { notifyQuery(); }, [q]);
  return null;
}

// ─── Grid density, remembered per viewer ───────────────────────────────────

const DENSITY_KEY = 'merit:grid';
const densityListeners = new Set<() => void>();
let densityMemory: GridDensity | null = null;

function readDensity(): GridDensity {
  if (densityMemory) return densityMemory;
  try {
    return localStorage.getItem(DENSITY_KEY) === 'large' ? 'large' : 'compact';
  } catch {
    return 'compact';
  }
}
function writeDensity(d: GridDensity) {
  densityMemory = d;
  try { localStorage.setItem(DENSITY_KEY, d); } catch { /* private window: memory only */ }
  densityListeners.forEach((l) => l());
}
function subscribeDensity(cb: () => void) {
  densityListeners.add(cb);
  return () => { densityListeners.delete(cb); };
}
const serverDensity = (): GridDensity => 'compact';

/** Flip is registered on first use; animation is a nicety, never a blocker. */
let flipRegistered = false;
function flipReady() {
  const { gsap } = setupGsap();
  if (!flipRegistered) {
    gsap.registerPlugin(Flip);
    flipRegistered = true;
  }
  return Flip;
}

const navHeight = () =>
  (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 5) * 16;

/** Everything the listing draws, given a query. */
function ListingView({
  pool, title, description, campaign, eyebrow, stories, variant, query, onQuery,
}: ViewProps) {
  const pathname = usePathname();
  const mode = variant ?? (pathname.startsWith('/collections/') ? 'section' : 'page');

  const [drawer, setDrawer] = useState(false);
  const density = useSyncExternalStore(subscribeDensity, readDensity, serverDensity);

  const head = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const anchor = useRef<{ id: string; top: number } | null>(null);
  const densityChanged = useRef(false);

  const { filters, sort } = useMemo(() => fromQuery(new URLSearchParams(query)), [query]);
  const options = useMemo(() => facets(pool), [pool]);
  const results = useMemo(() => apply(pool, filters, sort), [pool, filters, sort]);
  const active = countActive(filters);
  const selected = chips(filters);

  const perCategory = useMemo(() => {
    const m = new Map<string, number>();
    pool.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, [pool]);

  /**
   * Every change goes through here. If the reader has scrolled into the grid,
   * the top of the grid is brought back under the toolbar first; then the
   * cards' positions are recorded, so they can travel to their new places
   * once the new result set has rendered.
   */
  const commit = useCallback((next: Filters, nextSort: SortKey) => {
    const el = grid.current;
    if (el) {
      // The bar's own row, plus the row of chips it will have once the new
      // filters apply — measured from the next state, not the current one.
      const row = (bar.current?.firstElementChild as HTMLElement | null)?.offsetHeight ?? 56;
      const offset = navHeight() + row + (countActive(next) ? 42 : 0) + 20;
      const top = el.getBoundingClientRect().top;
      if (top < offset - 1) window.scrollTo({ top: window.scrollY + top - offset, behavior: 'instant' });
      if (!reduced()) {
        try {
          flip.current = flipReady().getState(el.querySelectorAll('[data-flip-id]'));
        } catch {
          flip.current = null;
        }
      }
    }
    onQuery(toQuery(next, nextSort));
  }, [onQuery]);

  const onToggle = useCallback(
    (group: keyof Filters, value: string) => commit(toggle(filters, group, value), sort),
    [commit, filters, sort],
  );
  const clearAll = useCallback(() => commit(EMPTY, sort), [commit, sort]);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  const pickCategory = (c: Category | null) => {
    const only = filters.category.length === 1 && filters.category[0] === c;
    commit({ ...filters, category: c === null || only ? [] : [c] }, sort);
  };

  // Cards that stay in the result set glide to their new places; cards that
  // arrive are revealed by the page's own reveal system.
  useLayoutEffect(() => {
    const state = flip.current;
    const el = grid.current;
    flip.current = null;
    if (!state || !el) return;
    let t: gsap.core.Timeline | null = null;
    try {
      t = flipReady().from(state, {
        targets: el.querySelectorAll('[data-flip-id]'),
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.012,
        prune: true,
        simple: true,
      });
    } catch {
      t = null;
    }
    return () => { t?.progress(1).kill(); };
  }, [results]);

  const changeDensity = (d: GridDensity) => {
    if (d === density) return;
    const el = grid.current;
    const line = bar.current?.getBoundingClientRect().bottom ?? 0;
    if (el && el.getBoundingClientRect().top < line) {
      // Keep the first card on screen where it is, so the reader does not
      // lose their place when every row changes height.
      const first = [...el.querySelectorAll<HTMLElement>('[data-flip-id]')]
        .find((c) => c.getBoundingClientRect().bottom > line + 8);
      anchor.current = first ? { id: first.dataset.flipId ?? '', top: first.getBoundingClientRect().top } : null;
    }
    densityChanged.current = true;
    writeDensity(d);
  };

  useLayoutEffect(() => {
    if (!densityChanged.current) return;
    densityChanged.current = false;
    const el = grid.current;
    if (!el) return;
    const a = anchor.current;
    anchor.current = null;
    if (a) {
      const node = el.querySelector<HTMLElement>(`[data-flip-id="${CSS.escape(a.id)}"]`);
      if (node) window.scrollBy({ top: node.getBoundingClientRect().top - a.top, behavior: 'instant' });
    }
    if (reduced()) return;
    const { gsap } = setupGsap();
    const view = window.innerHeight;
    const cells = [...el.children].filter((c) => {
      const r = c.getBoundingClientRect();
      return r.bottom > 0 && r.top < view;
    });
    const t = gsap.fromTo(
      cells,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: EASE.reveal, stagger: 0.035, clearProps: 'opacity,transform' },
    );
    return () => { t.progress(1).kill(); };
  }, [density]);

  // Campaign and story tiles only break up the unfiltered, unsorted grid, and
  // only where at least a full block of pieces follows them.
  const inserts = useMemo<GridInsert[]>(() => {
    if (!stories?.length || active > 0 || sort !== 'featured') return [];
    const out: GridInsert[] = [];
    stories.forEach((story, k) => {
      const at = 4 + k * 8;
      if (results.length >= at + 4) {
        out.push({
          at,
          key: `story-${k}`,
          node: <StoryTile story={story} side={k % 2 ? 'right' : 'left'} density={density} />,
        });
      }
    });
    return out;
  }, [stories, active, sort, results.length, density]);

  const section = mode === 'section';

  return (
    <>
      {/* ─── Head ───────────────────────────────────────────────────── */}
      {campaign && !section ? (
        <>
          <CampaignHero campaign={campaign} title={title} count={pool.length} eyebrow={eyebrow} />
          <div className="page pt-[clamp(1.25rem,2.5vw,2rem)]">
            <Crumbs title={title} pathname={pathname} />
          </div>
        </>
      ) : (
        <header ref={head} className={cn('page scroll-mt-(--nav-h)', section ? 'pt-[clamp(1.5rem,3.5vw,3rem)]' : 'pt-[calc(var(--nav-h)+clamp(1.25rem,3vw,2.75rem))]')}>
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3" data-reveal>
            {section ? (
              <p className="label">{eyebrow ?? title}</p>
            ) : (
              <Crumbs title={title} pathname={pathname} />
            )}
            {!section && eyebrow ? <p className="label text-mute">{eyebrow}</p> : null}
          </div>
          <div className="mt-[clamp(1.25rem,3vw,2.75rem)]">
            <PosterTitle
              text={title}
              count={pool.length}
              as={section ? 'h2' : 'h1'}
              cap={section ? 'min(22svh, 11rem)' : 'min(34svh, 21rem)'}
            />
          </div>
        </header>
      )}

      <div className="page grid-page items-end gap-y-7 pb-[clamp(1.75rem,4vw,3.5rem)] pt-[clamp(1.5rem,3.5vw,3rem)]">
        {description && !section ? (
          <p className="body-lg col-span-4 max-w-[34rem] text-mute md:col-span-6 lg:col-span-5" data-reveal>
            {description}
          </p>
        ) : null}
        {options.category.length > 1 ? (
          <CategoryIndex
            className={cn(
              'col-span-4 md:col-span-6',
              description && !section ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-12',
            )}
            label={section ? `${eyebrow ?? title}: categories` : `${title}: categories`}
            total={pool.length}
            categories={options.category}
            counts={perCategory}
            active={filters.category}
            onPick={pickCategory}
          />
        ) : null}
      </div>

      {/* ─── Toolbar and results ─────────────────────────────────────
          One block, so the bar lets go where the grid ends rather than
          riding over whatever follows the listing. */}
      <div>
        <div
          ref={bar}
          className="sticky top-[var(--header-offset,var(--nav-h))] z-30 border-y border-line bg-bone/92 backdrop-blur-md transition-[top] duration-[560ms] ease-expo"
        >
          <div className="page flex h-14 items-center gap-3 md:gap-6">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-haspopup="dialog"
              aria-expanded={drawer}
              aria-controls="listing-filters"
              className="label -ml-1 inline-flex min-h-11 items-center gap-2.5 px-1 transition-opacity hover:opacity-60"
            >
              <Icon name="filter" className="h-4 w-4" />
              Filter
              {active ? (
                <span className="nums inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center bg-ink px-1 text-[0.625rem] leading-none text-bone">
                  {active}
                  <span className="sr-only"> active</span>
                </span>
              ) : null}
            </button>
            <span aria-hidden className="hidden h-4 w-px bg-line-2 md:block" />
            <ResultCount n={results.length} />

            <div className="ml-auto flex items-center gap-1 md:gap-6">
              <SortMenu sort={sort} onSort={(s) => commit(filters, s)} />
              <ViewToggle density={density} onChange={changeDensity} />
            </div>
          </div>

          {selected.length > 0 ? (
            <div className="page no-bar -mt-1 flex items-center gap-2 overflow-x-auto pb-3 pt-0.5">
              {selected.map((chip) => (
                <button
                  key={`${chip.group}-${chip.value}`}
                  type="button"
                  onClick={() => onToggle(chip.group, chip.value)}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="label-sm inline-flex h-8 shrink-0 items-center gap-2 border border-line-2 bg-bone pl-3 pr-2.5 transition-colors duration-200 hover:border-ink"
                >
                  {chip.label}
                  <Icon name="close" className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="label-sm ml-1 inline-flex min-h-8 shrink-0 items-center px-2 underline decoration-1 underline-offset-4 transition-opacity hover:opacity-60"
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>

        {/* ─── Results ────────────────────────────────────────────────── */}
        <div className="page pb-(--section) pt-[clamp(1.75rem,3.5vw,3rem)]">
          {results.length === 0 ? (
            <Empty onClear={clearAll} onEdit={() => setDrawer(true)} />
          ) : (
            <>
              <ProductGrid
                ref={grid}
                products={results}
                columns={4}
                density={density}
                inserts={inserts}
                priorityCount={campaign ? 0 : density === 'large' ? 2 : 4}
                label={`${section ? eyebrow ?? title : title} — ${plural(results.length, 'piece')}`}
              />
              <div className="mt-[clamp(3.5rem,7vw,6rem)] flex items-center justify-between gap-6 border-t border-ink pt-4">
                <p className="label nums text-mute">
                  {pad2(results.length)} of {pad2(pool.length)}
                  <span className="hidden sm:inline"> — {active ? 'filtered' : 'the full range'}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const behavior = reduced() ? 'auto' : 'smooth';
                    if (section && head.current) head.current.scrollIntoView({ behavior, block: 'start' });
                    else window.scrollTo({ top: 0, behavior });
                  }}
                  className="label link-arrow min-h-11"
                >
                  Back to top
                  <Icon name="arrowUp" className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawer}
        onClose={closeDrawer}
        pool={pool}
        options={options}
        filters={filters}
        onToggle={onToggle}
        onClear={clearAll}
        count={results.length}
        active={active}
      />
    </>
  );
}

// ─── Head ──────────────────────────────────────────────────────────────────

/**
 * The title as a poster: capitals edge to edge, with the count at the far end
 * in stone, the way the logotype sits behind the home page. The size comes
 * from measured glyph widths in CSS, so the line fits before any script runs.
 * On a phone the count steps out and the word takes the full width.
 */
function PosterTitle({
  text, count, as: Tag = 'h1', cap, tone = 'ink',
}: { text: string; count: number; as?: 'h1' | 'h2'; cap: string; tone?: 'ink' | 'bone' }) {
  const n = pad2(count);
  const vars = {
    '--poster-sm': posterSize(text, cap),
    '--poster-md': posterSize(`${text}  ${n}`, cap),
  } as React.CSSProperties;
  return (
    <Tag className="@container block w-full">
      <span
        style={vars}
        className="flex w-full items-start justify-between whitespace-nowrap font-semibold uppercase leading-[0.8] tracking-[-0.055em] text-(length:--poster-sm) md:text-(length:--poster-md)"
      >
        <Lines text={text} />
        <span aria-hidden className={cn('hidden md:block', tone === 'ink' ? 'text-stone-brand' : 'text-bone/40')}>
          <Lines text={n} />
        </span>
      </span>
    </Tag>
  );
}

function CampaignHero({
  campaign, title, count, eyebrow,
}: { campaign: NonNullable<ListingProps['campaign']>; title: string; count: number; eyebrow?: string }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      // The picture settles out of a slight zoom on arrival, then drifts
      // slower than the page as it is scrolled away.
      gsap.fromTo('[data-hero="zoom"]', { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'expo.out' });
      gsap.to('[data-hero="drift"]', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-header-over
      aria-label={campaign.kicker}
      className="on-ink relative isolate flex h-[min(92svh,64rem)] min-h-[32rem] flex-col justify-end overflow-hidden bg-ink text-bone"
    >
      <div data-hero="drift" className="absolute inset-0 -z-10 will-change-transform">
        <div data-hero="zoom" className="absolute inset-0">
          <ArtImage wide={campaign.image} tall={campaign.tall} alt={campaign.alt} priority />
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-black/35" />

      <div className="page pb-[clamp(1rem,2.5vw,2.25rem)]">
        <div className="flex items-baseline justify-between gap-6 border-b border-bone/30 pb-3" data-reveal>
          <p className="label">{campaign.kicker}</p>
          {eyebrow ? <p className="label hidden text-bone/75 sm:block">{eyebrow}</p> : null}
        </div>
        <div className="mt-[clamp(0.875rem,2vw,1.75rem)]">
          <PosterTitle text={title} count={count} tone="bone" cap="min(30svh, 19rem)" />
        </div>
      </div>
    </section>
  );
}

function Crumbs({ title, pathname }: { title: string; pathname: string }) {
  const inCollection = pathname.startsWith('/collections/');
  return (
    <nav aria-label="Breadcrumb">
      <ol className="label flex flex-wrap items-baseline gap-x-2 text-mute">
        <li><Link href="/" className="link-quiet">Home</Link></li>
        {inCollection ? (
          <>
            <li aria-hidden>/</li>
            <li><Link href="/collections" className="link-quiet">Collections</Link></li>
          </>
        ) : null}
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-ink">{title}</li>
      </ol>
    </nav>
  );
}

/**
 * The categories in this listing, set as a line of type with their counts.
 * Picking one shows only that category; picking it again, or All, shows
 * everything. It writes the same category filter the panel does.
 */
function CategoryIndex({
  className, label, total, categories, counts, active, onPick,
}: {
  className?: string;
  label: string;
  total: number;
  categories: Category[];
  counts: Map<string, number>;
  active: string[];
  onPick: (c: Category | null) => void;
}) {
  const item = (on: boolean) =>
    cn(
      'group/cat relative inline-flex min-h-11 items-start gap-1.5 whitespace-nowrap pt-2 text-[clamp(1.375rem,1rem+1vw,1.875rem)] font-semibold leading-none tracking-[-0.045em] transition-colors duration-300',
      on ? 'text-ink' : 'text-mute hover:text-ink',
    );
  const rule = (on: boolean) =>
    cn(
      'absolute inset-x-0 -bottom-1.5 h-[2px] origin-left bg-ink transition-transform duration-500 ease-expo',
      on ? 'scale-x-100' : 'scale-x-0 group-hover/cat:scale-x-100',
    );

  return (
    <nav aria-label={label} className={className} data-reveal>
      <ul className="no-bar -mx-(--gutter) flex gap-x-[clamp(1.25rem,1.9vw,2rem)] overflow-x-auto px-(--gutter) pb-2 md:mx-0 md:flex-wrap md:gap-y-1 md:overflow-visible md:px-0">
        <li className="shrink-0">
          <button type="button" aria-pressed={active.length === 0} onClick={() => onPick(null)} className={item(active.length === 0)}>
            <span className="relative">All<span aria-hidden className={rule(active.length === 0)} /></span>
            <span className="label-sm nums text-mute">{pad2(total)}</span>
          </button>
        </li>
        {categories.map((c) => {
          const on = active.includes(c);
          return (
            <li key={c} className="shrink-0">
              <button type="button" aria-pressed={on} onClick={() => onPick(c)} className={item(on)}>
                <span className="relative">{c}<span aria-hidden className={rule(on)} /></span>
                <span className="label-sm nums text-mute">
                  <span className="sr-only">, </span>
                  {pad2(counts.get(c) ?? 0)}
                  <span className="sr-only"> pieces</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Toolbar controls ──────────────────────────────────────────────────────

/** The count in the toolbar settles in when it changes, and is announced. */
function ResultCount({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(n);
  useEffect(() => {
    const el = ref.current;
    if (!el || last.current === n) return;
    last.current = n;
    if (reduced()) return;
    const { gsap } = setupGsap();
    const t = gsap.fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: EASE.reveal });
    return () => { t.kill(); };
  }, [n]);
  return (
    <p className="label nums overflow-hidden text-mute" aria-live="polite" aria-atomic="true">
      <span ref={ref} className="inline-block">{plural(n, 'piece')}</span>
    </p>
  );
}

function SortMenu({ sort, onSort }: { sort: SortKey; onSort: (s: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = SORTS.find((s) => s.key === sort) ?? SORTS[0];

  useEffect(() => {
    if (!open) return;
    const menu = wrap.current?.querySelector<HTMLElement>('[role="menu"]');
    const t = window.setTimeout(() => {
      (menu?.querySelector<HTMLElement>('[aria-checked="true"]') ?? menu?.querySelector<HTMLElement>('[role="menuitemradio"]'))?.focus();
    }, 30);
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => { window.clearTimeout(t); document.removeEventListener('pointerdown', onDown); };
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    const items = [...(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const go = (k: number) => { e.preventDefault(); items[(k + items.length) % items.length]?.focus(); };
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); button.current?.focus(); }
    else if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div ref={wrap} className="relative" onKeyDown={onKey}>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="listing-sort"
        onClick={() => setOpen((o) => !o)}
        className="label inline-flex min-h-11 items-center gap-2 px-1 transition-opacity hover:opacity-60"
      >
        <span className="md:text-mute">Sort</span>
        <span className="hidden md:inline">{current.label}</span>
        <Icon name="chevD" className={cn('h-3 w-3 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div
        id="listing-sort"
        role="menu"
        aria-label="Sort by"
        className={cn(
          'absolute right-0 top-[calc(100%+0.625rem)] z-40 w-64 border border-line bg-bone py-2 transition-[opacity,transform,visibility] duration-300 ease-expo',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1.5 opacity-0',
        )}
      >
        <p className="label-sm px-4 pb-2 pt-1 text-mute" aria-hidden>Sort by</p>
        {SORTS.map((s) => {
          const on = s.key === sort;
          return (
            <button
              key={s.key}
              type="button"
              role="menuitemradio"
              aria-checked={on}
              tabIndex={-1}
              onClick={() => { onSort(s.key); setOpen(false); button.current?.focus(); }}
              className={cn(
                'flex min-h-11 w-full items-center justify-between gap-4 px-4 text-left text-sm transition-colors duration-200 hover:bg-bone-2 focus-visible:-outline-offset-2',
                on ? 'font-medium text-ink' : 'text-mute hover:text-ink',
              )}
            >
              {s.label}
              {on ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ViewToggle({ density, onChange }: { density: GridDensity; onChange: (d: GridDensity) => void }) {
  const btn = (on: boolean) =>
    cn(
      'inline-flex h-11 w-10 items-center justify-center transition-colors duration-200',
      on ? 'text-ink' : 'text-hint hover:text-ink',
    );
  return (
    <div role="group" aria-label="Picture size" className="-mr-2 flex items-center">
      <span className="label mr-1 hidden text-mute lg:inline" aria-hidden>View</span>
      <button type="button" aria-pressed={density === 'compact'} aria-label="Smaller pictures, more per row" onClick={() => onChange('compact')} className={btn(density === 'compact')}>
        <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden>
          <rect x="1" y="1" width="6" height="6" /><rect x="9" y="1" width="6" height="6" />
          <rect x="1" y="9" width="6" height="6" /><rect x="9" y="9" width="6" height="6" />
        </svg>
      </button>
      <button type="button" aria-pressed={density === 'large'} aria-label="Larger pictures, fewer per row" onClick={() => onChange('large')} className={btn(density === 'large')}>
        <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden>
          <rect x="1" y="1" width="14" height="14" />
        </svg>
      </button>
    </div>
  );
}

// ─── Grid pieces ───────────────────────────────────────────────────────────

/**
 * A story tile. In the four-up grid it takes two columns and two rows, on
 * alternate sides; in the large view, and on a phone, the full width.
 */
function StoryTile({ story, side, density }: { story: ListingStory; side: 'left' | 'right'; density: GridDensity }) {
  const large = density === 'large';
  const motion = 'transition-transform duration-[1600ms] ease-expo group-hover/story:scale-[1.04]';
  return (
    <Link
      href={story.href}
      className={cn(
        'group/story on-ink relative block min-h-[22rem] overflow-hidden bg-graphite text-bone',
        large
          ? 'col-span-full aspect-[4/5] md:aspect-[16/9]'
          : cn('col-span-2 aspect-[4/5] md:row-span-2 md:aspect-auto', side === 'right' && 'lg:col-start-3'),
      )}
    >
      <div data-reveal-img className="absolute inset-0">
        <div className="absolute inset-0">
          {large ? (
            <ArtImage wide={story.wide ?? story.image} tall={story.image} alt={story.alt} className={cn(story.crop, motion)} />
          ) : (
            <ArtImage
              wide={story.image}
              alt={story.alt}
              sizes="(min-width:1024px) 48vw, (min-width:768px) 64vw, 100vw"
              className={cn(story.crop, motion)}
            />
          )}
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
      <div className="absolute inset-x-0 top-0 flex items-baseline justify-between gap-4 p-[clamp(1rem,2vw,1.75rem)]">
        <p className="label text-bone/85">{story.kicker}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-[clamp(1rem,2.2vw,2rem)]">
        <h3 className="max-w-[11ch] text-[clamp(2rem,1rem+3.4vw,4.5rem)] font-semibold leading-[0.88] tracking-[-0.05em]">
          {story.title}
        </h3>
        {story.text ? (
          <p className="mt-4 hidden max-w-[40ch] text-sm leading-relaxed text-bone/80 md:block">{story.text}</p>
        ) : null}
        <span className="label mt-6 inline-flex items-center gap-2 border-b border-bone/50 pb-1.5 transition-colors duration-300 group-hover/story:border-bone">
          {story.cta}
          <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover/story:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function Empty({ onClear, onEdit }: { onClear: () => void; onEdit: () => void }) {
  return (
    <div className="grid-page py-[clamp(2.5rem,7vw,6rem)]">
      <div className="col-span-4 md:col-span-6 lg:col-span-8">
        <p className="label text-mute">No pieces</p>
        <p className="display-lg mt-5 max-w-[14ch]">Nothing in that combination.</p>
        <p className="body-lg mt-6 max-w-[34rem] text-mute">
          Most pieces come in a few colours and five sizes, so a narrow selection empties quickly.
          Take a filter off, or start again.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <button type="button" onClick={onClear} className="btn btn-solid">Clear all filters</button>
          <button type="button" onClick={onEdit} className="btn btn-ghost">Edit filters</button>
        </div>
      </div>
    </div>
  );
}

// ─── The filter panel ──────────────────────────────────────────────────────

type FacetOptions = ReturnType<typeof facets>;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * The panel comes in from the left on a desktop, over a light scrim, so the
 * grid can be seen rearranging behind it; on a phone it is a sheet from the
 * bottom. Every option carries the number of pieces it would leave, given
 * everything else chosen, and an option that would leave none is set aside.
 */
function FilterDrawer({
  open, onClose, pool, options, filters, onToggle, onClear, count, active,
}: {
  open: boolean;
  onClose: () => void;
  pool: Product[];
  options: FacetOptions;
  filters: Filters;
  onToggle: (group: keyof Filters, value: string) => void;
  onClear: () => void;
  count: number;
  active: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  const countOf = useCallback(
    (group: keyof Filters, value: string) => apply(pool, { ...filters, [group]: [value] }, 'featured').length,
    [pool, filters],
  );

  useEffect(() => {
    const el = root.current;
    const p = panel.current;
    const s = scrim.current;
    if (!el || !p || !s) return;
    if (!mounted.current) {
      mounted.current = true;
      if (!open) return;
    }
    const { gsap } = setupGsap();
    const desk = window.matchMedia('(min-width: 1024px)').matches;
    const axis = desk ? 'xPercent' : 'yPercent';
    const away = desk ? -100 : 100;

    if (reduced()) {
      gsap.set(el, { autoAlpha: open ? 1 : 0 });
      gsap.set(p, { xPercent: 0, yPercent: 0 });
      return;
    }
    const tl = gsap.timeline();
    if (open) {
      tl.set(el, { autoAlpha: 1 })
        .set(p, { xPercent: 0, yPercent: 0 })
        .fromTo(s, { opacity: 0 }, { opacity: 1, duration: DUR.panel, ease: EASE.ui }, 0)
        .fromTo(p, { [axis]: away }, { [axis]: 0, duration: 0.7, ease: 'expo.out' }, 0)
        .fromTo(
          p.querySelectorAll('[data-group]'),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.55, ease: EASE.reveal, stagger: 0.045 },
          0.12,
        );
    } else {
      tl.to(p, { [axis]: away, duration: 0.36, ease: 'power3.in' }, 0)
        .to(s, { opacity: 0, duration: 0.36, ease: EASE.ui }, 0)
        .set(el, { autoAlpha: 0 });
    }
    return () => { tl.kill(); };
  }, [open]);

  // While open: the page is locked, focus is kept inside, Escape closes, and
  // focus goes back to whatever opened the panel.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const opener = document.activeElement as HTMLElement | null;
    body.style.setProperty('--scrollbar', `${window.innerWidth - document.documentElement.clientWidth}px`);
    body.dataset.locked = 'true';
    const p = panel.current;
    const t = window.setTimeout(() => p?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 90);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !p) return;
      const items = [...p.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      delete body.dataset.locked;
      body.style.removeProperty('--scrollbar');
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const picked = (g: keyof Filters) => filters[g].length;

  return (
    <div ref={root} id="listing-filters" className="invisible fixed inset-0 z-[70] opacity-0" inert={!open}>
      <div ref={scrim} aria-hidden className="absolute inset-0 bg-ink/45 lg:bg-ink/30" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-filters-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col bg-bone lg:inset-y-0 lg:left-0 lg:right-auto lg:max-h-none lg:w-[min(31rem,100vw)]"
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 bg-line-2 lg:hidden" />
        <div className="flex items-start justify-between gap-4 px-(--gutter) pb-5 pt-4 lg:pt-[calc(var(--nav-h)*0.5)]">
          <h2 id="listing-filters-title" className="flex items-start gap-2 text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-semibold uppercase leading-[0.82] tracking-[-0.055em]">
            Filter
            {active ? <span className="label nums mt-1 tracking-[0.1em] text-mute">{pad2(active)}</span> : null}
          </h2>
          <button type="button" data-autofocus onClick={onClose} className="icon-btn -mt-1.5" aria-label="Close filters">
            <Icon name="close" />
          </button>
        </div>

        <div className="no-bar flex-1 overflow-y-auto overscroll-contain px-(--gutter) pb-8">
          <Group n={1} title="Category" picked={picked('category')}>
            {options.category.map((c) => (
              <CheckRow key={c} label={c} on={filters.category.includes(c)} count={countOf('category', c)} onChange={() => onToggle('category', c)} />
            ))}
          </Group>

          <Group n={2} title="Size" picked={picked('size')}>
            <div className="space-y-5 pt-1">
              {options.size.map((sys) => (
                <div key={sys.system}>
                  <p className="label-sm mb-2.5 text-mute">{sys.label}</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {sys.values.map((v) => {
                      const on = filters.size.includes(v.key);
                      const none = !on && countOf('size', v.key) === 0;
                      return (
                        <button
                          key={v.key}
                          type="button"
                          aria-pressed={on}
                          disabled={none}
                          onClick={() => onToggle('size', v.key)}
                          aria-label={`${sys.label} ${v.label}${none ? ', none in this selection' : ''}`}
                          className={cn(
                            'label-sm nums min-h-11 border px-1 text-center transition-colors duration-200',
                            on
                              ? 'border-ink bg-ink text-bone'
                              : none
                                ? 'cursor-not-allowed border-line text-hint line-through'
                                : 'border-line-2 hover:border-ink',
                          )}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Group>

          <Group n={3} title="Colour" picked={picked('colour')}>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {options.colour.map((c) => (
                <CheckRow
                  key={c.name}
                  label={c.name}
                  swatch={c.hex}
                  on={filters.colour.includes(c.name)}
                  count={countOf('colour', c.name)}
                  onChange={() => onToggle('colour', c.name)}
                />
              ))}
            </div>
          </Group>

          <Group n={4} title="Price" picked={picked('price')}>
            {PRICE_BANDS.map((b) => (
              <CheckRow key={b.key} label={`${b.label} SAR`} on={filters.price.includes(b.key)} count={countOf('price', b.key)} onChange={() => onToggle('price', b.key)} />
            ))}
          </Group>

          {options.collection.length > 1 ? (
            <Group n={5} title="Collection" picked={picked('collection')}>
              {options.collection.map((c) => (
                <CheckRow key={c.slug} label={c.name} on={filters.collection.includes(c.slug)} count={countOf('collection', c.slug)} onChange={() => onToggle('collection', c.slug)} />
              ))}
            </Group>
          ) : null}

          <Group n={options.collection.length > 1 ? 6 : 5} title="Fit and availability" picked={picked('fit') + picked('availability')}>
            {options.fit.length > 1
              ? options.fit.map((f) => (
                  <CheckRow key={f} label={FIT_LABELS[f]} on={filters.fit.includes(f)} count={countOf('fit', f)} onChange={() => onToggle('fit', f)} />
                ))
              : null}
            <CheckRow label="In stock" on={filters.availability.includes('in-stock')} count={countOf('availability', 'in-stock')} onChange={() => onToggle('availability', 'in-stock')} />
            <CheckRow label="On sale" on={filters.availability.includes('sale')} count={countOf('availability', 'sale')} onChange={() => onToggle('availability', 'sale')} />
          </Group>
        </div>

        <div className="grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t border-line px-(--gutter) py-4">
          <button type="button" className="btn btn-ghost px-5" onClick={onClear} disabled={!active}>
            Clear
          </button>
          <button type="button" className="btn btn-solid" onClick={onClose} disabled={count === 0}>
            {count === 0 ? 'No pieces' : `Show ${plural(count, 'piece')}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Group({
  n, title, picked, children,
}: { n: number; title: string; picked: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <section data-group className="border-t border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-14 w-full items-center justify-between gap-4 text-left"
        >
          <span className="label">
            <span className="nums mr-3 text-mute">{pad2(n)}</span>
            {title}
          </span>
          <span className="flex items-center gap-3">
            {picked ? <span className="label-sm nums text-mute">{picked} selected</span> : null}
            <Icon name={open ? 'minus' : 'plus'} className="h-3.5 w-3.5" />
          </span>
        </button>
      </h3>
      <div
        id={id}
        className={cn('grid transition-[grid-template-rows] duration-500 ease-expo', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="pb-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

function CheckRow({
  label, on, count, onChange, swatch,
}: { label: string; on: boolean; count: number; onChange: () => void; swatch?: string }) {
  const none = !on && count === 0;
  return (
    <label className={cn('group/row flex min-h-11 items-center gap-3 text-[0.9375rem]', none ? 'cursor-not-allowed text-hint' : 'cursor-pointer')}>
      <input type="checkbox" className="peer sr-only" checked={on} disabled={none} onChange={onChange} />
      <span
        aria-hidden
        className={cn(
          'flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center border transition-colors duration-200',
          on ? 'border-ink bg-ink text-bone' : none ? 'border-line' : 'border-line-2 group-hover/row:border-ink',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink',
        )}
      >
        {on ? <Icon name="check" className="h-3 w-3" /> : null}
      </span>
      {swatch ? (
        <span aria-hidden className={cn('h-4 w-4 shrink-0 ring-1 ring-line-2 ring-inset', none && 'opacity-40')} style={{ background: swatch }} />
      ) : null}
      <span className={cn('flex-1', on && 'font-medium')}>{label}</span>
      <span className="label-sm nums text-mute">
        <span className="sr-only">, </span>
        {count}
        <span className="sr-only">{count === 1 ? ' piece' : ' pieces'}</span>
      </span>
    </label>
  );
}
