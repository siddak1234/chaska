/**
 * Vendors the artboards' Wikimedia Commons photographs into the repo.
 *
 *   npm run images:fetch
 *
 * Why vendor rather than hotlink: the artboards point at
 * `commons.wikimedia.org/wiki/Special:FilePath/…`, which 302s to
 * upload.wikimedia.org. Sending that through the Next image optimiser makes
 * every page render depend on a third-party redirect. Downloading once means
 * `npm ci && npm run build` touches no network, static imports give us
 * intrinsic dimensions and blur placeholders, and swapping in the restaurant's
 * own photography later is a file replacement.
 *
 * Licensing: every one of these files is CC BY or CC BY-SA with
 * `AttributionRequired: true`. This script pulls author, licence name and
 * licence URL from the Commons API into `src/content/generated/images.ts`,
 * which `/credits` renders, and into an ATTRIBUTION.md written beside the
 * image files themselves — the repository is public, so the credit has to
 * travel with the bytes, not only with the deployed site.
 *
 * It only ever SCALES the original — never crops, re-tones or composites — so
 * no ShareAlike obligation on an adapted work is triggered. The visual crop is
 * CSS `object-fit`; the newsprint tone is the CSS `newsprint` utility.
 *
 * Run with plain `node scripts/fetch-images.ts` (Node >= 22.6 strips types).
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = path.join(ROOT, "src", "assets", "images");
const MANIFEST = path.join(ROOT, "src", "content", "generated", "images.ts");
const ATTRIBUTION = path.join(IMAGE_DIR, "ATTRIBUTION.md");

/** Longest edge of the stored file. The largest layout slot is ~800px CSS. */
const MAX_EDGE = 2000;
const JPEG_QUALITY = 82;

const USER_AGENT =
  "chaska-restaurant-site/0.1 (https://github.com/; build-time asset vendoring)";

/** One entry per distinct Commons file. */
type SourceFile = {
  slug: string;
  commonsTitle: string;
};

/** One entry per `<image-slot>` in the artboards. Several share a source file. */
type Slot = {
  id: string;
  slug: string;
  alt: string;
};

const SOURCE_FILES: SourceFile[] = [
  { slug: "naan-tandoor", commonsTitle: "Naan baked in Tandoor.jpg" },
  { slug: "dal-makhani", commonsTitle: "Dal Makhni.JPG" },
  { slug: "tandoori-murgh", commonsTitle: "Tandoori chicken Indian.jpg" },
  {
    slug: "sarson-da-saag",
    commonsTitle: "Makka di roti sarso ka saag with makkhan.jpg",
  },
  {
    slug: "table-spread",
    commonsTitle: "Urad daal with assorted indian bread and salad.jpg",
  },
  { slug: "snoopy-shih-tzu", commonsTitle: "Shih Tzu portrait show dog.jpg" },
];

/** `alt` text is taken verbatim from each slot's `aria-label` on the artboard. */
const SLOTS: Slot[] = [
  { id: "home-hero", slug: "naan-tandoor", alt: "Naan baking in the clay tandoor" },
  { id: "home-dal", slug: "dal-makhani", alt: "Dal makhani" },
  { id: "home-tandoori", slug: "tandoori-murgh", alt: "Tandoori murgh" },
  {
    id: "home-saag",
    slug: "sarson-da-saag",
    alt: "Sarson da saag with makki di roti",
  },
  {
    id: "home-table",
    slug: "table-spread",
    alt: "Dishes and breads shared at the table",
  },
  { id: "menu-tandoori", slug: "tandoori-murgh", alt: "Tandoori murgh" },
  {
    id: "menu-saag",
    slug: "sarson-da-saag",
    alt: "Sarson da saag with makki di roti",
  },
  { id: "menu-table", slug: "table-spread", alt: "Dal and breads on the table" },
  { id: "about-snoopy", slug: "snoopy-shih-tzu", alt: "Snoopy the shih tzu" },
];

type Credit = {
  author: string;
  licenseName: string;
  licenseUrl: string;
  sourceUrl: string;
  fileName: string;
};

type CommonsPage = {
  title?: string;
  missing?: string;
  imageinfo?: Array<{
    url: string;
    descriptionurl: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function meta(
  extmetadata: Record<string, { value?: string }> | undefined,
  key: string,
): string {
  return stripHtml(extmetadata?.[key]?.value ?? "");
}

/** Commons reports a short name ("CC BY-SA 4.0"); map it to its deed URL. */
function licenseUrlFor(shortName: string, fallback: string): string {
  const match = /^CC ([A-Z-]+) ([\d.]+)$/.exec(shortName);
  if (!match) return fallback;
  const [, clauses, version] = match;
  if (!clauses || !version) return fallback;
  return `https://creativecommons.org/licenses/${clauses.toLowerCase()}/${version}/`;
}

async function fetchCommonsMetadata(): Promise<Map<string, Credit & { url: string }>> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "1",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    titles: SOURCE_FILES.map((f) => `File:${f.commonsTitle}`).join("|"),
  });

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "user-agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Commons API returned ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    query?: { pages?: Record<string, CommonsPage> };
  };
  const pages = Object.values(payload.query?.pages ?? {});

  const byTitle = new Map<string, Credit & { url: string }>();
  for (const page of pages) {
    const title = page.title?.replace(/^File:/, "");
    if (!title) continue;
    const info = page.imageinfo?.[0];
    if (page.missing !== undefined || !info) {
      throw new Error(`Commons has no file named "${title}"`);
    }

    const licenseName = meta(info.extmetadata, "LicenseShortName");
    const author = meta(info.extmetadata, "Artist");
    if (!licenseName || !author) {
      throw new Error(
        `"${title}" is missing licence or author metadata — it cannot be published without attribution.`,
      );
    }

    byTitle.set(title, {
      author,
      licenseName,
      licenseUrl: licenseUrlFor(licenseName, meta(info.extmetadata, "LicenseUrl")),
      sourceUrl: info.descriptionurl,
      fileName: title,
      // Strip the API's analytics params so we fetch the plain file.
      url: info.url.split("?")[0] ?? info.url,
    });
  }

  return byTitle;
}

async function downloadAndScale(
  url: string,
  destination: string,
): Promise<{ width: number; height: number; bytes: number; sha256: string }> {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }
  const original = Buffer.from(await response.arrayBuffer());

  const scaled = await sharp(original)
    // Bake in EXIF orientation before metadata is dropped, or portraits flip.
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
    .toBuffer({ resolveWithObject: true });

  await writeFile(destination, scaled.data);

  return {
    width: scaled.info.width,
    height: scaled.info.height,
    bytes: scaled.data.byteLength,
    sha256: createHash("sha256").update(original).digest("hex").slice(0, 16),
  };
}

function renderManifest(
  credits: Map<string, Credit>,
  dimensions: Map<string, { width: number; height: number }>,
): string {
  const imports = SOURCE_FILES.map(
    (file) =>
      `import ${toIdentifier(file.slug)} from "@/assets/images/${file.slug}.jpg";`,
  ).join("\n");

  const entries = SLOTS.map((slot) => {
    const source = SOURCE_FILES.find((f) => f.slug === slot.slug);
    if (!source) throw new Error(`Slot "${slot.id}" references unknown slug`);
    const credit = credits.get(source.commonsTitle);
    if (!credit) throw new Error(`No credit resolved for "${source.commonsTitle}"`);
    const size = dimensions.get(slot.slug);
    if (!size) throw new Error(`No dimensions resolved for "${slot.slug}"`);

    return [
      `  "${slot.id}": {`,
      `    image: ${toIdentifier(slot.slug)},`,
      `    alt: ${JSON.stringify(slot.alt)},`,
      `    credit: {`,
      `      author: ${JSON.stringify(credit.author)},`,
      `      licenseName: ${JSON.stringify(credit.licenseName)},`,
      `      licenseUrl: ${JSON.stringify(credit.licenseUrl)},`,
      `      sourceUrl: ${JSON.stringify(credit.sourceUrl)},`,
      `      fileName: ${JSON.stringify(credit.fileName)},`,
      `    },`,
      `  },`,
    ].join("\n");
  }).join("\n");

  return `// GENERATED by scripts/fetch-images.ts — do not edit by hand.
// Re-run \`npm run images:fetch\` to refresh.
//
// Every photograph below is CC BY or CC BY-SA and REQUIRES visible attribution.
// \`/credits\` renders these entries; do not remove that route.

import type { StaticImageData } from "next/image";

import type { ImageCredit } from "@/content/schema";

${imports}

export type SlotImage = {
  image: StaticImageData;
  alt: string;
  credit: ImageCredit;
};

export const images = {
${entries}
} as const satisfies Record<string, SlotImage>;

export type ImageId = keyof typeof images;

export function getImage(id: ImageId): SlotImage {
  return images[id];
}

/** One entry per distinct photograph, for the credits page. */
export function getUniqueCredits(): ImageCredit[] {
  const seen = new Set<string>();
  const unique: ImageCredit[] = [];
  for (const slot of Object.values(images)) {
    if (seen.has(slot.credit.fileName)) continue;
    seen.add(slot.credit.fileName);
    unique.push(slot.credit);
  }
  return unique;
}
`;
}

/**
 * Human-readable credit beside the files. `/credits` covers anyone visiting the
 * site; this covers anyone cloning the repository or copying an image out of it.
 */
function renderAttribution(
  credits: Map<string, Credit>,
  slugByTitle: Map<string, string>,
): string {
  const rows = [...credits.entries()].map(([title, credit]) => {
    const slug = slugByTitle.get(title) ?? "";
    return [
      `## ${slug}.jpg`,
      "",
      `- **Photographer:** ${credit.author}`,
      `- **Licence:** [${credit.licenseName}](${credit.licenseUrl})`,
      `- **Source:** [${credit.fileName}](${credit.sourceUrl})`,
      "",
    ].join("\n");
  });

  return [
    "# Photograph attribution",
    "",
    "GENERATED by `scripts/fetch-images.ts` — do not edit by hand.",
    "",
    "Every image in this directory is used under a Creative Commons licence that",
    "**requires attribution**. If you copy one of these files, the credit below",
    "must go with it. Files here are scaled-down copies of the originals; they are",
    "not cropped, re-toned or otherwise adapted, so each remains the",
    "photographer's own work under its stated licence.",
    "",
    "The site renders the same credits at `/credits`.",
    "",
    ...rows,
  ].join("\n");
}

function toIdentifier(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

async function main(): Promise<void> {
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });

  console.log(`Resolving ${SOURCE_FILES.length} files on Wikimedia Commons…`);
  const metadata = await fetchCommonsMetadata();

  const credits = new Map<string, Credit>();
  const dimensions = new Map<string, { width: number; height: number }>();

  for (const file of SOURCE_FILES) {
    const entry = metadata.get(file.commonsTitle);
    if (!entry) throw new Error(`Commons returned nothing for "${file.commonsTitle}"`);

    const destination = path.join(IMAGE_DIR, `${file.slug}.jpg`);
    const result = await downloadAndScale(entry.url, destination);

    credits.set(file.commonsTitle, {
      author: entry.author,
      licenseName: entry.licenseName,
      licenseUrl: entry.licenseUrl,
      sourceUrl: entry.sourceUrl,
      fileName: entry.fileName,
    });
    dimensions.set(file.slug, { width: result.width, height: result.height });

    console.log(
      `  ${file.slug}.jpg  ${result.width}×${result.height}  ` +
        `${(result.bytes / 1024).toFixed(0)} KB  ${entry.licenseName} — ${entry.author}`,
    );
  }

  const slugByTitle = new Map(SOURCE_FILES.map((f) => [f.commonsTitle, f.slug]));
  await writeFile(ATTRIBUTION, renderAttribution(credits, slugByTitle), "utf8");
  console.log(`\nWrote ${path.relative(ROOT, ATTRIBUTION)}`);

  const source = renderManifest(credits, dimensions);
  const previous = await readFile(MANIFEST, "utf8").catch(() => null);
  if (previous === source) {
    console.log("\nManifest unchanged.");
  } else {
    await writeFile(MANIFEST, source, "utf8");
    console.log(`\nWrote ${path.relative(ROOT, MANIFEST)}`);
  }

  console.log(
    `${SLOTS.length} slots across ${SOURCE_FILES.length} photographs. ` +
      `All require attribution — /credits must stay published.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
