import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import sharp from "sharp";
import { defineConfig, type Plugin } from "vitest/config";

/**
 * Next resolves a static image import to a `StaticImageData` object; Vite
 * resolves it to a URL string. Without this, any module that imports an image
 * (notably `src/content/generated/images.ts`) is untestable.
 */
function nextStaticImages(): Plugin {
  const IMAGE = /\.(jpe?g|png|gif|webp|avif)$/i;
  return {
    name: "chaska:next-static-images",
    enforce: "pre",
    async load(id) {
      const [file] = id.split("?");
      if (!file || !IMAGE.test(file)) return null;

      // Real dimensions, not placeholders. Hardcoding them here made any test
      // that asserted an aspect ratio a test of this mock rather than of the
      // actual asset.
      const { width = 0, height = 0 } = await sharp(file).metadata();
      const src = `/_next/static/media/${path.basename(file)}`;

      return `export default ${JSON.stringify({
        src,
        width,
        height,
        blurDataURL: "data:image/png;base64,",
        blurWidth: 8,
        blurHeight: Math.max(1, Math.round((8 * height) / (width || 1))),
      })};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), nextStaticImages()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
  },
});
