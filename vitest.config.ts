import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
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
    load(id) {
      const [file] = id.split("?");
      if (!file || !IMAGE.test(file)) return null;
      const src = `/_next/static/media/${path.basename(file)}`;
      return `export default ${JSON.stringify({
        src,
        width: 1600,
        height: 1067,
        blurDataURL: `data:image/png;base64,`,
        blurWidth: 8,
        blurHeight: 5,
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
