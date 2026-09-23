import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { collections, products } from '@/lib/catalog';
import { plural } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Foundation, Atrium, Index and Runway 01 — the four MERIT collections, seasonal and permanent.',
  alternates: { canonical: '/collections' },
};

export default function CollectionsPage() {
  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm max-w-3xl">
        <p className="label text-mute" data-reveal>Four collections</p>
        <h1 className="display-lg mt-4"><Lines text="Two seasons, one permanent range, and the archive." /></h1>
      </header>

      <div className="pb-(--section)">
        {collections.map((c, i) => {
          const count = products.filter((p) => p.collection === c.slug).length;
          return (
            <article key={c.slug} className="rule-t py-10 md:py-14">
              <Link href={`/collections/${c.slug}`} className="group grid-page items-center">
                <div className={i % 2 === 0 ? 'col-span-4 md:col-span-3 lg:col-span-7' : 'col-span-4 md:col-span-3 lg:col-span-7 lg:order-2 lg:col-start-6'}>
                  <div className="frame frame-3-2" data-reveal-img>
                    <Image
                      src={`/img/${c.image}.webp`}
                      alt=""
                      width={2560}
                      height={1440}
                      sizes="(min-width:1024px) 56vw, 100vw"
                      priority={i === 0}
                      className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className={i % 2 === 0 ? 'col-span-4 md:col-span-3 lg:col-span-4 lg:col-start-9' : 'col-span-4 md:col-span-3 lg:order-1 lg:col-span-4'}>
                  <p className="label-sm text-mute" data-reveal>
                    <span className="nums mr-3">{String(i + 1).padStart(2, '0')}</span>
                    {c.season} <span className="nums">{c.year}</span>
                  </p>
                  <h2 className="display-md mt-3" data-reveal>{c.name}</h2>
                  <p className="mt-4 max-w-sm text-sm text-mute" data-reveal>{c.note}</p>
                  <p className="label-sm mt-6 inline-flex items-center gap-3" data-reveal>
                    <span className="nums">{plural(count, 'piece')}</span>
                    <span className="inline-flex items-center gap-2">
                      View
                      <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
