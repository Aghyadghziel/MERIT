import type { Metadata } from 'next';
import { BrandStatement } from '@/components/sections/BrandStatement';
import { CampaignFeature } from '@/components/sections/CampaignFeature';
import { CategoryIndex } from '@/components/sections/CategoryIndex';
import { JacketAnatomy } from '@/components/landing/JacketAnatomy';
import { FittingRoom, type OutfitItem } from '@/components/sections/FittingRoom';
import { Making } from '@/components/sections/home/Making';
import { Marquee } from '@/components/sections/Marquee';
import { getProduct } from '@/lib/catalog';
import { outfits } from '@/lib/outfits';

export const metadata: Metadata = {
  title: 'MERIT — Contemporary fashion, Riyadh',
  description: 'Foundation, Autumn Winter 2026. Step into the fitting room: choose a jacket and watch it worn.',
  alternates: { canonical: '/' },
};


/**
 * The home page is a walk through rooms, never two dark ones side by side:
 *
 *   Fitting Room      warm white   the opening, owned by FittingRoom
 *   Marquee           black band   moves only with the scroll
 *   Anatomy           stone        both jackets, the other one revealed under the pointer
 *   Campaign          white→film   a window between two words, pushed open; the
 *                                  studio film plays with the scroll
 *   The house         warm white   the sentence, read into ink, pictures set in it
 *   The making        graphite     the scroll turns sideways through six stages
 *   The shop          warm white   every category at poster size
 *   Footer            black        (layout) the liquid logotype, then the links
 */
export default function HomePage() {
  const items = outfits.map<OutfitItem>((o) => ({ ...o, product: getProduct(o.slug)! }));
  const anatomy = { 'plane-technical-jacket': getProduct('plane-technical-jacket'), 'axis-leather-jacket': getProduct('axis-leather-jacket') };

  return (
    <>
      <FittingRoom items={items} />
      <Marquee />
      <JacketAnatomy products={anatomy} />
      <CampaignFeature />
      <BrandStatement />
      <Making />
      <CategoryIndex />
    </>
  );
}
