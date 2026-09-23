import type { Metadata } from 'next';
import { BrandStatement } from '@/components/sections/BrandStatement';
import { CampaignFeature } from '@/components/sections/CampaignFeature';
import { CategoryIndex } from '@/components/sections/CategoryIndex';
import { JacketAnatomy } from '@/components/landing/JacketAnatomy';
import { LiquidMark } from '@/components/landing/LiquidMark';
import { FittingRoom, type OutfitItem } from '@/components/sections/FittingRoom';
import { Making } from '@/components/sections/home/Making';
import { Marquee } from '@/components/sections/Marquee';
import { SelectedPieces } from '@/components/sections/SelectedPieces';
import { getProduct } from '@/lib/catalog';
import { outfits } from '@/lib/outfits';

export const metadata: Metadata = {
  title: 'MERIT — Contemporary fashion, Riyadh',
  description: 'Foundation, Autumn Winter 2026. Step into the fitting room: choose a jacket and watch it worn.',
  alternates: { canonical: '/' },
};

const FEATURED = ['atrium-wool-coat', 'rule-single-breasted-blazer', 'column-wide-trouser', 'axis-structured-bag'];

/**
 * The home page is a walk through rooms, never two dark ones side by side:
 *
 *   Fitting Room      warm white   the opening, owned by FittingRoom
 *   Marquee           black band   moves only with the scroll
 *   Anatomy           stone        both jackets, read point by point, with a loupe
 *   Campaign          white→photo  a window between two words, pushed open;
 *                                  the house line at poster size
 *   Selected pieces   warm white   price list in the margin, a drifting rail
 *   The making        graphite     the scroll turns sideways through six stages
 *   The house         warm white   the sentence, read into ink, pictures set in it
 *   Liquid mark       black        the logotype, poured, live in WebGL
 *   The shop          warm white   every category at poster size
 *   Footer            black        (layout)
 *
 * The campaign headline and the liquid mark's line are the same sentence, so
 * three rooms stand between them.
 */
export default function HomePage() {
  const items = outfits.map<OutfitItem>((o) => ({ ...o, product: getProduct(o.slug)! }));
  const anatomy = { 'plane-technical-jacket': getProduct('plane-technical-jacket'), 'axis-leather-jacket': getProduct('axis-leather-jacket') };
  const featured = FEATURED.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <FittingRoom items={items} />
      <Marquee />
      <JacketAnatomy products={anatomy} />
      <CampaignFeature />
      <SelectedPieces products={featured} />
      <Making />
      <BrandStatement />
      <LiquidMark />
      <CategoryIndex />
    </>
  );
}
