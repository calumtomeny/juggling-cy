// Renders the favicon, touch icon, per-language share images and calendar
// files, and the sitemap, into public/ from the badge in src/badge.js and the
// facts in src/site.js, so they never drift from the page.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import wawoff2 from "wawoff2";
import { badgeSVG, markSVG, COLORS } from "../src/badge.js";
import { LANGS, PIN, RRULE, TZ, calendarEvent, deployment, icsFile } from "../src/site.js";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
const pub = new URL("public/", root);
const cache = new URL("node_modules/.cache/og-fonts/", root);

// resvg needs TrueType, and Fontsource ships WOFF2, so unpack Syne once.
async function fonts() {
  await mkdir(cache, { recursive: true });
  const files = [];
  for (const subset of ["latin", "latin-ext", "greek"]) {
    const out = new URL(`syne-${subset}-800.ttf`, cache);
    try {
      await readFile(out);
    } catch {
      const woff2 = await readFile(require.resolve(`@fontsource/syne/files/syne-${subset}-800-normal.woff2`));
      await writeFile(out, await wawoff2.decompress(woff2));
    }
    files.push(out.pathname);
  }
  return files;
}

const fontFiles = await fonts();
const png = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Syne" },
  })
    .render()
    .asPng();

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Largest font size (up to max) at which a line of Syne fits the width.
function fit(text, width, max) {
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="300"><text x="0" y="200" font-family="Syne" font-weight="800" font-size="100">${esc(text)}</text></svg>`;
  const box = new Resvg(probe, { font: { fontFiles, loadSystemFonts: false } }).getBBox();
  return Math.min(max, Math.floor((100 * width) / box.width));
}

function ogSVG(t) {
  const x = 625, w = 1200 - x - 50;
  const line = (y, text, max, color) =>
    `<text x="${x}" y="${y}" font-size="${fit(text, w, max)}" fill="${color}">${esc(text)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.5" fill="${COLORS.foam}" fill-opacity="0.08"/></pattern></defs>
  <rect width="1200" height="630" fill="${COLORS.sea}"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  ${badgeSVG({ font: "Syne", attrs: 'x="35" y="45" width="540" height="540"' })}
  <g font-family="Syne" font-weight="800">
    ${line(185, "Juggling Cyprus", 34, COLORS.foam)}
    ${line(275, t.og.line1, 56, COLORS.foam)}
    ${line(420, t.og.time, 150, COLORS.gold)}
    ${line(492, t.og.line2, 34, COLORS.lemon)}
  </g>
</svg>`;
}

// The weekly session as an iCalendar file, for "Add to calendar" in Apple
// Calendar, Outlook and most other apps. iCalendar wants CRLF line endings
// and lines folded at 75 bytes.
const icsText = (s) => s.replace(/[\\;,]/g, "\\$&").replace(/\n/g, "\\n");
function fold(line) {
  let out = "", bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch);
    if (bytes + n > 75) {
      out += "\r\n ";
      bytes = 1;
    }
    out += ch;
    bytes += n;
  }
  return out;
}
function ics(e) {
  const stamp = new Date().toISOString().replace(/[-:]|\.\d+/g, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Juggling Cyprus//juggling.cy//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    `TZID:${TZ}`,
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0300",
    "TZNAME:EEST",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "DTSTART:19701025T040000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "TZOFFSETFROM:+0300",
    "TZOFFSETTO:+0200",
    "TZNAME:EET",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    "UID:weekly-meetup@juggling.cy",
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZ}:${e.start}`,
    `DTEND;TZID=${TZ}:${e.end}`,
    `RRULE:${RRULE}`,
    `SUMMARY:${icsText(e.title)}`,
    `LOCATION:${icsText(e.location)}`,
    `GEO:${PIN.lat};${PIN.lon}`,
    `DESCRIPTION:${icsText(e.details)}`,
    `URL:${e.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n") + "\r\n";
}

await mkdir(pub, { recursive: true });

const favicon = markSVG({ square: true });
await writeFile(new URL("favicon.svg", pub), favicon);
await writeFile(new URL("apple-touch-icon.png", pub), png(favicon, 180));

const { url: site } = deployment(process.env);

for (const { code, path } of LANGS) {
  const t = JSON.parse(await readFile(new URL(`src/i18n/${code}.json`, root), "utf8"));
  await writeFile(new URL(`og-${code}.png`, pub), png(ogSVG(t), 1200));
  await writeFile(new URL(icsFile(code), pub), ics(calendarEvent(t, site + path)));
}

const alternates = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${site + l.path}"/>`).join("\n");
await writeFile(
  new URL("sitemap.xml", pub),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.map((l) => `  <url>\n    <loc>${site + l.path}</loc>\n${alternates}\n  </url>`).join("\n")}
</urlset>
`
);

await writeFile(new URL("robots.txt", pub), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);

console.log("assets: favicon, touch icon, share images, calendar files, sitemap, robots.txt");
