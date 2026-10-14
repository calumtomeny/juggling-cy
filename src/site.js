// Facts about the meetup, shared by the page, the build scripts and the browser.
export const PIN = { lat: 34.89736, lon: 33.63717 };
export const TZ = "Asia/Nicosia";
export const START_HOUR = 19;
// "Till late" has no end, but calendar entries need one.
export const END_HOUR = 22;

// The first Tuesday on or after a date, as a Cyprus calendar day (YYYYMMDD).
// The "Add to calendar" links start their weekly series here.
export function firstTuesday(date = new Date()) {
  const p = {};
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date);
  for (const { type, value } of parts) p[type] = value;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  const day = new Date(Date.UTC(+p.year, +p.month - 1, +p.day + ((2 - weekday + 7) % 7)));
  return day.toISOString().slice(0, 10).replace(/-/g, "");
}

// Where the site is served. The deploy workflow passes the GitHub Pages URL
// in SITE_URL (e.g. https://calumtomeny.github.io/juggling-cy, which lives
// under a sub-path); otherwise it is the real domain, at the root.
export function deployment(env = {}) {
  const url = (env.SITE_URL || "https://juggling.cy").replace(/\/$/, "");
  return { url, base: new URL(url + "/").pathname };
}
export const EMAIL = "hello@juggling.cy";
export const INSTAGRAM = "https://www.instagram.com/jugglingcyprus/";

export const LANGS = [
  { code: "en", label: "EN", path: "/", locale: "en-GB", og: "en_GB" },
  { code: "el", label: "ΕΛ", path: "/el/", locale: "el-GR", og: "el_GR" },
  { code: "tr", label: "TR", path: "/tr/", locale: "tr-TR", og: "tr_TR" },
];

// CoMaps (and Organic Maps) short links pack zoom, latitude and longitude into
// ten base64 characters; this is the format the comaps.at web page understands
// when the app isn't installed.
function ge0(lat, lon, zoom, name) {
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const max = 2 ** 30 - 1;
  const latI = Math.round(((lat + 90) / 180) * max);
  const lonI = Math.round(((lon + 180) / 360) * (max + 1)) % (max + 1);
  let code = ABC[Math.round((zoom - 4) * 4)];
  for (let shift = 27; shift >= 3; shift -= 3) {
    const a = (latI >> shift) & 7, o = (lonI >> shift) & 7;
    code += ABC[((a >> 2) & 1) << 5 | ((o >> 2) & 1) << 4 | ((a >> 1) & 1) << 3 | ((o >> 1) & 1) << 2 | (a & 1) << 1 | (o & 1)];
  }
  return `https://comaps.at/${code}/${encodeURIComponent(name.replace(/ /g, "_"))}`;
}

const ll = `${PIN.lat},${PIN.lon}`;
export const DIRECTIONS = {
  comaps: ge0(PIN.lat, PIN.lon, 17, "Juggling Cyprus"),
  google: `https://www.google.com/maps/search/?api=1&query=${ll}`,
  apple: `https://maps.apple.com/?ll=${ll}&q=${encodeURIComponent("Juggling Cyprus")}`,
};

// The weekly session for calendars, in the words of one language. `t` is that
// language's translation file and `url` its page.
export const RRULE = "FREQ=WEEKLY;BYDAY=TU";
export const icsFile = (lang) => (lang === "en" ? "juggling-cyprus.ics" : `juggling-cyprus-${lang}.ics`);
export function calendarEvent(t, url, date = new Date()) {
  const day = firstTuesday(date);
  const at = (hour) => `${day}T${String(hour).padStart(2, "0")}0000`;
  return {
    title: "Juggling Cyprus",
    start: at(START_HOUR),
    end: at(END_HOUR),
    location: `${t.find.place}, ${t.find.map.road}`,
    details: `${t.meta.description}\n\n${url}`,
    url,
  };
}
