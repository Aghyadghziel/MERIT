'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import {
  apply, chips, countActive, EMPTY, facets, FIT_LABELS, fromQuery, PRICE_BANDS, SORTS,
  toggle, toQuery, type Filters, type SortKey,
} from '@/lib/filter';
import { plural } from '@/lib/format';

type Props = {
  pool: Product[];
  title: string;
  description?: string;
  /** An optional campaign image above the title. */
  campaign?: { image: string; kicker: string; alt: string };
  eyebrow?: string;
};

/**
 * One listing component behind every product page: New, Women, Men and each
 * collection. Filters live in the query string, so a filtered view can be
 * bookmarked, shared and reloaded.
 */
export function Listing({ pool, title, description, campaign, eyebrow }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [panelOpen, setPanelOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const { filters, sort } = useMemo(() => fromQuery(new URLSearchParams(params.toString())), [params]);
  const options = useMemo(() => facets(pool), [pool]);
  const results = useMemo(() => apply(pool, filters, sort), [pool, filters, sort]);
  const active = countActive(filters);
  const selected = chips(filters);

  const push = useCallback(
    (next: Filters, nextSort: SortKey) => {
      const q = toQuery(next, nextSort);
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const onToggle = (group: keyof Filters, value: string) => push(toggle(filters, group, value), sort);
  const clearAll = () => push(EMPTY, sort);

  // The desktop panel animates open once; height is animated deliberately here
  // rather than on scroll, so it costs one layout, not sixty a second.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const { gsap } = setupGsap();
    if (reduced()) { gsap.set(el, { height: panelOpen ? 'auto' : 0, opacity: panelOpen ? 1 : 0 }); return; }
    const anim = panelOpen
      ? gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: DUR.panel, ease: EASE.big })
      : gsap.to(el, { height: 0, opacity: 0, duration: 0.28, ease: EASE.ui });
    return () => { anim.kill(); };
  }, [panelOpen]);

  useEffect(() => {
    document.body.dataset.locked = sheetOpen ? 'true' : '';
    if (!sheetOpen) delete document.body.dataset.locked;
    return () => { delete document.body.dataset.locked; };
  }, [sheetOpen]);

  return (
    <>
      {campaign ? (
        <section className="on-ink relative bg-ink text-bone" data-header-over aria-hidden={false}>
          <div className="frame h-[46svh] min-h-[17rem] md:h-[62svh]">
            <Image
              src={`/img/${campaign.image}.webp`}
              alt={campaign.alt}
              width={2560}
              height={1440}
              sizes="100vw"
              priority
              className="opacity-90"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="page absolute inset-x-0 bottom-0 pb-8">
            <p className="label border-l border-bone/45 pl-4">{campaign.kicker}</p>
          </div>
        </section>
      ) : null}

      <div className="page pt-(--nav-h)">
        <header className="section-y-sm">
          {eyebrow ? <p className="label text-mute" data-reveal>{eyebrow}</p> : null}
          <h1 className="display-lg mt-4 max-w-4xl">
            <Lines text={title} />
          </h1>
          {description ? (
            <p className="body-lg mt-6 max-w-xl text-mute" data-reveal>{description}</p>
          ) : null}
        </header>

        {/* Toolbar */}
        <div className="rule-t rule-b sticky top-(--nav-h) z-30 -mx-(--gutter) bg-bone px-(--gutter)">
          <div className="flex h-14 items-center justify-between gap-4">
            <p className="label nums text-mute" aria-live="polite">
              {plural(results.length, 'piece')}
            </p>

            <div className="flex items-center gap-4 sm:gap-7">
              <button
                type="button"
                onClick={() => setPanelOpen(!panelOpen)}
                aria-expanded={panelOpen}
                aria-controls="filter-panel"
                className="label hidden items-center gap-2 hover:opacity-60 lg:inline-flex"
              >
                <Icon name="filter" className="h-4 w-4" />
                Filter{active ? <span className="nums text-oxide">({active})</span> : null}
              </button>

              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="label inline-flex items-center gap-2 lg:hidden"
              >
                <Icon name="filter" className="h-4 w-4" />
                Filter{active ? <span className="nums text-oxide">({active})</span> : null}
              </button>

              <label className="label flex items-center gap-2">
                <span className="sr-only">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => push(filters, e.target.value as SortKey)}
                  className="label cursor-pointer bg-transparent py-1"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div ref={panel} className="hidden overflow-hidden lg:block" id="filter-panel" style={{ height: 0 }}>
            <FacetColumns options={options} filters={filters} onToggle={onToggle} />
          </div>
        </div>

        {/* Selected filters */}
        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-5">
            <span className="label-sm mr-1 text-mute">Selected</span>
            {selected.map((chip) => (
              <button
                key={`${chip.group}-${chip.value}`}
                type="button"
                onClick={() => onToggle(chip.group, chip.value)}
                className="label-sm inline-flex items-center gap-2 border border-line py-1.5 pl-3 pr-2 transition-colors hover:border-ink"
              >
                {chip.label}
                <Icon name="close" className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
            <button type="button" onClick={clearAll} className="label-sm ml-1 text-oxide underline underline-offset-4">
              Clear all
            </button>
          </div>
        ) : null}

        {/* Results */}
        <div className="pb-(--section) pt-10 md:pt-14">
          {results.length === 0 ? (
            <div className="max-w-lg py-16">
              <p className="display-md">Nothing matches those filters.</p>
              <p className="mt-4 text-sm text-mute">
                Try removing a size or a colour — most pieces are made in three colours and five
                sizes, so narrow selections empty quickly.
              </p>
              <button type="button" onClick={clearAll} className="btn btn-solid mt-8">Clear all filters</button>
            </div>
          ) : (
            <ProductGrid products={results} columns={4} priorityCount={4} label={`${title} — products`} />
          )}
        </div>
      </div>

      {/* Mobile sheet */}
      <MobileFilters
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        options={options}
        filters={filters}
        onToggle={onToggle}
        onClear={clearAll}
        count={results.length}
      />
    </>
  );
}

type FacetProps = {
  options: ReturnType<typeof facets>;
  filters: Filters;
  onToggle: (group: keyof Filters, value: string) => void;
};

function FacetColumns({ options, filters, onToggle }: FacetProps) {
  return (
    <div className="grid grid-cols-6 gap-(--gutter) py-8">
      <Group title="Category">
        {options.category.map((c) => (
          <Check key={c} label={c} on={filters.category.includes(c)} onChange={() => onToggle('category', c)} />
        ))}
      </Group>

      <Group title="Size">
        {options.size.map((group) => (
          <div key={group.system} className="mb-4 last:mb-0">
            <p className="label-sm mb-2 text-mute">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.values.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => onToggle('size', v.key)}
                  aria-pressed={filters.size.includes(v.key)}
                  aria-label={`${group.label} ${v.label}`}
                  className={cn(
                    'label-sm min-w-11 border px-2 py-2 transition-colors',
                    filters.size.includes(v.key) ? 'border-ink bg-ink text-bone' : 'border-line hover:border-ink',
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Group>

      <Group title="Colour">
        {options.colour.map((c) => (
          <Check
            key={c.name}
            label={c.name}
            on={filters.colour.includes(c.name)}
            onChange={() => onToggle('colour', c.name)}
            swatch={c.hex}
          />
        ))}
      </Group>

      <Group title="Price">
        {PRICE_BANDS.map((b) => (
          <Check key={b.key} label={`${b.label} SAR`} on={filters.price.includes(b.key)} onChange={() => onToggle('price', b.key)} />
        ))}
      </Group>

      <Group title="Collection">
        {options.collection.map((c) => (
          <Check key={c.slug} label={c.name} on={filters.collection.includes(c.slug)} onChange={() => onToggle('collection', c.slug)} />
        ))}
      </Group>

      <Group title="Fit and availability">
        {options.fit.map((f) => (
          <Check key={f} label={FIT_LABELS[f]} on={filters.fit.includes(f)} onChange={() => onToggle('fit', f)} />
        ))}
        <Check label="In stock" on={filters.availability.includes('in-stock')} onChange={() => onToggle('availability', 'in-stock')} />
        <Check label="On sale" on={filters.availability.includes('sale')} onChange={() => onToggle('availability', 'sale')} />
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="col-span-6 md:col-span-3 lg:col-span-1">
      <legend className="label-sm mb-4 text-mute">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function Check({
  label, on, onChange, swatch,
}: { label: string; on: boolean; onChange: () => void; swatch?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={on} onChange={onChange} className="sr-only peer" />
      <span
        aria-hidden
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors',
          on ? 'border-ink bg-ink text-bone' : 'border-line-2',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-oxide',
        )}
      >
        {on ? <Icon name="check" className="h-2.5 w-2.5" /> : null}
      </span>
      {swatch ? <span aria-hidden className="block h-3 w-3 ring-1 ring-line-2 ring-inset" style={{ background: swatch }} /> : null}
      <span className={cn(on && 'font-medium')}>{label}</span>
    </label>
  );
}

function MobileFilters({
  open, onClose, options, filters, onToggle, onClear, count,
}: FacetProps & { open: boolean; onClose: () => void; onClear: () => void; count: number }) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const { gsap } = setupGsap();
    if (reduced()) { gsap.set(el, { autoAlpha: open ? 1 : 0, yPercent: 0 }); return; }
    const t = open
      ? gsap.timeline()
          .set(el, { autoAlpha: 1 })
          .fromTo(el.querySelector('[data-sheet]'), { yPercent: 100 }, { yPercent: 0, duration: DUR.panel, ease: EASE.big })
      : gsap.timeline()
          .to(el.querySelector('[data-sheet]'), { yPercent: 100, duration: 0.28, ease: EASE.ui })
          .set(el, { autoAlpha: 0 });
    return () => { t.kill(); };
  }, [open]);

  return (
    <div ref={sheet} className="invisible fixed inset-0 z-[70] opacity-0 lg:hidden" inert={!open}>
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} aria-hidden />
      <div
        data-sheet
        role="dialog"
        aria-modal="true"
        aria-label="Filter"
        className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col bg-bone"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-(--gutter) pr-2">
          <h2 className="label">Filter</h2>
          <button type="button" className="icon-btn mr-2" onClick={onClose} aria-label="Close filters">
            <Icon name="close" />
          </button>
        </div>
        <div className="no-bar flex-1 overflow-y-auto px-(--gutter)">
          <FacetColumns options={options} filters={filters} onToggle={onToggle} />
        </div>
        <div className="flex shrink-0 gap-3 border-t border-line px-(--gutter) py-4">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClear}>Clear all</button>
          <button type="button" className="btn btn-solid flex-1" onClick={onClose}>
            Show {count}
          </button>
        </div>
      </div>
    </div>
  );
}
