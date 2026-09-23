/**
 * Renders the wordmark geometry to static SVGs for the favicon, OG image and
 * anything that cannot run React. Run: node tools/logo/build.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { STROKE, SYMBOL, WORDMARK } from '../../src/lib/brand.ts';

const OUT = 'public/brand';
mkdirSync(OUT, { recursive: true });

const render = (mark, color, bg) => {
  const paths = mark.paths
    .map((p) => `<path d="${p.d}" transform="translate(${p.x} 0)"/>`)
    .join('');
  const [x, y, w, h] = mark.viewBox.split(' ').map(Number);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.viewBox}" width="${w}" height="${h}">${
    bg ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>` : ''
  }<g fill="none" stroke="${color}" stroke-width="${STROKE}">${paths}</g></svg>`;
};

/** A square, padded canvas — the mark needs air to survive a 16px favicon. */
const renderIcon = (mark, color, bg) => {
  const [x, y, w, h] = mark.viewBox.split(' ').map(Number);
  const side = Math.max(w, h) * 1.34;
  const ox = x - (side - w) / 2;
  const oy = y - (side - h) / 2;
  const paths = mark.paths
    .map((p) => `<path d="${p.d}" transform="translate(${p.x} 0)"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ox} ${oy} ${side} ${side}" width="${Math.round(side)}" height="${Math.round(side)}"><rect x="${ox}" y="${oy}" width="${side}" height="${side}" fill="${bg}"/><g fill="none" stroke="${color}" stroke-width="${STROKE}">${paths}</g></svg>`;
};

const files = {
  'wordmark.svg': render(WORDMARK, '#101010'),
  'wordmark-bone.svg': render(WORDMARK, '#f4f2ed'),
  'symbol.svg': render(SYMBOL, '#101010'),
  'symbol-bone.svg': render(SYMBOL, '#f4f2ed'),
  'icon.svg': renderIcon(SYMBOL, '#f4f2ed', '#101010'),
  'icon-bone.svg': renderIcon(SYMBOL, '#101010', '#f4f2ed'),
};

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(`${OUT}/${name}`, svg);
  console.log('wrote', `${OUT}/${name}`);
}
