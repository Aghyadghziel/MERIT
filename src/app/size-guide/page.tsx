import type { Metadata } from 'next';
import { TextPage } from '@/components/layout/TextPage';

export const metadata: Metadata = {
  title: 'Size guide',
  description: 'MERIT measurements for women, men, trousers and footwear, in centimetres.',
  alternates: { canonical: '/size-guide' },
};

const WOMEN = {
  head: ['Size', 'Bust', 'Waist', 'Hip', 'UK', 'EU', 'US'],
  rows: [
    ['XS', '80–84', '62–66', '88–92', '6–8', '34–36', '2–4'],
    ['S', '85–89', '67–71', '93–97', '10', '38', '6'],
    ['M', '90–94', '72–76', '98–102', '12', '40', '8'],
    ['L', '95–100', '77–82', '103–108', '14', '42', '10'],
    ['XL', '101–107', '83–89', '109–115', '16', '44', '12'],
  ],
};

const MEN = {
  head: ['Size', 'Chest', 'Waist', 'Neck', 'UK / US', 'EU'],
  rows: [
    ['44', '86–90', '74–78', '37', '34', '44'],
    ['46', '91–95', '79–83', '38', '36', '46'],
    ['48', '96–100', '84–88', '39', '38', '48'],
    ['50', '101–106', '89–94', '41', '40', '50'],
    ['52', '107–112', '95–100', '42', '42', '52'],
  ],
};

const TROUSERS = {
  head: ['Waist (in)', 'Waist (cm)', 'Hip', 'Inside leg', 'Leg opening'],
  rows: [
    ['26', '66', '92', '82', '26'],
    ['28', '71', '97', '82', '26.5'],
    ['30', '76', '102', '83', '27'],
    ['32', '81', '107', '84', '27.5'],
    ['34', '86', '112', '84', '28'],
  ],
};

export default function SizeGuidePage() {
  return (
    <TextPage
      eyebrow="Measurements"
      title="Size guide."
      standfirst="Every figure below is taken from the finished garment, not from a body, and is given in centimetres unless marked."
    >
      <Table title="Women" caption="Ready to wear, sizes XS to XL." {...WOMEN} />
      <Table title="Men" caption="Tailoring and outerwear, sizes 44 to 52." {...MEN} />
      <Table title="Trousers" caption="Sized by finished waistband. Inside leg before any alteration." {...TROUSERS} />

      <section className="border-t border-line pt-8">
        <h2 className="display-sm">Footwear</h2>
        <p className="mt-4 text-sm leading-relaxed text-mute">
          Sized in EU, running true on a standard width. The Pivot mule is cut on a square last and
          reads a half size small across the toe; take the next size up if your foot is wide. The
          Plinth derby runs true.
        </p>
      </section>

      <section className="border-t border-line pt-8">
        <h2 className="display-sm">How to measure</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mute">
          <li><strong className="text-ink">Chest and bust</strong> — around the fullest part, tape level under the arms, arms down.</li>
          <li><strong className="text-ink">Waist</strong> — the narrowest part, usually just above the navel. Do not pull the tape tight.</li>
          <li><strong className="text-ink">Hip</strong> — around the fullest part, roughly twenty centimetres below the waist.</li>
          <li><strong className="text-ink">Inside leg</strong> — from the crotch seam of a trouser that fits you, down the inside of the leg to the hem.</li>
        </ul>
      </section>
    </TextPage>
  );
}

function Table({ title, caption, head, rows }: { title: string; caption: string; head: string[]; rows: string[][] }) {
  return (
    <section className="border-t border-line pt-8 first:border-0 first:pt-0 [&+section]:mt-10">
      <h2 className="display-sm">{title}</h2>
      <p className="mt-2 text-sm text-mute">{caption}</p>
      <div className="no-bar mt-5 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr>
              {head.map((h) => (
                <th key={h} scope="col" className="label-sm border-b border-line py-3 pr-4 text-left text-mute">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="nums">
            {rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) => (
                  <td key={i} className={`border-b border-line py-3 pr-4 ${i === 0 ? 'font-medium' : 'text-mute'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
