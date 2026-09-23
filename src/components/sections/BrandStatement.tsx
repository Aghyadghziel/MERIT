import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/ui/Lines';

/** Forty-four words, one small picture, one link. */
export function BrandStatement() {
  return (
    <section className="page section-y-sm" aria-labelledby="statement-title">
      <div className="grid-page rule-t items-center pt-10">
        <div className="col-span-4 md:col-span-6 lg:col-span-7">
          <h2 id="statement-title" className="display-lg"><Lines text="A small number of things, made for a long time." /></h2>
          <p className="body-lg mt-6 max-w-lg text-mute" data-reveal>
            Cut on our own blocks in Riyadh, made in counts we can count, and re-issued rather than replaced. The structure stays still so the cloth can move.
          </p>
          <Link href="/about" className="label link-rule mt-6 inline-block" data-reveal>About the house</Link>
        </div>
        <div className="col-span-4 md:col-span-3 lg:col-span-3 lg:col-start-10">
          <div className="frame frame-1-1" data-reveal-img>
            <Image src="/img/statement-detail.webp" alt="" width={1400} height={1400} sizes="(min-width:1024px) 22vw, 60vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
