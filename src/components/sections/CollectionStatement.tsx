import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Collection } from '@/lib/catalog';

/**
 * The statement is the one place the type is allowed to be loud. A large
 * photograph holds the left, the sentence holds the right, and a cropped
 * detail steps out of the grid to break the symmetry.
 */
export function CollectionStatement({ collection, index }: { collection: Collection; index: number }) {
  return (
    <section className="page section-y" aria-labelledby="statement-title">
      <SectionHead
        index={index}
        title={`${collection.season} ${collection.year}`}
        link={{ label: 'View the campaign', href: '/editorial/the-rule-line' }}
        as="p"
      />

      <div className="grid-page mt-12 md:mt-16">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <div className="frame frame-3-4" data-reveal-img>
            <Image
              src={`/img/${collection.image}.webp`}
              alt={`${collection.name}, ${collection.season} ${collection.year}`}
              width={1400}
              height={1750}
              sizes="(min-width:1024px) 48vw, 100vw"
            />
          </div>
        </div>

        <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8 flex flex-col justify-between">
          <div>
            <h2 id="statement-title" className="display-lg">
              <Lines text={collection.statement} />
            </h2>
            <p className="body-lg mt-8 max-w-md text-mute" data-reveal>{collection.note}</p>
            <Link
              href={`/collections/${collection.slug}`}
              className="label group mt-8 inline-flex items-center gap-2.5"
              data-reveal
            >
              Shop {collection.name}
              <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* The detail crop hangs off the grid on purpose — it is the only
              element on the page that does not start on a column. */}
          <div className="mt-12 w-2/3 self-end lg:-mr-[8%] lg:mt-16 lg:w-[72%]">
            <div className="frame frame-1-1" data-reveal-img>
              <Image
                src={`/img/${collection.detail}.webp`}
                alt=""
                width={1400}
                height={1400}
                sizes="(min-width:1024px) 30vw, 60vw"
              />
            </div>
            <p className="label-sm mt-3 text-mute">Detail — {collection.name}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
