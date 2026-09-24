/**
 * Arabic strings for the catalogue itself, keyed by the English source:
 * categories, colours, sizes, statuses, sort and price labels, seasons.
 * Any page can render these through t(). Range names stay in Latin and need
 * no entry. Story titles and collection statements belong to editorial.ts.
 */
export const catalog: Record<string, string> = {
  // ─── Categories ────────────────────────────────────────────────────────
  Outerwear: 'الملابس الخارجية',
  Tailoring: 'التفصيل',
  Knitwear: 'التريكو',
  Shirting: 'القمصان',
  Trousers: 'البناطيل',
  Dresses: 'الفساتين',
  Accessories: 'الإكسسوارات',
  Footwear: 'الأحذية',

  // ─── Colours ───────────────────────────────────────────────────────────
  Fog: 'ضبابي',
  Ink: 'حبري',
  Camel: 'جملي',
  Ecru: 'إكرو',
  Chalk: 'طباشيري',
  Stone: 'حجري',
  Olive: 'زيتوني',
  'Graphite Check': 'مربّعات جرافيت',
  Graphite: 'جرافيت',
  Oat: 'شوفاني',
  Umber: 'بنّي ترابي',
  Bone: 'عظمي',
  Ash: 'رمادي',
  Oxide: 'أكسيدي',
  Navy: 'كحلي',
  Sand: 'رملي',
  Brass: 'نحاسي',

  // ─── Status ────────────────────────────────────────────────────────────
  New: 'جديد',
  Sale: 'تخفيض',
  'Sold out': 'نفدت الكمية',
  Runway: 'عرض أزياء',
  Limited: 'إصدار محدود',
  'Low stock': 'كمية محدودة',
  'In stock': 'متوفّر',
  'On sale': 'مخفّض',
  'Out of stock': 'غير متوفّر',

  // ─── Who it is for ─────────────────────────────────────────────────────
  Women: 'النساء',
  Men: 'الرجال',
  "Women's": 'نسائي',
  "Men's": 'رجالي',
  Unisex: 'للجنسين',

  // ─── Sizes ─────────────────────────────────────────────────────────────
  Clothing: 'الملابس',
  Jacket: 'السترات',
  'Waist (in)': 'الخصر (إنش)',
  'Shoe (EU)': 'الأحذية (أوروبي)',
  'One size': 'مقاس واحد',

  // ─── Sort and price ────────────────────────────────────────────────────
  Featured: 'المختارة',
  Newest: 'الأحدث',
  'Price, low to high': 'السعر: من الأقل إلى الأعلى',
  'Price, high to low': 'السعر: من الأعلى إلى الأقل',
  'Under 1,000': 'أقل من 1,000',
  '1,000 – 2,500': '1,000 – 2,500',
  '2,500 – 4,000': '2,500 – 4,000',
  'Over 4,000': 'أكثر من 4,000',
  '{band} SAR': '{band} ر.س',

  // ─── Where it is made ──────────────────────────────────────────────────
  'Made in Italy': 'صُنع في إيطاليا',
  'Made in Portugal': 'صُنع في البرتغال',
  'Made in Scotland': 'صُنع في اسكتلندا',

  // ─── Seasons and kickers ───────────────────────────────────────────────
  'Autumn Winter': 'خريف وشتاء',
  'Spring Summer': 'ربيع وصيف',
  Permanent: 'دائمة',
  Atelier: 'المشغل',
  Campaign: 'حملة',
  'Autumn Winter 2026': 'خريف وشتاء 2026',
  'Spring Summer 2026': 'ربيع وصيف 2026',
};
