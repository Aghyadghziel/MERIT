/**
 * Arabic strings for the editorial area — the collections and the stories —
 * keyed by the English source, in white Saudi (kept a shade more written
 * here, as a magazine would). Story bodies and pull quotes are by slug in
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
  Permanent: 'ثابتة',
  Runway: 'عرض أزياء',
  Atelier: 'المشغل',
  Campaign: 'حملة',
  Collection: 'مجموعة',

  // ─── Collections: statement and note ────────────────────────────────────
  'Everything else is drawn from here.': 'منها نرسم كل شي ثاني.',
  'Twelve pieces that set the proportions for the rest of the range — a coat, a jacket, a trouser, a knit. The cloth is heavier than last season and the colour has been pulled back to four.':
    'اثنعش قطعة تضبط المقاسات لباقي التشكيلة — معطف، وجاكيت، وبنطلون، وتريكو. القماش أثقل من الموسم اللي راح، والألوان صارت أربعة بس.',
  'Built for the hour before the heat.': 'مسوّية للساعة اللي قبل الحر.',
  'A lighter register: dry cotton, sandwashed silk, and tailoring taken off the canvas. Shown in a courtyard in Riyadh at six in the morning.':
    'أخف وأبرد: قطن ناشف، وحرير مغسول بالرمل، وتفصيل بدون حشوة كانفاس. عرضناها في حوش بيت بالرياض الساعة ست الصبح.',
  'Made every season, changed only when it is wrong.': 'تنصنع كل موسم، وما تتغيّر إلا إذا فيها غلط.',
  'The pieces that do not move. Cut from the same patterns each year, in the same cloth, and re-issued rather than redesigned.':
    'القطع اللي ما تتحرك. نقصّها كل سنة من نفس الباترونات وبنفس القماش، ونرجّعها بدل ما نعيد تصميمها.',
  'Twenty-four looks, one room, no music.': 'أربعة وعشرين لوك، وقاعة وحدة، وبدون موسيقى.',
  'The first presentation. Held in a stripped office floor on King Fahd Road with the blinds up, so the clothes were seen in daylight.':
    'أول عرض لنا. سوّيناه في دور مكاتب فاضي على طريق الملك فهد، والستاير مفتوحة، عشان تنشاف الملابس بضوء النهار.',

  // ─── Stories: title and standfirst ──────────────────────────────────────
  'The Rule Line': 'خطّ المسطرة',
  'The Foundation campaign was shot against a single wall over two afternoons, with the light left exactly as it was found.':
    'صوّرنا حملة الأساس قدام جدار واحد على عصرين، وخلّينا الضوء زي ما هو بالضبط.',
  'Atrium: Twelve Rooms': 'الفناء: اثنعش غرفة',
  'A spring collection organised around a courtyard house, and the twelve rooms that open onto it.':
    'مجموعة ربيعية مبنية على فكرة بيت فيه حوش، والاثنعش غرفة اللي تفتح عليه.',
  'Runway 01, Riyadh': 'العرض الأول، الرياض',
  'Twenty-four looks shown on a stripped office floor on King Fahd Road, in daylight, without music.':
    'أربعة وعشرين لوك في دور مكاتب فاضي على طريق الملك فهد، بضوء النهار، وبدون موسيقى.',
  'On Making: The Basted Jacket': 'من المشغل: الجاكيت المسرّج',
  'Why the Rule jacket is still assembled in white thread before it is assembled properly.':
    'ليش جاكيت مسطرة للحين نجمعه بخيط أبيض أول، قبل ما نخيطه صح.',

  // ─── Pictures (alt text and plate captions) ─────────────────────────────
  'A model in a pale cropped jacket and trousers against a brown plaster wall.':
    'مودل بجاكيت قصير فاتح وبنطلون قدام جدار جص بني.',
  'A model in a pale cropped jacket and trousers walking past a brown plaster wall.':
    'مودل بجاكيت قصير فاتح وبنطلون تمشي جنب جدار جص بني.',
  'Close crop of an ivory double-breasted coat worn open over a navy knit, one hand at the lapel.':
    'لقطة قريبة لمعطف عاجي بصفّين أزرار مفتوح فوق تريكو كحلي، ويد على الياقة.',
  'A model in an ivory double-breasted coat over a navy knit, head bowed.':
    'مودل بمعطف عاجي بصفّين أزرار فوق تريكو كحلي، وراسها منزّل.',
  'A figure in an olive jacket and trousers, lit low against a dark ground.':
    'شخص بجاكيت وبنطلون زيتوني، بإضاءة خفيفة على خلفية غامقة.',
  'A model in a white shirt and wide stone trousers, seated on a stool against a brown backdrop.':
    'مودل بقميص أبيض وبنطلون واسع بلون الحجر، جالسة على كرسي عالي قدام خلفية بنية.',
  'A model on the runway in a pale draped dress and a knotted scarf, the audience in shadow.':
    'مودل على المنصة بفستان فاتح منسدل ووشاح معقود، والجمهور في الظل.',
  'A navy jacket on a tailor’s dummy, held together with white basting stitches.':
    'جاكيت كحلي على مانيكان خيّاط، مجموع بغرز تسريج بيضاء.',
  'Black and white: a model in a pale suit, seated on a bentwood chair.':
    'أبيض وأسود: مودل ببدلة فاتحة، جالسة على كرسي خشب مقوّس.',
  'Close detail of a grey wool coat and its tie belt.': 'تفصيل قريب لمعطف صوف رمادي وحزامه المعقود.',
  'Black and white: a model in a trench coat, hair caught by the wind.':
    'أبيض وأسود: مودل بمعطف ترنش، والهوا ماسك شعرها.',
  'Pale cloth folded in soft light.': 'قماش فاتح مطوي في ضوء ناعم.',
  'Close texture of a grey wool cloth.': 'ملمس قماش صوف رمادي من قريب.',
  'Close texture of natural linen.': 'ملمس كتان طبيعي من قريب.',
  'A model seen from behind in a dark check blazer.': 'مودل من ورا ببليزر غامق مربّعات.',
  'Empty white hangers on a steel rail.': 'علّاقات بيضاء فاضية على راك حديد.',
  'Shirts and jackets hanging on a rail.': 'قمصان وجواكيت معلّقة على راك.',

  // ─── Collections pages ──────────────────────────────────────────────────
  'Foundation, Atrium, Index and Runway 01 — the four MERIT collections, seasonal and permanent.':
    'الأساس والفناء والفهرس والعرض الأول — مجموعات ميرت الأربع، الموسمية والثابتة.',
  'Seasonal and permanent': 'موسمية وثابتة',
  'Two seasons, one permanent range, and the archive.': 'موسمين، وتشكيلة ثابتة، والأرشيف.',
  'The seasons, the permanent range, and the archive.': 'المواسم، والتشكيلة الثابتة، والأرشيف.',
  Contents: 'المحتوى',
  'Enter {name}': 'ادخل {name}',
  'From {name}': 'من {name}',
  'How they were made and shown': 'كيف انصنعت وكيف انعرضت',
  'of {n}': 'من {n}',
  'Shop the collection': 'تسوّق المجموعة',
  'About the collection': 'عن المجموعة',
  Season: 'الموسم',
  'In this lookbook': 'في اللوك بوك',
  'In the collection': 'في المجموعة',
  'The lookbook': 'اللوك بوك',
  'shop it': 'تسوّقها',
  'shop each one': 'تسوّق كل وحدة',
  'Every piece in {name}': 'كل قطع {name}',
  'Shop {name}': 'تسوّق {name}',
  'The pieces': 'القطع',
  'The story': 'القصة',
  'Read the story': 'اقرأ القصة',
  'Next collection': 'المجموعة اللي بعدها',
  'From the collection note': 'من كلمة المجموعة',
  'Frame {n}': 'لقطة {n}',
  Shop: 'تسوّق',

  // ─── Editorial pages ────────────────────────────────────────────────────
  'Campaigns, runway presentations and notes from the MERIT atelier.':
    'حملات، وعروض أزياء، وأخبار من مشغل ميرت.',
  'Campaigns, runway and how things are made.': 'حملات، وعروض، وكيف تنصنع الأشياء.',
  'In this issue': 'في هالعدد',
  'Cover story': 'قصة الغلاف',
  'Story {n}. ': 'القصة {n}. ',
  'Read · {time}': 'اقرأ · {time}',
  'From the stories to the clothes': 'من القصص للملابس',
  Story: 'القصة',
  'Story ': 'القصة ',
  Reading: 'القراءة',
  '{time} read': 'تنقرا في {time}',
  'Shop the story': 'تسوّق من القصة',
  'Part ': 'الجزء ',
  of: 'من',
  'End of story': 'نهاية القصة',
  'From “{title}”': 'من «{title}»',
  'Shop the story — {pieces}': 'تسوّق من القصة — {pieces}',
  'Pieces from this story.': 'قطع من هالقصة.',
  Stories: 'القصص',
  'All stories': 'كل القصص',
  'Next story': 'القصة اللي بعدها',
  'Plate {n}': 'لوحة {n}',
};
