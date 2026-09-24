/**
 * Arabic strings for the pages area, keyed by the English source.
 *
 * Only the shared client pieces (the written-page shell and the contact form)
 * go through t(). The pages themselves carry their English and Arabic copy
 * side by side in the page file, so short, generic words ("Hours", "Men")
 * never collide with the same English key elsewhere on the site.
 */
export const pages: Record<string, string> = {
  // TextPage — the shell for every written page. Every page built on it has
  // between four and six sections, so the plural is the 3–10 form.
  '{n} sections': '{n} أقسام',
  'On this page': 'في هذه الصفحة',

  // ContactForm
  'An order': 'طلب',
  'Sizing and fit': 'المقاس والقصّة',
  'Alterations': 'التعديلات',
  'An appointment': 'موعد',
  'Press': 'الصحافة',
  'Something else': 'أمر آخر',
  'Tell us who you are.': 'أخبرنا من أنت.',
  'We need a working email address to reply to.': 'نحتاج إلى عنوان بريد إلكتروني صحيح لنردّ عليك.',
  'A sentence or two, so we can answer properly.': 'جملة أو جملتان، حتى نجيبك كما ينبغي.',
  'Not sent — concept site': 'لم تُرسَل — موقع تصوّري',
  'Thank you, {name}.': 'شكرًا، {name}.',
  'This is a concept site, so the message was not sent anywhere and no address was stored. On a real MERIT you would have an answer within a working day.':
    'هذا موقع تصوّري، لذا لم تُرسَل الرسالة إلى أي جهة ولم يُحفَظ أي عنوان. في نسخة حقيقية من MERIT، كان سيصلك الردّ خلال يوم عمل.',
  'Write another': 'اكتب رسالة أخرى',
  'Write to client care': 'راسل خدمة العملاء',
  'Your name': 'اسمك',
  'First and last name': 'الاسم الأول واسم العائلة',
  'Email': 'البريد الإلكتروني',
  'What is it about?': 'ما موضوع رسالتك؟',
  'Message': 'الرسالة',
  'An order number, a piece, a size — whatever helps us answer.': 'رقم طلب، أو قطعة، أو مقاس — أي شيء يساعدنا على الإجابة.',
  'Send message': 'أرسل الرسالة',

  // Two collection statements shown on the About page (from lib/catalog).
  'Everything else is drawn from here.': 'منها يُرسَم كل ما عداها.',
  'Built for the hour before the heat.': 'صُنعت للساعة التي تسبق الحرّ.',
};
