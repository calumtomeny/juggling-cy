// Plain-text versions of the site for AI agents and other machine readers:
// each language's page as Markdown (served when a request asks for
// `Accept: text/markdown`), and /llms.txt, an index of them.
import { LANGS, DIRECTIONS, EMAIL, INSTAGRAM, PIN, TZ } from "./site.js";
import { upcoming } from "./events.js";

export const markdownFile = (lang) => (lang === "en" ? "index.md" : `${lang}/index.md`);

const link = (text, url) => `[${text}](${url})`;
// "Turn up at 7pm" → "Turn up at 7pm.", but "Rain?" stays as it is.
const stop = (s) => (/[.?!:]$/.test(s) ? s : s + ".");
const ENGLISH_NAMES = { en: "English", el: "Greek", tr: "Turkish" };

export function renderMarkdown(t, lang, site) {
  const L = LANGS.find((l) => l.code === lang);
  const ig = (text) => text.replace("{instagram}", link(t.good.instagram, INSTAGRAM));
  const date = (iso) =>
    new Intl.DateTimeFormat(L.locale, { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  const events = upcoming().map((e) => {
    const x = e[lang];
    const links = [link(t.events.more, e.url), e.flyer && link(t.events.flyer, e.flyer)].filter(Boolean).join(" · ");
    return `### ${x.title} (${e.by})\n\n**${date(e.start)}**, ${x.time}  \n${x.place}\n\n${x.body}\n\n${x.note} · ${links}`;
  });

  const out = [
    `---\ntitle: ${t.meta.title}\nlang: ${lang}\nurl: ${site + L.path}\n---`,
    `# Juggling Cyprus`,
    `> ${t.meta.description}`,
    `**${t.hero.day}, ${t.hero.time} ${t.hero.late}** · ${t.find.place}, ${t.find.area}`,
    `## ${t.newbie.title}`,
    t.newbie.intro,
    t.newbie.steps.map((s, i) => `${i + 1}. **${stop(s.title)}** ${s.body}`).join("\n"),
    t.newbie.note.replace("{instagram}", link(t.newbie.noteLink, INSTAGRAM)),
    `## ${t.welcome.title}`,
    t.welcome.p1,
    t.welcome.p2,
    t.welcome.island,
  ];
  if (events.length) out.push(`## ${t.events.title}`, t.events.intro.replace("{tell}", link(t.events.tell, `mailto:${EMAIL}`)), ...events);
  out.push(
    `## ${t.good.title}`,
    t.good.items.map((item) => `- **${stop(item.title)}** ${ig(item.body)}`).join("\n"),
    `## ${t.find.title}`,
    `**${t.find.place}**, ${t.find.area}`,
    t.find.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    `${t.find.coords}: ${PIN.lat}, ${PIN.lon}  \n${link(t.find.comaps, DIRECTIONS.comaps)} · ${link(t.find.google, DIRECTIONS.google)} · ${link(t.find.apple, DIRECTIONS.apple)}`,
    `## ${t.footer.igTitle}`,
    `${link(t.footer.igCta, INSTAGRAM)} · ${t.footer.email}: ${link(EMAIL, `mailto:${EMAIL}`)}`,
    `**${t.footer.startTitle}** ${t.footer.start}`,
    LANGS.filter((l) => l.code !== lang).map((l) => link(l.name, site + l.path)).join(" · ")
  );
  return out.join("\n\n") + "\n";
}

// https://llmstxt.org: a short summary, then links to the Markdown pages.
export function renderLlmsTxt(t, site) {
  return `# Juggling Cyprus

> ${t.meta.description}

Juggling Cyprus is a free, drop-in meetup for jugglers of every level, from first throws to old hands. It is open to everyone on the island, north or south. Nothing to book or pay; equipment can be borrowed on the night.

- When: every Tuesday from 7pm till late (Cyprus time). If the weather looks doubtful, check Instagram before heading out.
- Where: ${t.find.place}, next to the dog park behind the Tasos Mitsopoulos car park in Mackenzie, Larnaca (${PIN.lat}, ${PIN.lon}).
- Contact: ${link("@jugglingcyprus on Instagram", INSTAGRAM)} or ${EMAIL}.

## Pages

${LANGS.map((l) => `- ${link(`${ENGLISH_NAMES[l.code]} page`, `${site}/${markdownFile(l.code)}`)}: the whole site in ${ENGLISH_NAMES[l.code]}, as Markdown`).join("\n")}

## Optional

- ${link("Weekly calendar (iCalendar)", `${site}/juggling-cyprus.ics`)}: the Tuesday sessions, to add to a calendar
- ${link("Sitemap", `${site}/sitemap.xml`)}
`;
}
