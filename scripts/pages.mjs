// Writes index.html, el/index.html and tr/index.html from src/page.js and the
// translation files. Vite then treats them as the site's three entry pages.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
export const PAGES = { en: "index.html", el: "el/index.html", tr: "tr/index.html" };

export async function writePages() {
  // Bust the module cache so edits to page.js show up in dev without a restart.
  const page = new URL(`src/page.js?t=${Date.now()}`, root).href;
  const { renderPage } = await import(page);
  const map = JSON.parse(await readFile(new URL("src/map-data.json", root), "utf8"));
  for (const [lang, file] of Object.entries(PAGES)) {
    const t = JSON.parse(await readFile(new URL(`src/i18n/${lang}.json`, root), "utf8"));
    const out = new URL(file, root);
    await mkdir(new URL(".", out), { recursive: true });
    await writeFile(out, renderPage(t, lang, map));
  }
}
