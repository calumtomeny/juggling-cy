// The Juggling Cyprus mark: the island, with three balls thrown in a loop
// between the north coast and Larnaca. Used by the page, the favicon and the
// share images, and by the browser to animate the balls, so it is plain ESM
// with no DOM access.

export const COLORS = {
  sea: "#0e4c59",
  deep: "#083640",
  copper: "#e39a32",
  copperEdge: "#8c4e10",
  gold: "#f0c14a",
  foam: "#f7f4ec",
  lemon: "#f3d35a",
  bloom: "#e24b73",
  ink: "#1c2420",
};

export const BALL_COLORS = [COLORS.foam, COLORS.lemon, COLORS.bloom];

// Island outline in its own 360×262 drawing space.
export const ISLAND =
  "M16.0 161.6 L17.0 159.4 L19.8 160.5 L24.4 164.7 L28.9 167.0 L33.2 167.5 L37.8 166.0 L42.7 162.7 L47.7 156.8 L52.8 148.4 L56.1 144.6 L57.7 145.4 L61.1 144.9 L66.5 143.3 L72.5 143.0 L79.1 143.8 L85.4 145.6 L91.3 148.2 L95.6 149.2 L98.4 148.4 L102.0 144.8 L106.3 138.2 L108.3 127.7 L107.7 113.4 L112.7 107.9 L123.2 111.3 L141.2 114.3 L166.8 116.9 L187.7 116.9 L204.1 114.3 L216.7 110.5 L225.7 105.5 L231.9 103.3 L235.5 103.9 L244.5 101.5 L258.8 96.2 L269.3 91.9 L275.9 88.3 L281.0 84.8 L284.6 81.1 L291.4 77.9 L301.3 75.1 L315.9 69.1 L335.1 59.9 L344.0 57.4 L342.7 61.6 L340.9 64.0 L338.6 64.4 L330.8 69.7 L317.6 79.8 L303.2 89.4 L287.9 98.7 L276.9 107.6 L270.3 116.2 L263.6 120.7 L257.0 121.0 L252.3 123.4 L249.4 127.9 L247.7 134.3 L246.9 142.5 L251.9 152.3 L262.6 163.8 L269.6 172.4 L273.0 178.2 L271.6 180.2 L265.4 178.3 L258.8 178.1 L251.6 179.6 L246.4 181.8 L243.1 184.7 L239.2 184.6 L234.9 181.5 L228.4 180.3 L219.7 180.9 L214.2 182.6 L211.9 185.6 L210.2 190.5 L209.2 197.4 L207.7 202.1 L205.6 204.8 L202.4 206.4 L198.1 206.9 L194.9 208.6 L192.8 211.2 L189.1 213.5 L183.8 215.4 L180.2 216.5 L178.4 217.0 L177.0 216.5 L176.0 215.2 L175.5 215.8 L175.5 218.3 L170.5 221.4 L160.5 225.3 L149.4 227.4 L137.1 228.0 L128.4 230.9 L123.3 236.0 L121.3 241.4 L122.3 247.1 L119.8 250.0 L113.6 250.0 L109.5 246.2 L107.5 238.6 L103.7 234.2 L98.0 233.0 L90.7 233.5 L81.8 235.7 L68.5 233.5 L50.9 226.9 L40.4 222.3 L37.1 219.5 L34.3 213.9 L32.0 205.6 L28.8 199.3 L24.7 195.0 L22.9 191.8 L23.4 189.6 L21.6 182.1 L17.5 169.2 Z";

// Where the island sits inside the 400×400 badge.
export const ISLAND_CENTER = [180, 153.5];
export const ISLAND_SCALE = 0.74;
export const ISLAND_TRANSFORM = `translate(200 200) scale(${ISLAND_SCALE}) translate(${-ISLAND_CENTER[0]} ${-ISLAND_CENTER[1]})`;

// Free-flying balls bounce inside this circle (island units).
export const BOUNDS = { cx: ISLAND_CENTER[0], cy: ISLAND_CENTER[1], r: 186 };

export const BALL_R = 13;
export const LARNACA = [205, 183];

// The two "hands": the north coast near Kyrenia, and Larnaca in the south.
// Balls are caught a little to one side and carried across before the throw.
const N_CATCH = [182, 121], N_THROW = [202, 121];
const S_CATCH = [215, 183], S_THROW = [195, 183];
const WEST = [26, 152];  // control point of the arc south → north
const EAST = [372, 152]; // control point of the arc north → south

export const ARCS = {
  west: `M${S_THROW} Q${WEST} ${N_CATCH}`,
  east: `M${N_THROW} Q${EAST} ${S_CATCH}`,
};

export const FLIGHT = 0.85;
export const DWELL = 0.35;
export const PERIOD = 2 * (FLIGHT + DWELL);

const quad = (a, c, b, u) => [
  (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
  (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
];
const scoop = (a, b, v, lift) => [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v + Math.sin(Math.PI * v) * lift];

// Position of ball i (0–2) at time t seconds, in island units. A quadratic
// Bézier walked at constant speed is a true parabola, so the throws look right.
export function ballPosition(t, i) {
  let p = (((t + (i * PERIOD) / 3) % PERIOD) + PERIOD) % PERIOD;
  if (p < FLIGHT) return quad(S_THROW, WEST, N_CATCH, p / FLIGHT);
  p -= FLIGHT;
  if (p < DWELL) return scoop(N_CATCH, N_THROW, p / DWELL, -7);
  p -= DWELL;
  if (p < FLIGHT) return quad(N_THROW, EAST, S_CATCH, p / FLIGHT);
  p -= FLIGHT;
  return scoop(S_CATCH, S_THROW, p / DWELL, 7);
}

// A moment where the three balls are nicely spread, for still images.
export const STILL_T = 0.5;

const ball = (i, [x, y], extra = "") =>
  `<g class="ball" data-ball="${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"${extra}>` +
  `<circle r="${BALL_R}" cx="3.5" cy="4.5" fill="${COLORS.deep}"/>` +
  `<circle r="${BALL_R}" fill="${BALL_COLORS[i]}" stroke="${COLORS.deep}" stroke-width="3.5"/>` +
  `</g>`;

function islandGroup({ pinPulse = false } = {}) {
  return (
    `<g class="island" transform="${ISLAND_TRANSFORM}">` +
    `<path d="${ISLAND}" fill="${COLORS.deep}" transform="translate(6 7)"/>` +
    `<path d="${ISLAND}" fill="${COLORS.copper}" stroke="${COLORS.copperEdge}" stroke-width="3" stroke-linejoin="round"/>` +
    `<g fill="none" stroke="${COLORS.gold}" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9" opacity="0.95">` +
    `<path d="${ARCS.west}"/><path d="${ARCS.east}"/></g>` +
    (pinPulse ? `<circle class="pin-pulse" cx="${LARNACA[0]}" cy="${LARNACA[1]}" r="20" fill="none" stroke="${COLORS.foam}" stroke-width="2.5"/>` : "") +
    `<circle cx="${LARNACA[0]}" cy="${LARNACA[1]}" r="20" fill="none" stroke="${COLORS.foam}" stroke-width="2.5" stroke-dasharray="4 5"/>` +
    `<g class="balls">${[0, 1, 2].map((i) => ball(i, ballPosition(STILL_T, i))).join("")}</g>` +
    `</g>`
  );
}

// Text running round the badge edge, one segment per language, with a ball
// between each. Letters are placed one by one using Syne ExtraBold's advance
// widths (in em), so the ring renders the same in browsers and in resvg.
export const RING_TEXT = ["JUGGLING CYPRUS", "ΖΟΓΚΛΕΡ ΚΥΠΡΟΥ", "KIBRIS JONGLÖRLERİ"];
const ADVANCE = {
  " ": 0.31, B: 1.14, C: 1.316, E: 1.14, G: 1.34, I: 0.42, J: 1.004, K: 1.215, L: 0.943, N: 1.3,
  O: 1.33, P: 1.177, R: 1.232, S: 1.056, U: 1.289, Y: 1.07, Ö: 1.33, İ: 0.42, Γ: 0.948, Ε: 1.14,
  Ζ: 1.12, Κ: 1.215, Λ: 1.16, Ο: 1.33, Π: 1.28, Ρ: 1.177, Υ: 1.07,
};
const RING_R = 166;    // text baseline radius
const RING_GAP = 40;   // arc length given to each separator ball
const TRACK = 0.06;    // letter spacing, em

function ring(font) {
  const ems = RING_TEXT.join("").length * TRACK + [...RING_TEXT.join("")].reduce((n, ch) => n + ADVANCE[ch], 0);
  const size = (2 * Math.PI * RING_R - RING_TEXT.length * RING_GAP) / ems;
  const deg = (s) => ((s / RING_R) * 180) / Math.PI;
  const mid = RING_R + size * 0.36; // radius through the middle of the capitals
  // Start so the English name is centred over the top.
  const first = [...RING_TEXT[0]].reduce((n, ch) => n + (ADVANCE[ch] + TRACK) * size, 0);
  let s = -(RING_GAP + first / 2), out = "";
  RING_TEXT.forEach((txt, i) => {
    const a = (deg(s + RING_GAP / 2) * Math.PI) / 180;
    const [x, y] = [200 + mid * Math.sin(a), 200 - mid * Math.cos(a)];
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="${BALL_COLORS[i]}" stroke="${COLORS.deep}" stroke-width="2.5"/>`;
    s += RING_GAP;
    for (const ch of txt) {
      const w = (ADVANCE[ch] + TRACK) * size;
      if (ch !== " ") out += `<text x="200" y="${200 - RING_R}" text-anchor="middle" transform="rotate(${deg(s + w / 2).toFixed(2)} 200 200)">${ch}</text>`;
      s += w;
    }
  });
  return (
    `<g class="ring"><g font-family="${font}" font-weight="800" font-size="${size.toFixed(2)}" fill="${COLORS.foam}">` +
    out +
    `</g></g>`
  );
}

// The full badge: round, with the three-language ring.
export function badgeSVG({ font = "'Syne Variable', Syne, sans-serif", attrs = "", pinPulse = false } = {}) {
  return (
    `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" ${attrs}>` +
    `<circle cx="200" cy="200" r="199" fill="${COLORS.sea}"/>` +
    `<circle cx="200" cy="200" r="152" fill="${COLORS.deep}"/>` +
    `<circle cx="200" cy="200" r="196" fill="none" stroke="${COLORS.foam}" stroke-opacity="0.25" stroke-width="1.5"/>` +
    ring(font) +
    islandGroup({ pinPulse }) +
    `</svg>`
  );
}

// Compact mark without lettering, for the header, footer and favicon.
export function markSVG({ attrs = "", square = false } = {}) {
  const bg = square
    ? `<rect width="400" height="400" rx="88" fill="${COLORS.sea}"/>`
    : `<circle cx="200" cy="200" r="199" fill="${COLORS.deep}"/>`;
  // Scale the island up so it fills the mark; balls drawn larger to read small.
  const big = (i, [x, y]) =>
    `<circle cx="${x + 4}" cy="${y + 5}" r="24" fill="${COLORS.deep}"/>` +
    `<circle cx="${x}" cy="${y}" r="24" fill="${BALL_COLORS[i]}" stroke="${COLORS.deep}" stroke-width="6"/>`;
  return (
    `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" ${attrs}>${bg}` +
    `<g transform="translate(200 206) scale(1.12) translate(${-ISLAND_CENTER[0]} ${-ISLAND_CENTER[1]})">` +
    `<path d="${ISLAND}" fill="${COLORS.deep}" transform="translate(5 6)"/>` +
    `<path d="${ISLAND}" fill="${COLORS.copper}" stroke="${COLORS.copperEdge}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="${ARCS.west}" fill="none" stroke="${COLORS.gold}" stroke-width="6" stroke-linecap="round"/>` +
    big(0, [190, 119]) + big(1, [101, 160]) + big(2, [203, 186]) +
    `</g></svg>`
  );
}
