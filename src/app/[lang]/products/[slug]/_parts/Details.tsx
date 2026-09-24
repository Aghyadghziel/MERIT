import Link from '@/i18n/link';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { pad2 } from '@/lib/format';

/**
 * <details> opens and closes by animating its content box where the browser
 * can (::details-content with interpolate-size), and simply snaps open where
 * it cannot. No script, and nothing to go wrong when it is missing.
 */
const ACCORDION = cn(
  '[interpolate-size:allow-keywords]',
  '[&::details-content]:h-0 [&::details-content]:overflow-clip',
  '[&::details-content]:[transition:height_560ms_cubic-bezier(.16,1,.3,1),content-visibility_560ms_allow-discrete]',
  '[&[open]::details-content]:h-auto',
  'motion-reduce:[&::details-content]:[transition:none]',
);

/**
 * The piece, in words: the description set large on the left, the facts in
 * ruled folds on the right. Everything here comes from the catalogue entry.
 */
export function Details({ product }: { product: Product }) {
  const oneSize = product.sizes.length === 1;
  const items = [
    {
      title: oneSize ? 'Size and dimensions' : 'Fit and size',
      body: (
        <>
          <p>{product.fit}</p>
          {product.modelNote ? <p className="mt-2 text-mute">{product.modelNote}</p> : null}
          {!oneSize ? (
            <Link href="/size-guide" className="link-rule mt-4 inline-block text-mute">
              Size guide
            </Link>
          ) : null}
        </>
      ),
    },
    {
      title: 'Materials and origin',
      body: (
        <>
          <ul className="space-y-1.5">
            {product.materials.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <p className="mt-3 text-mute">{product.madeIn}.</p>
        </>
      ),
    },
    {
      title: 'Care',
      body: (
        <ul className="space-y-1.5">
          {product.care.map((c) => <li key={c}>{c}</li>)}
        </ul>
      ),
    },
    {
      title: 'Delivery and returns',
      body: (
        <>
          <ul className="space-y-1.5">
            <li>Riyadh and Jeddah — two working days; the rest of Saudi Arabia, two to three.</li>
            <li>Gulf — three to five working days. Free over 1,500 SAR in Saudi Arabia and the Gulf.</li>
            <li>Europe and UK — five to eight working days; elsewhere five to ten, duties paid at checkout.</li>
            <li>Returns accepted within 30 days, unworn and with the tag attached.</li>
          </ul>
          <Link href="/shipping-returns" className="link-rule mt-4 inline-block text-mute">
            Full policy
          </Link>
        </>
      ),
    },
  ];

  return (
    <section id="details" aria-labelledby="details-title" className="page border-t border-line">
      <div className="grid-page section-y gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <p className="label text-mute" data-reveal>The piece</p>
          <h2 id="details-title" className="sr-only">About the {product.name}</h2>
          <p
            className="mt-6 max-w-[40rem] text-[clamp(1.375rem,0.95rem+1.2vw,2.125rem)] font-medium leading-[1.14] tracking-[-0.028em]"
            data-reveal
          >
            {product.description}
          </p>
          <dl className="mt-10 grid max-w-[40rem] grid-cols-2 gap-x-(--gutter) border-t border-line pt-5" data-reveal>
            <div>
              <dt className="label-sm text-mute">Material</dt>
              <dd className="mt-2 text-sm leading-snug">{product.materials[0]}</dd>
            </div>
            <div>
              <dt className="label-sm text-mute">Origin</dt>
              <dd className="mt-2 text-sm leading-snug">{product.madeIn}</dd>
            </div>
          </dl>
        </div>

        <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:pt-11" data-reveal>
          <div className="border-b border-line">
            {items.map((it, i) => (
              <details key={it.title} className={cn('group border-t border-line', ACCORDION)} open={i === 0}>
                <summary className="flex min-h-16 cursor-pointer list-none items-center gap-5 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="label-sm nums w-6 shrink-0 text-mute">{pad2(i + 1)}</span>
                  <span className="flex-1 text-lg font-medium leading-tight tracking-[-0.02em] md:text-xl">{it.title}</span>
                  <span aria-hidden className="relative block h-3 w-3 shrink-0">
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                    <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-open:scale-y-0" />
                  </span>
                </summary>
                <div className="pb-8 pl-11 text-sm leading-relaxed">{it.body}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
