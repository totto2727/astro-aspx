import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { copyFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { relative } from "node:path";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [
    mdx(),
    sitemap(),
    import.meta.env.DEV
      ? undefined
      : {
          name: "html-to-aspx",
          hooks: {
            "astro:build:done": async (ctx) => {
              const dir = fileURLToPath(ctx.dir);

              await Promise.all(
                ctx.routes.map(async (route) => {
                  if (route.type !== "page" || !route.distURL) return;

                  const target = fileURLToPath(route.distURL);
                  const dest = target.toString().replace(".html", ".aspx");

                  const targetForLog = relative(dir, target);
                  const destForLog = relative(dir, dest);

                  await copyFile(target, dest);
                  await rm(target);
                  ctx.logger.info(`move: "${targetForLog}" -> "${destForLog}"`);
                })
              );
            },
          },
        },
  ],
});
