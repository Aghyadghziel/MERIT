import type { Metadata } from 'next';
import { Section, TextPage } from '@/components/layout/TextPage';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What MERIT stores, what it does not, and how to ask for it back.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <TextPage
      eyebrow="Legal"
      title="Privacy policy."
      standfirst="MERIT is a concept site. Nothing you type here is transmitted anywhere, and nothing is stored on a server, because there is no server behind it."
      facts={[
        { label: 'Cookies', value: '0', note: 'None set, by us or anyone else.' },
        { label: 'Tracking scripts', value: '0', note: 'No analytics, no advertising pixels.' },
        { label: 'Kept in your browser', value: '2', unit: 'keys', note: 'Local storage only. Never sent.' },
        { label: 'Forms that send', value: '0', note: 'Nothing typed here leaves the page.' },
      ]}
      toc={[
        { id: 'keeps', label: 'What this site keeps' },
        { id: 'cookies', label: 'Cookies' },
        { id: 'forms', label: 'Forms' },
        { id: 'real', label: 'What a real version would say' },
        { id: 'images', label: 'Images' },
      ]}
    >
      <Section id="keeps" title="What this site keeps">
        <p>
          Your bag, your wishlist and your chosen currency are written to your own browser&rsquo;s
          local storage under the key <code>merit:v1</code>, and your recent searches under{' '}
          <code>merit:searches</code>. They never leave the device, and clearing your browser data
          removes them for good.
        </p>
      </Section>

      <Section id="cookies" title="Cookies">
        <p>
          None. There is no analytics, no advertising pixel, no consent banner and no third-party
          script of any kind on this site. The only storage used is the local storage described
          above, which is not a cookie and is not sent with requests.
        </p>
      </Section>

      <Section id="forms" title="Forms">
        <p>
          The newsletter form and the contact form validate what you type and then tell you plainly
          that nothing was sent. No address is recorded.
        </p>
      </Section>

      <Section id="real" title="What a real version would say">
        <p>
          A live MERIT would process order and delivery details to fulfil purchases, hold them for the
          period required by Saudi commercial law, and share them only with the payment processor and
          the courier. It would answer access and deletion requests within thirty days and would never
          sell customer data.
        </p>
        <p>That paragraph is written here so the omission is visible rather than accidental.</p>
      </Section>

      <Section id="images" title="Images">
        <p>
          The photography on this site is placeholder material from Unsplash, used under the Unsplash
          Licence. The people in it are not associated with MERIT and do not endorse it. Sources are
          listed in <code>public/img/CREDITS.md</code>.
        </p>
      </Section>
    </TextPage>
  );
}
