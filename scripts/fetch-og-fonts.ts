/**
 * Vendors the font files needed to render the social card and the site icon.
 *
 *   npm run fonts:fetch
 *
 * `next/font` self-hosts the fonts the *pages* use, but those files live inside
 * `.next` under hashed names. `next/og` (satori) needs real font buffers it can
 * read from disk, so the two faces that appear on generated images are
 * committed here instead.
 *
 * Both are SIL Open Font License 1.1, which permits redistribution. The licence
 * text is fetched alongside them — OFL requires it to travel with the fonts.
 *
 * satori cannot read woff2, so these are TTFs from the upstream google/fonts
 * repository rather than the Google Fonts CSS API.
 *
 * It also cannot parse a VARIABLE TTF — it throws
 * `Cannot read properties of undefined (reading '256')` at build time — and
 * neither Libre Franklin nor Noto Serif Gurmukhi publishes static instances
 * upstream. So the two variable files are pinned to one weight here with
 * fontTools before being written, and the variable originals are discarded.
 * That needs Python with `fonttools` on PATH; only re-running this script does,
 * never `npm ci && npm run build`, since the results are committed.
 */

import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR = path.join(ROOT, "src", "assets", "fonts");
const BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl";

type FontFile = {
  url: string;
  name: string;
  /** Present when the upstream file is variable and must be pinned. */
  instance?: { weight: number; as: string };
};

const FILES: FontFile[] = [
  {
    url: `${BASE}/librecaslondisplay/LibreCaslonDisplay-Regular.ttf`,
    name: "LibreCaslonDisplay-Regular.ttf",
  },
  {
    url: `${BASE}/librefranklin/LibreFranklin%5Bwght%5D.ttf`,
    name: "LibreFranklin-Variable.ttf",
    instance: { weight: 400, as: "LibreFranklin-Regular.ttf" },
  },
  {
    url: `${BASE}/notoserifgurmukhi/NotoSerifGurmukhi%5Bwght%5D.ttf`,
    name: "NotoSerifGurmukhi-Variable.ttf",
    instance: { weight: 600, as: "NotoSerifGurmukhi-SemiBold.ttf" },
  },
  { url: `${BASE}/librecaslondisplay/OFL.txt`, name: "OFL.txt" },
];

/** Pins a variable font to one weight, then removes the variable original. */
async function instantiate(file: FontFile): Promise<void> {
  const { weight, as } = file.instance!;
  const script = [
    "from fontTools import ttLib",
    "from fontTools.varLib import instancer",
    "import sys",
    "f = ttLib.TTFont(sys.argv[1])",
    "instancer.instantiateVariableFont(f, {'wght': float(sys.argv[3])},",
    "                                  inplace=True, updateFontNames=True)",
    "f.save(sys.argv[2])",
  ].join("\n");

  try {
    await run("python3", [
      "-c",
      script,
      path.join(FONT_DIR, file.name),
      path.join(FONT_DIR, as),
      String(weight),
    ]);
  } catch (error) {
    throw new Error(
      `Could not pin ${file.name} to weight ${weight}.\n` +
        "This step needs Python with fonttools: pip3 install fonttools\n" +
        "Without it satori cannot parse the font and `next build` fails on the\n" +
        "icon and opengraph-image routes.\n" +
        (error instanceof Error ? error.message : String(error)),
    );
  }

  await rm(path.join(FONT_DIR, file.name));
}

async function main(): Promise<void> {
  await mkdir(FONT_DIR, { recursive: true });

  for (const file of FILES) {
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`${file.name}: ${response.status} ${response.statusText}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength < 1024) {
      throw new Error(`${file.name}: suspiciously small (${bytes.byteLength} bytes)`);
    }
    await writeFile(path.join(FONT_DIR, file.name), bytes);

    if (file.instance) {
      await instantiate(file);
      console.log(
        `  ${file.instance.as.padEnd(34)} pinned to weight ${file.instance.weight}`,
      );
    } else {
      console.log(
        `  ${file.name.padEnd(34)} ${(bytes.byteLength / 1024).toFixed(0)} KB`,
      );
    }
  }

  console.log("\nVendored to src/assets/fonts (SIL OFL 1.1). Commit the results.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
