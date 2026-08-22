import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Font buffers for `next/og`. Vendored by `npm run fonts:fetch` because satori
 * needs real TTF bytes from disk — it cannot read woff2, and the files
 * `next/font` produces live under hashed names inside `.next`.
 *
 * Read at build time: every image route here is statically generated.
 *
 * These are STATIC instances. satori cannot parse the upstream variable
 * builds of Libre Franklin and Noto Serif Gurmukhi — it throws
 * `Cannot read properties of undefined (reading '256')` — so
 * `scripts/fetch-og-fonts.ts` pins each to a single weight before writing it.
 */
const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

async function load(file: string): Promise<ArrayBuffer> {
  const buffer = await readFile(path.join(FONT_DIR, file));
  return Uint8Array.from(buffer).buffer;
}

export async function caslonDisplayFont(): Promise<ArrayBuffer> {
  return load("LibreCaslonDisplay-Regular.ttf");
}

export async function franklinFont(): Promise<ArrayBuffer> {
  return load("LibreFranklin-Regular.ttf");
}

export async function gurmukhiFont(): Promise<ArrayBuffer> {
  return load("NotoSerifGurmukhi-SemiBold.ttf");
}

/** The palette, duplicated here because satori cannot resolve CSS variables. */
export const OG_COLORS = {
  paper: "#f7f3ea",
  ink: "#1a1712",
  oxblood: "#8b1e1e",
  muted: "#5c554a",
} as const;
