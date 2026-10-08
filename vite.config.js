import { defineConfig } from "vite";
import { writePages, PAGES } from "./scripts/pages.mjs";

const pages = {
  name: "pages",
  async config() {
    await writePages();
  },
  configureServer(server) {
    server.watcher.on("change", async (file) => {
      if (/src[\\/](page\.js|i18n[\\/]|map-data\.json)/.test(file)) {
        await writePages();
        server.ws.send({ type: "full-reload" });
      }
    });
  },
};

export default defineConfig({
  plugins: [pages],
  build: {
    rollupOptions: { input: Object.values(PAGES) },
  },
});
