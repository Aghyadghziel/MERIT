import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Section, TextPage } from '@/components/layout/TextPage';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'About',
  description: 'MERIT is a contemporary fashion label based in Riyadh, making tailoring, outerwear and knitwear in small counts.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <TextPage
        eyebrow={`${BRAND.city}, since ${BRAND.founded}`}
        title="Quiet structure, expressive movement."
        standfirst="MERIT makes a small number of things and makes them for a long time. The structure stays still so the cloth can move."
        aside={
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <dl className="space-y-5 text-sm">
              <div>
                <dt className="label-sm text-mute">Founded</dt>
                <dd className="nums mt-1">{BRAND.founded}, Riyadh</dd>
              </div>
              <div>
                <dt className="label-sm text-mute">Made in</dt>
                <dd className="mt-1">Italy, Portugal, Scotland</dd>
              </div>
              <div>
                <dt className="label-sm text-mute">Collections a year</dt>
                <dd className="nums mt-1">Two, plus a permanent range</dd>
              </div>
              <div>
                <dt className="label-sm text-mute">Sold</dt>
                <dd className="mt-1">Directly, and in two rooms</dd>
              </div>
            </dl>
          </div>
        }
      >
        <Section title="The idea">
          <p>
            MERIT was set up in 2019 by a pattern cutter and a buyer who had spent a decade watching
            good cloth turned into clothes that lasted one season. The label exists to do the
            opposite: cut a small number of shapes properly, on our own blocks, and re-issue them
            rather than replace them.
          </p>
          <p>
            The house line is quiet structure, expressive movement. The structure is the part you do
            not see — a canvassed chest, a faced waistband, a hem deep enough to hang. The movement
            is what the cloth does once that structure stops fighting it.
          </p>
        </Section>

        <Section title="How the range is built">
          <p>
            Everything is proportioned against one garment, the Column trouser. A jacket is drawn to
            end where that trouser reads best; a knit is cut to sit over its waistband; a coat is
            long enough to cover both. That is why the range photographs as a range.
          </p>
          <p>
            Two seasonal collections a year — Foundation in autumn, Atrium in spring — sit around a
            permanent group called Index, which is cut from the same patterns every year and changed
            only when something is wrong with it.
          </p>
        </Section>

        <Section title="Where things are made">
          <p>
            Tailoring and trousers are made outside Biella in Italy, in a factory of thirty-one
            people. Outerwear and shirting are made in northern Portugal. Knitwear is framed in
            Hawick, Scotland. We visit each of them twice a year and we name them on every product
            page because the making is not a secret.
          </p>
          <p>
            Counts are small — most pieces are cut in the low hundreds, runway pieces in the dozens.
            When a count is finished it is finished.
          </p>
        </Section>

        <Section title="What we do not do">
          <p>
            No mid-season markdowns, no fabricated scarcity, no discount codes in exchange for an
            email address. Prices are set once and hold for the life of the piece, and the sale at
            the end of a season is the only one.
          </p>
        </Section>

        <Section title="This site">
          <p>
            MERIT is a fictional label, built as a demonstration of what a fashion storefront can be.
            The garments, mills, counts, prices, stores and stock levels here are invented, the
            photography is placeholder, and nothing can be bought.{' '}
            <Link href="/stores" className="link-rule text-ink">The stores</Link> do not exist either.
          </p>
        </Section>
      </TextPage>

      <section className="page pb-(--section)">
        <div className="frame h-[46svh] min-h-[17rem] md:h-[62svh]" data-reveal-img>
          <Image src="/img/atelier-basting-wide.webp" alt="A jacket basted in white thread on a stand" width={2560} height={1440} sizes="100vw" />
        </div>
        <p className="label-sm mt-3 text-mute">The Rule jacket, basted, before the white thread comes out</p>
      </section>
    </>
  );
}
