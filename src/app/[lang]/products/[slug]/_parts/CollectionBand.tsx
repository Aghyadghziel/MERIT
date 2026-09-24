import Image from 'next/image';
import Link from '@/i18n/link';
import { Icon } from '@/components/ui/Icon';
import type { Collection } from '@/lib/catalog';
import { FitText } from './FitText';
import { BAND } from './pairing';
import { Parallax } from './Parallax';

/**
 * Where the piece comes from: the collection's campaign picture, full bleed,
 * with its name set at poster size. The copy is the collection's own.
 */
export function CollectionBand({ collection }: { collection: Collection }) {
  const art = BAND[collection.slug];
  return (
    <section aria-labelledby="band-title" className="on-ink relative isolate overflow-hidden bg-graphite text-bone">
      <Parallax className="absolute inset-x-0 -bottom-[12%] -top-[12%] -z-20">
        <Image
          src={`/img/${art.tall}.webp`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover [filter:saturate(0.85)_contrast(1.04)] md:hidden"
          style={{ objectPosition: art.posTall }}
        />
        <Image
          src={`/img/${art.wide}.webp`}
          alt=""
          fill
          sizes="100vw"
          className="hidden object-cover [filter:saturate(0.85)_contrast(1.04)] md:block"
          style={{ objectPosition: art.posWide }}
        />
      </Parallax>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.78)_0%,rgb(0_0_0/0.35)_45%,rgb(0_0_0/0.12)_75%,rgb(0_0_0/0.3)_100%)]"
      />

      <div className="page flex min-h-[max(36rem,130vw)] flex-col justify-between py-[clamp(1.5rem,1rem+2vw,3rem)] md:min-h-[min(56.25vw,60rem)]">
        <div className="flex items-start justify-between gap-6">
          <p className="label">From the collection</p>
          <p className="label nums text-bone/75">
            {collection.season} {collection.year}
          </p>
        </div>

        <div className="pt-24">
          <div>
            <FitText
              id="band-title"
              text={collection.name}
              max={0.42}
              className="-ml-[0.045em] text-[clamp(3.25rem,0.5rem+12vw,15rem)] font-semibold uppercase leading-[0.8] tracking-[-0.06em]"
            />
          </div>
          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-12 md:items-end md:gap-(--gutter)">
            <p
              className="text-[clamp(1.25rem,1rem+0.8vw,1.75rem)] font-medium leading-[1.12] tracking-[-0.02em] text-balance md:col-span-5"
              data-reveal
            >
              {collection.statement}
            </p>
            <p className="max-w-md text-sm leading-relaxed text-bone/80 md:col-span-4" data-reveal>
              {collection.note}
            </p>
            <div className="md:col-span-3 md:justify-self-end" data-reveal>
              <Link href={`/collections/${collection.slug}`} className="btn">
                Explore {collection.name}
                <Icon name="arrowR" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
