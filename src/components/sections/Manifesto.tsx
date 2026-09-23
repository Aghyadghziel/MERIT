import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/ui/Lines';

/**
 * Fifty-four words. The rule down the left is the only ornament, and the
 * photograph is the room the clothes are made in rather than a garment.
 */
export function Manifesto() {
  return (
    <section className="on-ink bg-ink text-bone" aria-labelledby="manifesto-title">
      <div className="relative">
        <div className="frame h-[52svh] min-h-[18rem] md:h-[68svh]" data-reveal-img>
          <Image
            src="/img/manifesto-rail.webp"
            alt="An empty rail in the MERIT studio"
            width={2560}
            height={1440}
            sizes="100vw"
            className="opacity-85"
          />
        </div>
      </div>

      <div className="page grid-page section-y-sm">
        <div className="col-span-4 md:col-span-6 lg:col-span-7">
          <h2 id="manifesto-title" className="display-lg">
            <Lines text="We make a small number of things and we make them for a long time." />
          </h2>
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
          <p className="body-lg border-l border-line-ink pl-6 text-bone/80" data-reveal>
            MERIT was set up in Riyadh in 2019 to do one thing properly: cut clothes that hold
            their shape and their proportion for years, in counts small enough that we know where
            every piece went. Nothing is made to be replaced next season.
          </p>
          <Link href="/about" className="label link-rule mt-8 inline-block" data-reveal>
            About the house
          </Link>
        </div>
      </div>
    </section>
  );
}
