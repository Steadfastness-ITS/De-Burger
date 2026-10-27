// Transparent vector food art (no background) with a soft ground shadow.
// Each item is drawn on a 200 x 160 canvas; the shadow sits at the bottom.

export type ArtKind =
  | 'cheeseburger' | 'veggieburger' | 'chickenburger' | 'crispyburger' | 'baconburger'
  | 'pepperoni' | 'margherita' | 'veggiepizza' | 'bbqpizza'
  | 'chickenshawarma' | 'beefshawarma' | 'mixedshawarma'
  | 'hotdog' | 'sub'
  | 'wings' | 'nuggets' | 'drumsticks'
  | 'fries' | 'tacos' | 'shake';

export type FoodArt = { art: ArtKind };

const wrap = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">` +
  `<defs><radialGradient id="sh" cx="50%" cy="50%" r="50%">` +
  `<stop offset="0" stop-color="#000000" stop-opacity="0.34"/>` +
  `<stop offset="0.6" stop-color="#000000" stop-opacity="0.12"/>` +
  `<stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient></defs>` +
  `<ellipse cx="100" cy="146" rx="78" ry="10" fill="url(#sh)"/>${body}</svg>`;

// Wavy line: first segment bulges up, the rest alternate.
const wave = (x0: number, y: number, segs: number, w: number, amp: number): string =>
  `M${x0} ${y} q${w / 2} ${-amp} ${w} 0` + ` t${w} 0`.repeat(segs - 1);

// ---------------------------------------------------------------- burgers
type Layer =
  | 'patty' | 'grilled' | 'crispy' | 'veggie'
  | 'cheese' | 'lettuce' | 'tomato' | 'onion' | 'bacon' | 'sauce';

const SEEDS: [number, number][] = [
  [70, -38], [100, -44], [130, -38], [85, -26], [115, -26], [56, -22], [144, -22],
];

const burger = (layers: Layer[]): string => {
  let y = 124;
  let s = `<path d="M30 124 H170 V133 Q170 142 160 142 H40 Q30 142 30 133 Z" fill="#C97A25"/>`;
  for (const l of layers) {
    if (l === 'patty') {
      y -= 17;
      s += `<rect x="28" y="${y}" width="144" height="17" rx="8.5" fill="#5A2A14"/>` +
        `<rect x="40" y="${y + 3}" width="120" height="3" rx="1.5" fill="#85431F"/>`;
    } else if (l === 'grilled') {
      y -= 17;
      s += `<rect x="28" y="${y}" width="144" height="17" rx="8.5" fill="#C98B49"/>` +
        [50, 74, 98, 122, 146].map((x) =>
          `<path d="M${x} ${y + 3} l8 11" stroke="#8A5524" stroke-width="3" stroke-linecap="round"/>`).join('');
    } else if (l === 'crispy') {
      y -= 19;
      s += `<rect x="26" y="${y}" width="148" height="19" rx="9.5" fill="#D8922E"/>` +
        `<rect x="40" y="${y + 3}" width="110" height="4" rx="2" fill="#EEB75A"/>` +
        [44, 62, 84, 108, 130, 152].map((x, i) =>
          `<circle cx="${x}" cy="${y + 10 + (i % 2) * 3}" r="2.6" fill="#B26E18"/>`).join('');
    } else if (l === 'veggie') {
      y -= 17;
      s += `<rect x="28" y="${y}" width="144" height="17" rx="8.5" fill="#6A4A2A"/>` +
        [46, 66, 90, 112, 134, 154].map((x, i) =>
          `<circle cx="${x}" cy="${y + 8 + (i % 2) * 3}" r="2.6" fill="${i % 2 ? '#7CB342' : '#E58A2B'}"/>`).join('');
    } else if (l === 'cheese') {
      y -= 7;
      s += `<path d="M26 ${y} H174 L170 ${y + 7} L150 ${y + 7} L142 ${y + 17} L134 ${y + 7} ` +
        `L66 ${y + 7} L58 ${y + 14} L50 ${y + 7} L30 ${y + 7} Z" fill="#F7C531"/>`;
    } else if (l === 'lettuce') {
      y -= 11;
      s += `<path d="${wave(22, y + 5, 8, 19.5, 10)} V${y + 11} H22 Z" fill="#6DB33F"/>` +
        `<path d="${wave(30, y + 7, 7, 19.5, 8)}" fill="none" stroke="#8CCB5B" stroke-width="1.6"/>`;
    } else if (l === 'tomato') {
      y -= 9;
      s += [30, 79, 128].map((x) =>
        `<rect x="${x}" y="${y}" width="43" height="9" rx="4.5" fill="#E5483A"/>`).join('');
    } else if (l === 'onion') {
      y -= 5;
      s += `<rect x="34" y="${y}" width="132" height="5" rx="2.5" fill="#B77FC4"/>`;
    } else if (l === 'bacon') {
      y -= 8;
      s += `<path d="${wave(26, y + 4, 6, 24, 9)}" fill="none" stroke="#B8381F" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="${wave(26, y + 4, 6, 24, 9)}" fill="none" stroke="#E0705A" stroke-width="2" stroke-linecap="round"/>`;
    } else if (l === 'sauce') {
      y -= 5;
      s += `<rect x="32" y="${y}" width="136" height="5" rx="2.5" fill="#FFF3D6"/>`;
    }
  }
  const t = y;
  s += `<path d="M30 ${t} Q30 ${t - 54} 100 ${t - 54} Q170 ${t - 54} 170 ${t} Z" fill="#E09A3E"/>` +
    `<rect x="30" y="${t - 3}" width="140" height="8" rx="4" fill="#C97A25"/>` +
    `<ellipse cx="76" cy="${t - 34}" rx="24" ry="9" fill="#F4BC6B" opacity="0.65" transform="rotate(-18 76 ${t - 34})"/>` +
    SEEDS.map(([dx, dy]) =>
      `<ellipse cx="${dx}" cy="${t + dy}" rx="4" ry="2" fill="#FFF1C9" transform="rotate(-20 ${dx} ${t + dy})"/>`).join('');
  return s;
};

// ----------------------------------------------------------------- pizzas
const PTS: [number, number][] = [
  [100, 50], [132, 62], [68, 62], [102, 76], [136, 88], [64, 88], [96, 98], [120, 104], [76, 104],
];

const pizza = (v: 'pepperoni' | 'margherita' | 'veggie' | 'bbq'): string => {
  const sauce = v === 'margherita' ? '#E2523A' : '#D9482B';
  const cheese = v === 'margherita' ? '#E2523A' : v === 'bbq' ? '#F3C550' : '#F6CB52';
  let s = `<ellipse cx="100" cy="85" rx="84" ry="60" fill="#B9772E"/>` +
    `<ellipse cx="100" cy="76" rx="84" ry="60" fill="#E3A44C"/>` +
    `<ellipse cx="100" cy="76" rx="72" ry="50" fill="${sauce}"/>` +
    `<ellipse cx="100" cy="76" rx="68" ry="46" fill="${cheese}"/>`;
  if (v === 'pepperoni') {
    s += PTS.map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="11" ry="7.5" fill="#C0392B"/>` +
      `<circle cx="${x - 3}" cy="${y - 1}" r="1.4" fill="#8E2417"/><circle cx="${x + 3}" cy="${y + 2}" r="1.4" fill="#8E2417"/>`).join('');
  } else if (v === 'margherita') {
    s += PTS.map(([x, y], i) => i % 2 === 0
      ? `<ellipse cx="${x}" cy="${y}" rx="13" ry="8.5" fill="#FFF7E0"/>`
      : `<ellipse cx="${x}" cy="${y}" rx="9" ry="4.6" fill="#3F9142" transform="rotate(${i * 25 - 60} ${x} ${y})"/>` +
        `<path d="M${x - 7} ${y} H${x + 7}" stroke="#2B6B2E" stroke-width="1" transform="rotate(${i * 25 - 60} ${x} ${y})"/>`).join('');
  } else if (v === 'veggie') {
    s += PTS.map(([x, y], i) => {
      const m = i % 4;
      if (m === 0) return `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.5" fill="none" stroke="#4CAF50" stroke-width="3"/>`;
      if (m === 1) return `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#2B2B2B"/><ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.4" fill="#F6CB52"/>`;
      if (m === 2) return `<ellipse cx="${x}" cy="${y}" rx="9" ry="5.8" fill="#EBDABD"/><ellipse cx="${x}" cy="${y + 1}" rx="5" ry="3" fill="#CDB48C"/>`;
      return `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.5" fill="none" stroke="#A64DA6" stroke-width="2.4"/>`;
    }).join('');
  } else {
    s += `<path d="M44 70 Q70 60 96 72 T152 70" fill="none" stroke="#6B2E14" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="M50 92 Q76 84 102 94 T148 92" fill="none" stroke="#6B2E14" stroke-width="3.2" stroke-linecap="round"/>` +
      PTS.map(([x, y], i) => i % 3 === 2
        ? `<ellipse cx="${x}" cy="${y}" rx="9" ry="5.8" fill="none" stroke="#A64DA6" stroke-width="2.2"/>`
        : `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.4" fill="#E2B073"/><ellipse cx="${x - 2}" cy="${y - 1}" rx="5" ry="2.6" fill="#F0CB9A"/>`).join('') +
      [[84, 82], [116, 66], [108, 92], [70, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#4CAF50"/>`).join('');
  }
  s += [0, 45, 90, 135].map((a) => {
    const r = (a * Math.PI) / 180;
    const dx = 68 * Math.cos(r);
    const dy = 46 * Math.sin(r);
    return `<line x1="${(100 - dx).toFixed(1)}" y1="${(76 - dy).toFixed(1)}" x2="${(100 + dx).toFixed(1)}" y2="${(76 + dy).toFixed(1)}" stroke="#000000" stroke-opacity="0.13" stroke-width="1.6"/>`;
  }).join('');
  return s;
};

// -------------------------------------------------------------- shawarmas
const shawarma = (meat: 'chicken' | 'beef' | 'mixed'): string => {
  const strips: [number, number, number][] = [[68, 42, -20], [88, 34, 8], [108, 36, -6], [124, 44, 24], [80, 50, 14]];
  const colors = meat === 'chicken' ? ['#D9A441', '#E8BD62']
    : meat === 'beef' ? ['#7A4A2B', '#5E331A'] : ['#D9A441', '#7A4A2B'];
  let s = `<g transform="translate(100 90) scale(1.15) rotate(-12) translate(-100 -96)">`;
  s += `<path d="${wave(62, 50, 4, 19, 12)} V60 H62 Z" fill="#6DB33F"/>`;
  s += strips.map(([x, y, r], i) =>
    `<rect x="${x}" y="${y}" width="24" height="8" rx="4" fill="${colors[i % 2]}" transform="rotate(${r} ${x + 12} ${y + 4})"/>`).join('');
  s += [76, 100, 122].map((x, i) => `<circle cx="${x}" cy="${52 + (i % 2) * 3}" r="6" fill="#E5483A"/>`).join('');
  if (meat === 'mixed') s += `<rect x="92" y="46" width="30" height="5" rx="2.5" fill="#9B4DA6"/>`;
  s += `<path d="M62 56 Q60 100 70 142 L130 142 Q140 100 138 56 Q100 72 62 56 Z" fill="#EFCF94"/>` +
    `<path d="M138 56 Q112 84 106 142" fill="none" stroke="#D4AE6B" stroke-width="2.2"/>` +
    `<path d="M66 98 L74 94 L82 98 L90 94 L98 98 L106 94 L114 98 L122 94 L130 98 L128 144 Q100 152 72 144 Z" fill="#D3D8E0"/>` +
    `<path d="M80 104 L84 140 M96 102 L98 146 M112 102 L112 146 M124 104 L120 140" stroke="#A4ACBA" stroke-width="1.4" fill="none"/>`;
  return s + `</g>`;
};

// ----------------------------------------------------------- other foods
const hotdog = (): string =>
  `<g transform="rotate(-6 100 100)">` +
  `<rect x="18" y="84" width="164" height="44" rx="22" fill="#C98536"/>` +
  `<rect x="8" y="72" width="184" height="30" rx="15" fill="#B3402A"/>` +
  `<rect x="22" y="76" width="150" height="6" rx="3" fill="#E0775B" opacity="0.7"/>` +
  `<path d="${wave(22, 86, 10, 16, 12)}" fill="none" stroke="#F5C518" stroke-width="4" stroke-linecap="round"/>` +
  `<rect x="18" y="96" width="164" height="34" rx="17" fill="#E8AC58"/>` +
  `<rect x="30" y="100" width="120" height="5" rx="2.5" fill="#F4C47E" opacity="0.8"/></g>`;

const sub = (): string =>
  `<g transform="rotate(-5 100 100)">` +
  `<rect x="14" y="108" width="172" height="28" rx="14" fill="#CF8A33"/>` +
  `<path d="${wave(16, 104, 9, 19.5, 12)} V114 H16 Z" fill="#6DB33F"/>` +
  `<path d="M20 108 H180 L174 116 L156 116 L148 124 L140 116 L60 116 L52 122 L44 116 L26 116 Z" fill="#F7C531"/>` +
  [42, 80, 118, 156].map((x) => `<circle cx="${x}" cy="106" r="7" fill="#E5483A"/>`).join('') +
  `<path d="M14 102 Q14 56 100 56 Q186 56 186 102 Z" fill="#E4A049"/>` +
  `<ellipse cx="70" cy="76" rx="30" ry="8" fill="#F4BC6B" opacity="0.6" transform="rotate(-8 70 76)"/>` +
  [[60, 84], [90, 70], [120, 80], [148, 90], [40, 94], [104, 92]].map(([x, y]) =>
    `<ellipse cx="${x}" cy="${y}" rx="4" ry="2" fill="#FFF1C9" transform="rotate(-20 ${x} ${y})"/>`).join('') +
  `</g>`;

const bone = '#F3E7D3';
const wingPiece = (x: number, y: number, r: number): string =>
  `<g transform="translate(${x} ${y}) rotate(${r})">` +
  `<rect x="30" y="-5" width="22" height="10" rx="5" fill="${bone}"/>` +
  `<circle cx="52" cy="-6" r="5.5" fill="${bone}"/><circle cx="52" cy="6" r="5.5" fill="${bone}"/>` +
  `<ellipse rx="40" ry="23" fill="#B8431C"/>` +
  `<ellipse cx="-8" cy="-9" rx="24" ry="7" fill="#E2673A" opacity="0.7"/>` +
  [[-20, 6], [0, 10], [14, -4], [-4, -2], [22, 8]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2" fill="#7A2410"/>`).join('') +
  `</g>`;
const wings = (): string => wingPiece(100, 66, -8) + wingPiece(66, 108, -18) + wingPiece(134, 104, 192);

const nugget = (x: number, y: number, r: number): string =>
  `<g transform="translate(${x} ${y}) rotate(${r})">` +
  `<rect x="-25" y="-19" width="50" height="38" rx="16" fill="#D8922E"/>` +
  `<rect x="-17" y="-14" width="30" height="9" rx="4.5" fill="#EEB75A" opacity="0.8"/>` +
  `<circle cx="-10" cy="6" r="2.4" fill="#B26E18"/><circle cx="6" cy="9" r="2.4" fill="#B26E18"/><circle cx="14" cy="-2" r="2.4" fill="#B26E18"/></g>`;
const nuggets = (): string =>
  nugget(92, 58, -10) + nugget(54, 78, 14) + nugget(128, 78, 8) + nugget(68, 110, -8) + nugget(108, 106, 16) +
  `<rect x="148" y="106" width="36" height="28" rx="6" fill="#F1F1F4" stroke="#D5D7DD" stroke-width="1.5"/>` +
  `<ellipse cx="166" cy="106" rx="18" ry="6" fill="#E5383B"/>`;

const stick = (x: number, y: number, r: number): string =>
  `<g transform="translate(${x} ${y}) rotate(${r})">` +
  `<rect x="26" y="-5" width="34" height="10" rx="5" fill="${bone}"/>` +
  `<circle cx="62" cy="-6" r="6" fill="${bone}"/><circle cx="62" cy="6" r="6" fill="${bone}"/>` +
  `<path d="M-36 0 C-36 -30 20 -34 34 -10 C40 0 40 0 34 10 C20 34 -36 30 -36 0 Z" fill="#CF8A2A"/>` +
  `<ellipse cx="-8" cy="-12" rx="20" ry="6" fill="#EDB659" opacity="0.65"/>` +
  [[-18, 6], [2, 10], [-4, -2], [16, 4]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.2" fill="#A5611A"/>`).join('') +
  `</g>`;
const drumsticks = (): string => stick(92, 66, 8) + stick(84, 108, -14);

const fries = (): string => {
  const f: [number, number, number][] = [
    [62, 40, -14], [72, 28, -8], [82, 22, -3], [92, 16, 2], [102, 22, 6], [112, 28, 10], [122, 38, 14], [132, 48, 18],
  ];
  return f.map(([x, y, a], i) =>
    `<rect x="${x}" y="${y}" width="9" height="74" rx="2" fill="${i % 2 ? '#EFB82E' : '#F5C842'}" transform="rotate(${a} ${x + 4} 96)"/>`).join('') +
    `<path d="M54 80 L146 80 L136 140 Q100 146 64 140 Z" fill="#E5383B"/>` +
    `<rect x="50" y="74" width="100" height="9" rx="3" fill="#C62828"/>` +
    `<path d="M62 112 H138" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.9"/>` +
    `<circle cx="100" cy="112" r="9" fill="#F5C842"/>`;
};

const tacos = (): string =>
  `<path d="M24 98 Q100 14 176 98 Z" fill="#E0A030"/>` +
  `<path d="${wave(34, 82, 7, 18.7, 14)} V100 H34 Z" fill="#6DB33F"/>` +
  [[56, 76], [84, 70], [112, 74], [136, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#E5483A"/>`).join('') +
  [[48, 88], [76, 84], [104, 86], [128, 88], [92, 80]].map(([x, y]) =>
    `<rect x="${x}" y="${y}" width="16" height="4" rx="2" fill="#F08A24" transform="rotate(${x % 3 * 12 - 12} ${x + 8} ${y + 2})"/>`).join('') +
  `<path d="M24 98 Q100 150 176 98 Z" fill="#F4C050"/>` +
  `<path d="M40 106 Q100 138 160 106" fill="none" stroke="#FAD98A" stroke-width="3" stroke-linecap="round"/>`;

const shake = (): string =>
  `<path d="M110 62 L128 8" stroke="#E5383B" stroke-width="7" stroke-linecap="round"/>` +
  `<path d="M116 44 L121 28" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>` +
  `<path d="M62 58 L138 58 L126 138 Q100 146 74 138 Z" fill="#6B3E26"/>` +
  `<path d="M62 58 L138 58 L136 76 L64 76 Z" fill="#8A5636"/>` +
  `<path d="M72 66 L81 66 L87 132 L80 132 Z" fill="#FFFFFF" opacity="0.28"/>` +
  `<circle cx="76" cy="54" r="15" fill="#FFF8EC"/><circle cx="124" cy="54" r="15" fill="#FFF8EC"/>` +
  `<circle cx="100" cy="46" r="20" fill="#FFFFFF"/>` +
  `<path d="M84 44 Q100 54 116 44" fill="none" stroke="#6B3E26" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="100" cy="26" r="9" fill="#C62828"/><path d="M100 18 Q104 8 112 6" fill="none" stroke="#3F7D2E" stroke-width="2"/>`;

// ------------------------------------------------------------------ public
export function getFoodSvg(kind: ArtKind): string {
  switch (kind) {
    case 'cheeseburger': return wrap(burger(['patty', 'cheese', 'onion', 'tomato', 'lettuce']));
    case 'veggieburger': return wrap(burger(['veggie', 'onion', 'tomato', 'lettuce']));
    case 'chickenburger': return wrap(burger(['grilled', 'sauce', 'tomato', 'lettuce']));
    case 'crispyburger': return wrap(burger(['crispy', 'cheese', 'sauce', 'lettuce']));
    case 'baconburger': return wrap(burger(['patty', 'cheese', 'patty', 'bacon', 'tomato']));
    case 'pepperoni': return wrap(pizza('pepperoni'));
    case 'margherita': return wrap(pizza('margherita'));
    case 'veggiepizza': return wrap(pizza('veggie'));
    case 'bbqpizza': return wrap(pizza('bbq'));
    case 'chickenshawarma': return wrap(shawarma('chicken'));
    case 'beefshawarma': return wrap(shawarma('beef'));
    case 'mixedshawarma': return wrap(shawarma('mixed'));
    case 'hotdog': return wrap(hotdog());
    case 'sub': return wrap(sub());
    case 'wings': return wrap(wings());
    case 'nuggets': return wrap(nuggets());
    case 'drumsticks': return wrap(drumsticks());
    case 'fries': return wrap(fries());
    case 'tacos': return wrap(tacos());
    case 'shake': return wrap(shake());
    default: return wrap('');
  }
}
