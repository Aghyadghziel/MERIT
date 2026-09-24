/**
 * Arabic strings for the editorial area — the collections and the stories —
 * keyed by the English source. Story bodies and pull quotes are by slug in
 * src/i18n/ar/stories.ts; counted nouns ("4 pieces") there too.
 */
export const editorial: Record<string, string> = {
  // ─── Page names ─────────────────────────────────────────────────────────
  // The two poster words are measured in src/components/editorial/data.ts
  // (INK_AR): change one here, re-measure it there.
  Collections: 'المجموعات',
  Editorial: 'المجلة',
  'The collections': 'المجموعات',

  // ─── Seasons and kinds of story ─────────────────────────────────────────
  'Autumn Winter': 'خريف وشتاء',
  'Spring Summer': 'ربيع وصيف',
  Permanent: 'دائمة',
  Runway: 'عرض أزياء',
  Atelier: 'المشغل',
  Campaign: 'حملة',
  Collection: 'مجموعة',

  // ─── Collections: statement and note ────────────────────────────────────
  'Everything else is drawn from here.': 'منها يُرسَم كلّ ما عداها.',
  'Twelve pieces that set the proportions for the rest of the range — a coat, a jacket, a trouser, a knit. The cloth is heavier than last season and the colour has been pulled back to four.':
    'اثنتا عشرة قطعة تضبط النِّسب لبقية التشكيلة — معطف، وسترة، وبنطال، وقطعة تريكو. القماش أثقل من الموسم الماضي، والألوان اختُزلت إلى أربعة.',
  'Built for the hour before the heat.': 'صُنعت للساعة التي تسبق الحرّ.',
  'A lighter register: dry cotton, sandwashed silk, and tailoring taken off the canvas. Shown in a courtyard in Riyadh at six in the morning.':
    'نبرةٌ أخفّ: قطنٌ جافّ، وحريرٌ مغسول بالرمل، وخياطةٌ نُزعت عنها حشوة الكانفاس. عُرضت في فناءٍ بالرياض عند السادسة صباحًا.',
  'Made every season, changed only when it is wrong.': 'تُصنع كلّ موسم، ولا تُعدَّل إلا حين يثبت خطؤها.',
  'The pieces that do not move. Cut from the same patterns each year, in the same cloth, and re-issued rather than redesigned.':
    'القطع التي لا تتبدّل. تُقصّ كلّ عام من الباترونات نفسها، ومن القماش نفسه، ويُعاد إصدارها بدل أن يُعاد تصميمها.',
  'Twenty-four looks, one room, no music.': 'أربع وعشرون إطلالة، وقاعة واحدة، بلا موسيقى.',
  'The first presentation. Held in a stripped office floor on King Fahd Road with the blinds up, so the clothes were seen in daylight.':
    'العرض الأول. أُقيم في طابق مكاتب عارٍ على طريق الملك فهد، والستائر مرفوعة، لتُرى الملابس في ضوء النهار.',

  // ─── Stories: title and standfirst ──────────────────────────────────────
  // Range and collection names stay in Latin.
  'The Rule Line': 'خطّ المسطرة',
  'The Foundation campaign was shot against a single wall over two afternoons, with the light left exactly as it was found.':
    'صُوّرت حملة الأساس أمام جدار واحد على مدى عصرين، وتُرك الضوء تمامًا كما وُجد.',
  'Atrium: Twelve Rooms': 'الفناء: اثنتا عشرة غرفة',
  'A spring collection organised around a courtyard house, and the twelve rooms that open onto it.':
    'مجموعة ربيعية تنتظم حول بيتٍ ذي فناء، وحول الغرف الاثنتي عشرة التي تنفتح عليه.',
  'Runway 01, Riyadh': 'العرض الأول، الرياض',
  'Twenty-four looks shown on a stripped office floor on King Fahd Road, in daylight, without music.':
    'أربع وعشرون إطلالة عُرضت في طابق مكاتب عارٍ على طريق الملك فهد، في ضوء النهار، بلا موسيقى.',
  'On Making: The Basted Jacket': 'في الصنعة: السترة المُسرَّجة',
  'Why the Rule jacket is still assembled in white thread before it is assembled properly.':
    'لماذا ما تزال سترة مسطرة تُجمع بخيطٍ أبيض أولًا، قبل أن تُجمع كما ينبغي.',

  // ─── Pictures (alt text and plate captions) ─────────────────────────────
  'A model in a pale cropped jacket and trousers against a brown plaster wall.':
    'عارضة بسترة قصيرة فاتحة وبنطال أمام جدار من الجصّ البنّي.',
  'A model in a pale cropped jacket and trousers walking past a brown plaster wall.':
    'عارضة بسترة قصيرة فاتحة وبنطال تمشي بمحاذاة جدار من الجصّ البنّي.',
  'Close crop of an ivory double-breasted coat worn open over a navy knit, one hand at the lapel.':
    'لقطة قريبة لمعطف عاجيّ مزدوج الأزرار مفتوح فوق كنزة كحلية، ويدٌ عند طيّة الصدر.',
  'A model in an ivory double-breasted coat over a navy knit, head bowed.':
    'عارضة بمعطف عاجيّ مزدوج الأزرار فوق كنزة كحلية، مطأطئة الرأس.',
  'A figure in an olive jacket and trousers, lit low against a dark ground.':
    'قامةٌ بسترة وبنطال زيتونيّين، في إضاءة خفيضة على خلفية داكنة.',
  'A model in a white shirt and wide stone trousers, seated on a stool against a brown backdrop.':
    'عارضة بقميص أبيض وبنطال واسع بلون الحجر، جالسة على كرسيّ مرتفع أمام خلفية بنّية.',
  'A model on the runway in a pale draped dress and a knotted scarf, the audience in shadow.':
    'عارضة على المنصّة بفستان فاتح منسدل ووشاح معقود، والجمهور في الظلّ.',
  'A navy jacket on a tailor’s dummy, held together with white basting stitches.':
    'سترة كحلية على دمية خيّاط، تجمعها غرز تسريج بيضاء.',
  'Black and white: a model in a pale suit, seated on a bentwood chair.':
    'بالأبيض والأسود: عارضة ببدلة فاتحة، جالسة على كرسيّ من الخشب المقوّس.',
  'Close detail of a grey wool coat and its tie belt.': 'تفصيل قريب لمعطف صوفيّ رمادي وحزامه المعقود.',
  'Black and white: a model in a trench coat, hair caught by the wind.':
    'بالأبيض والأسود: عارضة بمعطف ترنش، وقد أمسكت الريح بشعرها.',
  'Pale cloth folded in soft light.': 'قماش فاتح مطويّ في ضوء ناعم.',
  'Close texture of a grey wool cloth.': 'ملمس قريب لقماش صوفيّ رمادي.',
  'Close texture of natural linen.': 'ملمس قريب لكتّان طبيعي.',
  'A model seen from behind in a dark check blazer.': 'عارضة من الخلف بسترة داكنة بنقشة المربّعات.',
  'Empty white hangers on a steel rail.': 'علّاقات بيضاء فارغة على قضيب من الفولاذ.',
  'Shirts and jackets hanging on a rail.': 'قمصان وسترات معلّقة على قضيب.',

  // ─── Collections pages ──────────────────────────────────────────────────
  'Foundation, Atrium, Index and Runway 01 — the four MERIT collections, seasonal and permanent.':
    'الأساس والفناء والفهرس والعرض الأول — مجموعات ميرت الأربع، الموسمية منها والدائمة.',
  'Seasonal and permanent': 'موسمية ودائمة',
  'Two seasons, one permanent range, and the archive.': 'موسمان، ومجموعة دائمة، والأرشيف.',
  'The seasons, the permanent range, and the archive.': 'المواسم، والمجموعة الدائمة، والأرشيف.',
  Contents: 'المحتويات',
  'Enter {name}': 'ادخل إلى {name}',
  'From {name}': 'من {name}',
  'How they were made and shown': 'كيف صُنعت، وكيف عُرضت',
  'of {n}': 'من {n}',
  'Shop the collection': 'تسوّق المجموعة',
  'About the collection': 'عن المجموعة',
  Season: 'الموسم',
  'In this lookbook': 'في كتاب الإطلالات',
  'In the collection': 'في المجموعة',
  'The lookbook': 'كتاب الإطلالات',
  'shop it': 'تسوّقها',
  'shop each one': 'تسوّق كلًّا منها',
  'Every piece in {name}': 'كلّ قطع {name}',
  'Shop {name}': 'تسوّق {name}',
  'The pieces': 'القطع',
  'The story': 'القصة',
  'Read the story': 'اقرأ القصة',
  'Next collection': 'المجموعة التالية',
  'From the collection note': 'من كلمة المجموعة',
  'Frame {n}': 'لقطة {n}',
  Shop: 'تسوّق',

  // ─── Editorial pages ────────────────────────────────────────────────────
  'Campaigns, runway presentations and notes from the MERIT atelier.':
    'حملات، وعروض أزياء، وملاحظات من مشغل ميرت.',
  'Campaigns, runway and how things are made.': 'حملات، وعروض أزياء، وكيف تُصنع الأشياء.',
  'In this issue': 'في هذا العدد',
  'Cover story': 'قصة الغلاف',
  'Story {n}. ': 'القصة {n}. ',
  'Read · {time}': 'اقرأ · {time}',
  'From the stories to the clothes': 'من القصص إلى الملابس',
  Story: 'القصة',
  'Story ': 'القصة ',
  Reading: 'القراءة',
  '{time} read': 'قراءة في {time}',
  'Shop the story': 'تسوّق القصة',
  'Part ': 'الجزء ',
  of: 'من',
  'End of story': 'نهاية القصة',
  'From “{title}”': 'من «{title}»',
  'Shop the story — {pieces}': 'تسوّق القصة — {pieces}',
  'Pieces from this story.': 'قطعٌ من هذه القصة.',
  Stories: 'القصص',
  'All stories': 'كلّ القصص',
  'Next story': 'القصة التالية',
  'Plate {n}': 'لوحة {n}',
};
