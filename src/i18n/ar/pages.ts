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
  'On this page': 'في هالصفحة',

  // ContactForm
  'An order': 'طلب',
  'Sizing and fit': 'المقاس والقَصّة',
  'Alterations': 'تعديل على قطعة',
  'An appointment': 'موعد',
  'Press': 'الصحافة',
  'Something else': 'شي ثاني',
  'Tell us who you are.': 'قول لنا مين أنت.',
  'We need a working email address to reply to.': 'نحتاج إيميل صحيح عشان نرد عليك.',
  'A sentence or two, so we can answer properly.': 'اكتب لنا سطر أو سطرين، عشان نرد عليك صح.',
  'Almost sent': 'باقي خطوة',
  'Thank you, {name}.': 'شكرًا يا {name}.',
  'Your email app should now be open with the message ready. Press send there. If it did not open, write to us at {email}.':
    'المفروض إن تطبيق الإيميل انفتح والرسالة جاهزة، اضغط إرسال من هناك. وإذا ما انفتح، راسلنا على {email}',
  'Write another': 'اكتب رسالة ثانية',
  'Write to client care': 'راسل خدمة العملاء',
  'Your name': 'اسمك',
  'First and last name': 'اسمك الأول واسم العائلة',
  'Email': 'الإيميل',
  'What is it about?': 'وش موضوعك؟',
  'Message': 'الرسالة',
  'An order number, a piece, a size — whatever helps us answer.': 'رقم طلب، أو قطعة، أو مقاس — أي شي يساعدنا نرد عليك.',
  'Send message': 'أرسل',

  // Two collection statements shown on the About page (from lib/catalog).
  'Everything else is drawn from here.': 'منها نرسم كل شي ثاني.',
  'Built for the hour before the heat.': 'مسوّية للساعة اللي قبل الحر.',
};
