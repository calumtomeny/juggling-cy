// Renders one language's page to an HTML string. scripts/pages.mjs writes the
// result to index.html, el/index.html and tr/index.html for Vite to build.
import { badgeSVG, markSVG, BALL_COLORS, COLORS } from "./badge.js";
import { LANGS, DIRECTIONS, EMAIL, INSTAGRAM, PIN, TZ, START_HOUR } from "./site.js";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const ICONS = {
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  free: '<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13"/><path d="M12 7c-1.5-3-5-3.2-5-1s3 1 5 1c2 0 5 1.2 5-1s-3.5-2-5 1z"/>',
  kit: '<circle cx="7.5" cy="15.5" r="3.5"/><circle cx="16.5" cy="15.5" r="3.5"/><circle cx="12" cy="7" r="3.5"/>',
  light: '<path d="M12 21V9M8 21h8M7 5h10l-2 4H9z"/><path d="M9.5 12l-2 2M14.5 12l2 2"/>',
  rain: '<path d="M7 15a4 4 0 0 1-.5-8A5 5 0 0 1 16 6.5 3.5 3.5 0 0 1 17 15z"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>',
  levels: '<path d="M4 20h4v-5H4zM10 20h4V10h-4zM16 20h4V4h-4z"/>',
};
const icon = (name, size = 24) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const IG_ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>';
const PIN_ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>';
const ARROW_DOWN =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
const ARROW_RIGHT =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ARROW_OUT =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

function switcher(lang, t, cls, base) {
  const links = LANGS.map(
    (l) =>
      `<a href="${base + l.path.slice(1)}" hreflang="${l.code}" lang="${l.code}" data-lang="${l.code}"${l.code === lang ? ' aria-current="page"' : ""}>${l.label}</a>`
  ).join("");
  return `<nav class="switcher ${cls}" aria-label="${esc(t.nav.language)}">${links}</nav>`;
}

function mapSVG(map, t) {
  const m = t.find.map;
  const [px, py] = map.pin;
  const label = ([x, y], text, anchor = "middle", cls = "") =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" class="map-label ${cls}">${esc(text)}</text>`;
  return `<svg class="map" viewBox="0 0 ${map.width} ${map.height}" role="img" aria-label="${esc(t.find.mapLabel)}">
  <defs>
    <marker id="walk-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="${COLORS.deep}"/></marker>
    <pattern id="waves" width="46" height="22" patternUnits="userSpaceOnUse"><path d="M2 12q5.5-6 11 0t11 0" fill="none" stroke="#2d6b77" stroke-width="2" stroke-linecap="round"/></pattern>
  </defs>
  <rect width="${map.width}" height="${map.height}" class="map-land"/>
  <path d="${map.sea}" class="map-sea"/>
  <path d="${map.sea}" fill="url(#waves)"/>
  ${map.beaches.map((d) => `<path d="${d}" class="map-beach"/>`).join("")}
  <path d="${map.carpark}" class="map-carpark"/>
  ${map.aisles.map((d) => `<path d="${d}" class="map-aisle"/>`).join("")}
  ${map.footways.map((d) => `<path d="${d}" class="map-foot"/>`).join("")}
  <path d="${map.promenade}" class="map-prom"/>
  <path d="${map.road}" class="map-road"/>
  <path d="${map.road}" class="map-road-line"/>
  <path d="${map.dog}" class="map-dog"/>
  <path d="${map.skate}" class="map-skate"/>
  <path d="${map.walk}" class="map-walk" marker-end="url(#walk-arrow)"/>
  ${label(map.labels.sea, m.sea, "middle", "on-sea")}
  ${label(map.labels.beach, m.beach)}
  ${label(map.labels.carpark, m.carpark)}
  ${label(map.labels.skate, m.skate, "end", "strong")}
  ${label(map.labels.dog, m.dog, "end")}
  <text class="map-label road-label" transform="translate(${map.labels.road}) rotate(86)" text-anchor="middle">${esc(m.road)}</text>
  <g class="map-pin" transform="translate(${px} ${py})">
    <circle r="16" class="map-pin-pulse"/>
    <circle r="9" fill="${COLORS.bloom}" stroke="${COLORS.deep}" stroke-width="3.5"/>
    <g transform="translate(0 -26)">
      <rect x="-58" y="-22" width="116" height="32" rx="16" fill="${COLORS.deep}"/>
      <text y="0" text-anchor="middle" class="map-here">${esc(m.here)}</text>
    </g>
  </g>
</svg>`;
}

function jsonLd(t, lang, site) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Juggling Cyprus",
    description: t.meta.description,
    url: site + LANGS.find((l) => l.code === lang).path,
    inLanguage: lang,
    isAccessibleForFree: true,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: `${site}/og-${lang}.png`,
    eventSchedule: {
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: "https://schema.org/Tuesday",
      startTime: `${START_HOUR}:00`,
      scheduleTimezone: TZ,
    },
    location: {
      "@type": "Place",
      name: "Larnaca Skate Park",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Tasou Mitsopoulou",
        addressLocality: "Larnaca",
        addressCountry: "CY",
      },
      geo: { "@type": "GeoCoordinates", latitude: PIN.lat, longitude: PIN.lon },
    },
    organizer: {
      "@type": "Organization",
      name: "Juggling Cyprus",
      url: site + "/",
      email: EMAIL,
      sameAs: INSTAGRAM,
    },
  };
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
}

export function renderPage(t, lang, map, { url: site, base }) {
  const L = LANGS.find((l) => l.code === lang);
  const url = site + L.path;
  const home = base + L.path.slice(1);
  const coords = `${PIN.lat}, ${PIN.lon}`;
  const runtime = {
    lang,
    locale: L.locale,
    countdown: t.countdown,
    pause: t.hero.pause,
    play: t.hero.play,
    copied: t.find.copied,
  };
  const igLink = `<a href="${INSTAGRAM}">${esc(t.good.instagram)}</a>`;
  const feedback = t.footer.feedback
    ? `<p class="feedback"><a href="mailto:${EMAIL}?subject=${encodeURIComponent(`Translation feedback (${L.label})`)}">${esc(t.footer.feedback)}</a></p>`
    : "";
  // On the English home page only: send returning visitors to the language they picked.
  const remember =
    lang === "en"
      ? `try{var l=localStorage.getItem("jc-lang");if((l==="el"||l==="tr")&&location.pathname===${JSON.stringify(base)}&&!location.hash)location.replace(${JSON.stringify(base)}+l+"/")}catch(e){}`
      : "";

  return `<!doctype html>
<!-- Generated from src/page.js and src/i18n/${lang}.json. Edit those, not this. -->
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(t.meta.title)}</title>
  <meta name="description" content="${esc(t.meta.description)}">
  <meta name="theme-color" content="${COLORS.sea}">
  <link rel="canonical" href="${url}">
${LANGS.map((l) => `  <link rel="alternate" hreflang="${l.code}" href="${site + l.path}">`).join("\n")}
  <link rel="alternate" hreflang="x-default" href="${site}/">
  <meta property="og:title" content="${esc(t.meta.ogTitle)}">
  <meta property="og:description" content="${esc(t.meta.ogDescription)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${L.og}">
${LANGS.filter((l) => l.code !== lang).map((l) => `  <meta property="og:locale:alternate" content="${l.og}">`).join("\n")}
  <meta property="og:image" content="${site}/og-${lang}.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(t.meta.ogAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${base}apple-touch-icon.png">
  <script>document.documentElement.classList.add("js");${remember}</script>
  <link rel="stylesheet" href="/src/styles.css">
  <script type="module" src="/src/app.js"></script>
  <script type="application/ld+json">
${jsonLd(t, lang, site)}
  </script>
  <script type="application/json" id="i18n">${JSON.stringify(runtime).replace(/</g, "\\u003c")}</script>
</head>
<body>
  <a class="skip" href="#main">${esc(t.nav.skip)}</a>

  <header class="hero" id="top">
    <div class="bar wrap">
      <a class="brand" href="${home}">${markSVG({ attrs: 'class="brand-mark" aria-hidden="true"' })}<span>Juggling Cyprus</span></a>
      <nav class="bar-nav" aria-label="Juggling Cyprus">
        <a href="#good">${esc(t.nav.good)}</a>
        <a href="#find">${esc(t.nav.find)}</a>
      </nav>
      ${switcher(lang, t, "switcher-top", base)}
    </div>

    <div class="hero-grid wrap">
      <div class="hero-copy">
        <p class="kicker">${esc(t.hero.kicker)}</p>
        <h1 class="when">
          <span class="sr">Juggling Cyprus: </span>
          <span class="day">${esc(t.hero.day)}</span>
          <span class="time-row"><span class="time">${esc(t.hero.time)}</span><span class="late">${esc(t.hero.late)}</span></span>
        </h1>
        <p class="countdown" data-countdown aria-live="polite"><span class="dot" aria-hidden="true"></span><span data-countdown-text>${esc(t.countdown.fallback)}</span></p>
        <div class="hero-actions">
          <a class="btn btn-gold btn-new" href="#new">${esc(t.hero.new)} ${ARROW_RIGHT}</a>
          <a class="btn btn-line" href="#find">${esc(t.hero.cta)} ${ARROW_DOWN}</a>
          <a class="btn btn-line" href="${INSTAGRAM}">${IG_ICON} ${esc(t.hero.instagram)}</a>
        </div>
      </div>

      <div class="stage">
        <div class="badge" data-badge>
          ${badgeSVG({ attrs: 'class="badge-svg" aria-hidden="true"', pinPulse: true })}
        </div>
        <p class="hint" aria-hidden="true">${esc(t.hero.hint)}
          <svg viewBox="0 0 60 40" width="46" height="31"><path d="M4 6c18-4 36 4 44 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M40 27l8 4 2-9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </p>
        <button class="motion-toggle js-only" type="button" data-motion aria-label="${esc(t.hero.pause)}">
          <svg class="i-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
          <svg class="i-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>
        </button>
      </div>
    </div>
  </header>

  <main id="main">
    <section class="newbie" id="new" aria-labelledby="new-title">
      <div class="wrap">
        <h2 id="new-title" class="section-title reveal">${esc(t.newbie.title)}</h2>
        <p class="newbie-intro reveal">${esc(t.newbie.intro)}</p>
        <ol class="newbie-steps">
${t.newbie.steps
  .map(
    (step, i) => `          <li class="newbie-step reveal" style="--i:${i};--c:${BALL_COLORS[i]}">
            <span class="newbie-ball" aria-hidden="true">${i + 1}</span>
            <h3>${esc(step.title)}</h3>
            <p>${esc(step.body)}</p>
          </li>`
  )
  .join("\n")}
        </ol>
        <div class="newbie-end reveal">
          <a class="btn btn-gold" href="#find">${esc(t.newbie.cta)} ${ARROW_DOWN}</a>
          <p>${esc(t.newbie.note).replace("{instagram}", `<a href="${INSTAGRAM}">${esc(t.newbie.noteLink)}</a>`)}</p>
        </div>
      </div>
    </section>

    <section class="welcome" aria-labelledby="welcome-title">
      <svg class="welcome-arc" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><path d="M-40 380C260 -40 900 -60 1240 330"/></svg>
      <div class="wrap welcome-grid">
        <h2 id="welcome-title" class="welcome-title reveal">${esc(t.welcome.title)}</h2>
        <div class="welcome-copy reveal">
          <p class="lead">${esc(t.welcome.p1)}</p>
          <p>${esc(t.welcome.p2)}</p>
        </div>
      </div>
      <div class="wrap one-island reveal">
        <ul class="one-island-lines">
          <li lang="en"><span class="ball-dot" style="--c:${BALL_COLORS[0]}"></span>One island, many hands.</li>
          <li lang="el"><span class="ball-dot" style="--c:${BALL_COLORS[1]}"></span>Ένα νησί, πολλά χέρια.</li>
          <li lang="tr"><span class="ball-dot" style="--c:${BALL_COLORS[2]}"></span>Bir ada, birçok el.</li>
        </ul>
        <div class="one-island-copy">
          <p>${esc(t.welcome.island)}</p>
          <p class="kopiaste"><span lang="el">Kopiaste · Κοπιάστε</span> · <span lang="tr">Buyurun</span></p>
        </div>
      </div>
    </section>

    <section class="good" id="good" aria-labelledby="good-title">
      <div class="wrap">
        <h2 id="good-title" class="section-title reveal">${esc(t.good.title)}</h2>
        <ul class="cards">
${t.good.items
  .map(
    (item, i) => `          <li class="card reveal" style="--i:${i}">
            <span class="card-icon">${icon(item.icon)}</span>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.body).replace("{instagram}", igLink)}</p>
          </li>`
  )
  .join("\n")}
        </ul>
      </div>
    </section>

    <section class="find" id="find" aria-labelledby="find-title">
      <div class="wrap find-grid">
        <div class="find-copy">
          <h2 id="find-title" class="section-title reveal">${esc(t.find.title)}</h2>
          <p class="place">${esc(t.find.place)}</p>
          <p class="area">${esc(t.find.area)}</p>
          <ol class="steps">
${t.find.steps.map((s) => `            <li>${esc(s)}</li>`).join("\n")}
          </ol>
          <div class="directions">
            <a class="btn btn-gold btn-big" href="${esc(DIRECTIONS.comaps)}">${PIN_ICON} ${esc(t.find.comaps)}</a>
            <div class="directions-alt">
              <a class="btn btn-line btn-small" href="${esc(DIRECTIONS.google)}">${esc(t.find.google)} ${ARROW_OUT}</a>
              <a class="btn btn-line btn-small" href="${esc(DIRECTIONS.apple)}">${esc(t.find.apple)} ${ARROW_OUT}</a>
            </div>
          </div>
          <p class="coords">
            <span class="coords-label">${esc(t.find.coords)}</span>
            <code>${coords}</code>
            <button class="copy js-only" type="button" data-copy="${coords}">${esc(t.find.copy)}</button>
          </p>
        </div>
        <figure class="map-card reveal">
          ${mapSVG(map, t)}
          <figcaption>${esc(t.find.attribution).replace("OpenStreetMap", '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')}</figcaption>
        </figure>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap footer-grid">
      ${markSVG({ attrs: 'class="footer-logo" aria-hidden="true"' })}
      <div class="footer-ig">
        <h2>${esc(t.footer.igTitle)}</h2>
        <a class="btn btn-gold" href="${INSTAGRAM}" rel="me">${IG_ICON} ${esc(t.footer.igCta)}</a>
        <p class="mail">${esc(t.footer.email)}: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
      </div>
      <div class="start">
        <h3>${esc(t.footer.startTitle)}</h3>
        <p>${esc(t.footer.start)}</p>
        <a href="mailto:${EMAIL}?subject=${encodeURIComponent("New meetup")}">${EMAIL}</a>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p class="footer-sign">Juggling Cyprus · ${esc(t.footer.tagline)}</p>
      <div class="footer-lang">
        ${switcher(lang, t, "switcher-bottom", base)}
        ${feedback}
      </div>
    </div>
  </footer>
</body>
</html>
`;
}
