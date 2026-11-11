// Writes index.html, el/index.html and tr/index.html from src/page.js and the
// translation files. Vite then treats them as the site's three entry pages.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { deployment } from "../src/site.js";

const root = new URL("../", import.meta.url);
export const PAGES = { en: "index.html", el: "el/index.html", tr: "tr/index.html", notFound: "404.html" };

export async function writePages() {
  // Bust the module cache so edits to page.js show up in dev without a restart.
  const page = new URL(`src/page.js?t=${Date.now()}`, root).href;
  const { renderPage, renderNotFound } = await import(page);
  const map = JSON.parse(await readFile(new URL("src/map-data.json", root), "utf8"));
  const site = deployment(process.env);
  const all = {};
  for (const lang of ["en", "el", "tr"]) {
    const t = JSON.parse(await readFile(new URL(`src/i18n/${lang}.json`, root), "utf8"));
    all[lang] = t;
    const out = new URL(PAGES[lang], root);
    await mkdir(new URL(".", out), { recursive: true });
    await writeFile(out, renderPage(t, lang, map, site));
  }
  // GitHub Pages serves this for any address that doesn't exist.
  await writeFile(new URL(PAGES.notFound, root), renderNotFound(all, site));
}
