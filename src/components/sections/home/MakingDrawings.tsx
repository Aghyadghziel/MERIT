/**
 * Three pattern-room drawings for the stages no photograph on the site shows:
 * the block, the chest, and pressing. They are drawn, not photographed, and
 * say so: hairline ink on a warm-white sheet, labelled like a pattern.
 *
 * Every solid stroke is a <path> with pathLength=1 and class `mk-d`, so the
 * strip can draw it on as the sheet crosses the room; dashed guides, fills and
 * labels carry `mk-f` and fade in after. Without motion they are simply drawn.
 * Each sheet is 400 × 500, the 4:5 of the photographs beside it.
 */

const INK = 'var(--color-ink)';
const MUTE = 'var(--color-mute)';

/** Hairline ink, drawn on. */
function D({ d, w = 1.35, c = INK, fill = 'none' }: { d: string; w?: number; c?: string; fill?: string }) {
  return <path className="mk-d" d={d} pathLength={1} fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
}

/** A dashed guide, faded in. */
function G({ d, w = 1, c = MUTE, dash = '5 4' }: { d: string; w?: number; c?: string; dash?: string }) {
  return <path className="mk-f" d={d} fill="none" stroke={c} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" />;
}

/** A pattern label: small, uppercase, tracked, in the secondary ink. */
function T({ x, y, children, anchor = 'start', rotate }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end'; rotate?: number }) {
  return (
    <text
      className="mk-f"
      x={x}
      y={y}
      textAnchor={anchor}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      fill={MUTE}
      style={{ font: '600 9.5px var(--font-sans), system-ui, sans-serif', letterSpacing: '0.14em', textTransform: 'uppercase' }}
    >
      {children}
    </text>
  );
}

/** The dot a leader starts from, on the thing it names. */
function Dot({ x, y }: { x: number; y: number }) {
  return <circle className="mk-f" cx={x} cy={y} r={2.4} fill={INK} />;
}

function Sheet({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 500" role="img" aria-label={label} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  );
}

/**
 * The block: the Column trouser front, with the two lines the house draws
 * against it — where a jacket ends, and where a coat does.
 */
export function BlockDrawing() {
  return (
    <Sheet label="Line drawing of the Column trouser front pattern, with dashed lines marking where a jacket and a coat end against it.">
      <T x={26} y={36}>Column trouser</T>
      <T x={26} y={50}>Front — cut 2</T>

      {/* The piece. */}
      <D d="M136 76 L258 70 L262 152 C264 180 284 198 318 201 L300 462 L110 462 L118 204 C120 154 126 110 136 76 Z" w={1.5} />
      {/* Pleats, pocket and fly. */}
      <G d="M178 74 L180 118" dash="3 3" />
      <G d="M202 73 L203 104" dash="3 3" />
      <G d="M142 86 L158 150" dash="3 3" />
      <G d="M244 72 L246 136 C246 148 252 154 262 156" dash="3 3" />
      {/* Notches. */}
      <D d="M113 204 L124 204" w={1.2} />
      <D d="M256 122 L266 122" w={1.2} />
      <D d="M303 330 L313 331" w={1.2} />
      {/* Grain line. */}
      <D d="M206 196 L206 424" w={1.1} />
      <D d="M200 206 L206 196 L212 206" w={1.1} />
      <D d="M200 414 L206 424 L212 414" w={1.1} />
      <T x={200} y={284} anchor="middle" rotate={-90}>Grain</T>
      {/* Knee. */}
      <G d="M114 330 L303 330" dash="2 4" />
      <T x={322} y={334}>Knee</T>

      {/* The two lines drawn against it. */}
      <G d="M22 236 L378 236" c={INK} dash="7 5" />
      <T x={26} y={228}>A jacket ends</T>
      <G d="M22 398 L378 398" c={INK} dash="7 5" />
      <T x={26} y={390}>A coat ends</T>
    </Sheet>
  );
}

/** One chest piece: neck, shoulder, armhole, side, hem, front edge. */
const CHEST = 'M30 0 L150 26 C132 70 128 124 158 160 L160 250 L12 262 C8 200 0 150 0 110 Z';

/**
 * The chest, taken apart: cloth, horsehair canvas and domette, offset so all
 * three read, with the hand pad stitch on the canvas shown through a loupe.
 */
export function ChestDrawing() {
  return (
    <Sheet label="Line drawing of a jacket chest taken apart into three layers, cloth, horsehair canvas and domette, with a close-up of the hand pad stitch.">
      <defs>
        <pattern id="mk-pad" width="9" height="12" patternUnits="userSpaceOnUse">
          <path d="M2.5 1.5 L6.5 5.5 M6.5 6.5 L2.5 10.5" stroke={MUTE} strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </pattern>
        <clipPath id="mk-loupe"><circle cx="80" cy="88" r="54" /></clipPath>
      </defs>

      {/* Domette, at the back. */}
      <g transform="translate(150 118)">
        <path className="mk-f" d={CHEST} fill="var(--color-bone-2)" />
        <D d={CHEST} c={MUTE} w={1.2} />
      </g>
      {/* Hair canvas, pad-stitched. */}
      <g transform="translate(112 156)">
        <path d={CHEST} fill="var(--color-bone)" />
        <path className="mk-f" d={CHEST} fill="url(#mk-pad)" />
        <D d={CHEST} w={1.3} />
      </g>
      {/* Cloth, in front. */}
      <g transform="translate(74 194)">
        <path d={CHEST} fill="var(--color-bone)" />
        <D d={CHEST} w={1.6} />
        <G d="M30 0 L10 176" dash="4 4" />
      </g>

      {/* Leaders and labels. */}
      <D d="M280 168 L318 132 L380 132" c={MUTE} w={1} />
      <Dot x={280} y={168} />
      <T x={380} y={124} anchor="end">Domette</T>
      <D d="M240 222 L380 222" c={MUTE} w={1} />
      <Dot x={240} y={222} />
      <T x={380} y={214} anchor="end">Hair canvas</T>
      <D d="M190 410 L380 410" c={MUTE} w={1} />
      <Dot x={190} y={410} />
      <T x={380} y={402} anchor="end">Cloth</T>
      <T x={101} y={316} anchor="middle" rotate={-83}>Roll line</T>

      {/* The loupe: the pad stitch, close. */}
      <D d="M118 126 L166 176" c={MUTE} w={1} />
      <Dot x={166} y={176} />
      <g clipPath="url(#mk-loupe)">
        <rect className="mk-f" x="20" y="30" width="130" height="120" fill="var(--color-bone-2)" />
        {Array.from({ length: 5 }, (_, col) =>
          Array.from({ length: 5 }, (__, row) => {
            const x = 34 + col * 22;
            const y = 38 + row * 26;
            return <G key={`${col}-${row}`} d={`M${x} ${y} L${x + 10} ${y + 10} L${x} ${y + 20}`} c={INK} w={1.4} dash="none" />;
          }),
        )}
      </g>
      <D d="M80 34 A54 54 0 1 1 79.9 34 Z" w={1.4} />
      <T x={26} y={164}>Pad stitch</T>
      <T x={26} y={178}>By hand</T>
    </Sheet>
  );
}

/**
 * Pressing: the seam in section, its allowances pressed open, and the same
 * seam laid over a tailor's ham, where it is done.
 */
export function PressingDrawing() {
  return (
    <Sheet label="Line drawing of a seam in cross-section with its allowances pressed open, and the cloth laid over a tailor's ham for pressing.">
      {/* The seam in section, drawn large. */}
      <T x={26} y={36}>Seam, in section</T>
      <D d="M30 96 L193 96 C203 96 203 124 193 124 L128 124" w={1.5} />
      <D d="M30 106 L188 106 C192 106 192 114 188 114 L128 114" w={1.2} />
      <D d="M370 96 L207 96 C197 96 197 124 207 124 L272 124" w={1.5} />
      <D d="M370 106 L212 106 C208 106 208 114 212 114 L272 114" w={1.2} />
      <G d="M200 90 L200 130" c={INK} dash="2.5 2.5" w={1.2} />
      <T x={30} y={84}>Face</T>
      <D d="M150 146 L118 146 M124 141 L118 146 L124 151" c={MUTE} w={1} />
      <D d="M250 146 L282 146 M276 141 L282 146 L276 151" c={MUTE} w={1} />
      <T x={200} y={176} anchor="middle">Allowances, pressed open</T>

      {/* The callout, from the ham up to the section. */}
      <G d="M200 186 L200 262" dash="3 4" />
      <D d="M216 286 A16 16 0 1 1 215.9 286 Z" c={MUTE} w={1} />

      {/* The ham, and the cloth over it. */}
      <D d="M44 430 C44 346 118 296 200 296 C282 296 356 346 356 430 C356 458 322 470 200 470 C78 470 44 458 44 430 Z" w={1.5} />
      <G d="M62 446 C112 404 288 404 338 446" dash="4 4" />
      <D d="M18 384 C62 318 128 280 200 280 C272 280 338 318 382 384" w={1.5} />
      <D d="M24 390 C66 326 130 290 200 290 C270 290 334 326 376 390" w={1.1} />
      <T x={200} y={404} anchor="middle">Ham</T>
    </Sheet>
  );
}
