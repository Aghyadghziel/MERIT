/**
 * Draws the placeholder outfit frames — one figure, one pose, five garments —
 * to public/img/outfits/*.svg, on the contract in src/lib/outfits.ts.
 *
 * Every frame is the same figure with a different garment drawn on the same
 * armature, which is exactly what the photography must eventually be. The
 * figure is deliberately a figure, not a person: flat planes in the house
 * palette, so nobody mistakes it for a photograph.
 *
 * Run: node tools/outfits/build.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 1200;
const H = 1800;
const OUT = 'public/img/outfits';

const C = {
  skin: '#CDC6B9',
  skinShade: '#BEB6A7',
  hair: '#3F3C37',
  tee: '#EDE9E1',
  teeShade: '#DCD7CC',
  trouser: '#B4AEA3',
  trouserShade: '#A39D92',
  shoe: '#1A1A18',
  shadow: 'rgba(16,16,16,0.07)',
  line: 'rgba(16,16,16,0.10)',
};

const mirror = (x) => W - x;

// ─── The figure (identical in every frame) ────────────────────────────────

function figure() {
  return `
  <ellipse cx="600" cy="1752" rx="300" ry="20" fill="${C.shadow}"/>

  <!-- trousers -->
  <path d="M430 990 H585 L578 1690 H405 Z" fill="${C.trouser}"/>
  <path d="M615 990 H770 L795 1690 H622 Z" fill="${C.trouser}"/>
  <path d="M556 990 H585 L578 1690 H551 Z" fill="${C.trouserShade}" opacity="0.6"/>
  <path d="M615 990 H644 L651 1690 H622 Z" fill="${C.trouserShade}" opacity="0.6"/>

  <!-- shoes -->
  <rect x="388" y="1688" width="204" height="56" rx="16" fill="${C.shoe}"/>
  <rect x="608" y="1688" width="204" height="56" rx="16" fill="${C.shoe}"/>

  <!-- arms and hands -->
  <rect x="300" y="590" width="72" height="400" rx="34" fill="${C.skin}"/>
  <rect x="${mirror(372)}" y="590" width="72" height="400" rx="34" fill="${C.skin}"/>
  <rect x="296" y="968" width="78" height="66" rx="28" fill="${C.skinShade}"/>
  <rect x="${mirror(374)}" y="968" width="78" height="66" rx="28" fill="${C.skinShade}"/>

  <!-- tee -->
  <path d="M405 430 H795 L800 1000 H400 Z" fill="${C.tee}"/>
  <path d="M405 430 L292 462 L300 600 H372 L405 540 Z" fill="${C.tee}"/>
  <path d="M795 430 L908 462 L900 600 H828 L795 540 Z" fill="${C.tee}"/>
  <path d="M700 430 H795 L800 1000 H705 Z" fill="${C.teeShade}" opacity="0.55"/>

  <!-- neck and head -->
  <rect x="566" y="330" width="68" height="120" fill="${C.skin}"/>
  <ellipse cx="600" cy="440" rx="66" ry="20" fill="${C.teeShade}"/>
  <ellipse cx="600" cy="232" rx="84" ry="104" fill="${C.hair}"/>
  <ellipse cx="600" cy="252" rx="78" ry="96" fill="${C.skin}"/>
  `;
}

// ─── Garments, all on one armature ────────────────────────────────────────

/**
 * A jacket is two front panels around an opening, two sleeves, and a collar.
 * `v` is where the opening stops widening, `hem` where the body ends, `gap`
 * the half-width of the opening below the V. A `closed` jacket overlaps the
 * left panel across the centre and fastens with buttons.
 */
function jacket({ fill, shade, dark, hem, v, gap = 12, closed = false, collar, pockets = '', extra = '' }) {
  const leftEdge = closed ? 632 : 600 - gap;
  const left = `M386 430 H600 L${600 - 40} ${v} L${leftEdge} ${hem} H388 Z`;
  const right = `M814 430 H600 L${600 + 40} ${v} L${600 + gap} ${hem} H812 Z`;
  const sleeveL = `M372 422 L282 470 L268 955 H372 L386 560 Z`;
  const sleeveR = `M828 422 L918 470 L932 955 H828 L814 560 Z`;
  const lapelL = `M602 432 L${560} ${v} L${524} ${v - 26} L596 486 Z`;
  const lapelR = `M598 432 L${640} ${v} L${676} ${v - 26} L604 486 Z`;

  return `
  <defs>
    <linearGradient id="shade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <g>
    <path d="${sleeveL}" fill="${fill}"/>
    <path d="${sleeveR}" fill="${fill}"/>
    <path d="${sleeveR}" fill="url(#shade)"/>
    <path d="M288 936 H372" stroke="${dark}" stroke-width="6" opacity="0.5"/>
    <path d="M828 936 H912" stroke="${dark}" stroke-width="6" opacity="0.5"/>
    <path d="M300 700 q 30 18 60 0" stroke="${C.line}" stroke-width="6" fill="none"/>
    <path d="M840 720 q 30 18 60 0" stroke="${C.line}" stroke-width="6" fill="none"/>
    ${closed ? `<path d="${right}" fill="${fill}"/><path d="${left}" fill="${fill}"/>` : `<path d="${left}" fill="${fill}"/><path d="${right}" fill="${fill}"/>`}
    <path d="M700 430 H814 L812 ${hem} H700 Z" fill="url(#shade)"/>
    ${collar === 'notch' ? `<path d="${lapelL}" fill="${shade}"/><path d="${lapelR}" fill="${shade}"/><path d="M548 428 H652 L640 404 H560 Z" fill="${dark}"/>` : ''}
    ${collar === 'stand' ? `<path d="M540 438 H660 L652 398 H548 Z" fill="${shade}"/><path d="M548 428 H652 L640 404 H560 Z" fill="${dark}"/>` : ''}
    ${collar === 'shirt' ? `<path d="M600 430 L546 474 L588 506 L600 430 Z" fill="${shade}"/><path d="M600 430 L654 474 L612 506 L600 430 Z" fill="${shade}"/><path d="M552 428 H648 L638 402 H562 Z" fill="${dark}"/>` : ''}
    ${pockets}
    ${extra}
    <path d="M400 ${hem - 4} H${closed ? 632 : 600 - gap}" stroke="${dark}" stroke-width="4" opacity="0.35"/>
    <path d="M${600 + gap} ${hem - 4} H800" stroke="${dark}" stroke-width="4" opacity="0.35"/>
  </g>`;
}

const GARMENTS = {
  'base.svg': '',

  // 01 — Meridian Overcoat, camel. Long, open, notch lapel, welt pockets.
  'jacket-01.svg': jacket({
    fill: '#B08659', shade: '#9C7449', dark: '#8A653D', hem: 1240, v: 760, collar: 'notch',
    pockets: `<path d="M420 905 H520" stroke="#8A653D" stroke-width="8" opacity="0.7"/><path d="M680 905 H780" stroke="#8A653D" stroke-width="8" opacity="0.7"/>`,
  }),

  // 02 — Rule Two-Button Jacket, navy. Hip length, fastened, flap pockets.
  'jacket-02.svg': jacket({
    fill: '#26303F', shade: '#1D2531', dark: '#151B25', hem: 1085, v: 790, closed: true, collar: 'notch',
    pockets: `<rect x="404" y="880" width="132" height="26" rx="4" fill="#1D2531"/><rect x="664" y="880" width="132" height="26" rx="4" fill="#1D2531"/><path d="M426 604 H506" stroke="#151B25" stroke-width="6" opacity="0.8"/>`,
    extra: `<circle cx="616" cy="812" r="10" fill="#0E1218"/><circle cx="616" cy="900" r="10" fill="#0E1218"/>`,
  }),

  // 03 — Ledger Field Jacket, olive. Stand collar, four patch pockets, open.
  'jacket-03.svg': jacket({
    fill: '#6B6B4E', shade: '#5C5C42', dark: '#4C4C36', hem: 1040, v: 560, gap: 18, collar: 'stand',
    pockets: `
      <rect x="410" y="566" width="112" height="100" rx="6" fill="#5C5C42" opacity="0.9"/>
      <rect x="678" y="566" width="112" height="100" rx="6" fill="#5C5C42" opacity="0.9"/>
      <rect x="400" y="880" width="132" height="128" rx="6" fill="#5C5C42" opacity="0.9"/>
      <rect x="668" y="880" width="132" height="128" rx="6" fill="#5C5C42" opacity="0.9"/>
      <path d="M410 596 H522 M678 596 H790 M400 912 H532 M668 912 H800" stroke="#4C4C36" stroke-width="5"/>`,
  }),

  // 04 — Margin Overshirt, stone. Shirt collar, chest pockets, unbuttoned.
  'jacket-04.svg': jacket({
    fill: '#BDB6A9', shade: '#A9A296', dark: '#948D80', hem: 1060, v: 520, gap: 22, collar: 'shirt',
    pockets: `
      <rect x="418" y="566" width="118" height="104" rx="6" fill="#B2AB9E"/>
      <rect x="664" y="566" width="118" height="104" rx="6" fill="#B2AB9E"/>
      <path d="M418 594 H536 M664 594 H782" stroke="#948D80" stroke-width="5"/>`,
    extra: [560, 650, 740, 830, 920, 1010].map((y) => `<circle cx="634" cy="${y}" r="7" fill="#7E776B"/>`).join(''),
  }),
};

mkdirSync(OUT, { recursive: true });
for (const [name, garment] of Object.entries(GARMENTS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>Placeholder outfit frame — ${name}</title>
  ${figure()}
  ${garment}
</svg>`;
  writeFileSync(`${OUT}/${name}`, svg);
  console.log('wrote', `${OUT}/${name}`);
}
