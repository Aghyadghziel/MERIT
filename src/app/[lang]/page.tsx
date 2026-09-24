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
import { localePath } from '@/i18n/config';
import { makeT } from '@/i18n/dictionary';
import { localizeProduct } from '@/i18n/products';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = makeT(locale);
  return {
    title: t('MERIT — Contemporary fashion, Riyadh'),
    description: t('Foundation, Autumn Winter 2026. Step into the fitting room: choose a jacket and watch it worn.'),
    alternates: { canonical: localePath('/', locale), languages: { en: '/', ar: '/ar' } },
  };
}


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
export default async function HomePage() {
  const locale = await getLocale();
  const local = (slug: string) => {
    const p = getProduct(slug);
    return p ? localizeProduct(p, locale) : undefined;
  };
  const items = outfits.map<OutfitItem>((o) => ({ ...o, product: local(o.slug)! }));
  const anatomy = { 'plane-technical-jacket': local('plane-technical-jacket'), 'axis-leather-jacket': local('axis-leather-jacket') };

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
