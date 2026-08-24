/**
 * Build guard: refuses to produce a production build while the site still
 * carries design-placeholder values.
 *
 * The artboards shipped a fake phone number, unverified mailboxes and no street
 * address. Those are real enough to look finished and wrong enough to lose a
 * booking, so each is flagged in `src/content/site.data.json` and this script
 * fails the build while any flag is still `true`.
 *
 * Runs as `prebuild`. Only blocks when NEXT_PUBLIC_SITE_ENV=production, so
 * local development and preview deploys are unaffected.
 *
 * Plain JavaScript on purpose. This gates every single build, including on
 * hosts whose Node version we do not choose; `node file.ts` needs type
 * stripping, which is only on by default from Node 22.18, and fails outright
 * below that with ERR_UNKNOWN_FILE_EXTENSION. The two developer-run scripts in
 * this directory stay TypeScript — nothing depends on them at build time.
 *
 * Reads the JSON directly rather than importing the content module: no bundler,
 * no module resolution, nothing to break.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DATA = path.join(ROOT, "src", "content", "site.data.json");

/** @type {Array<{path: string, read: (d: any) => any, needs: string}>} */
const CHECKS = [
  { path: "url", read: (d) => d.url, needs: "the production domain" },
  {
    path: "contact.phone",
    read: (d) => d.contact?.phone,
    needs: "a real, dialable phone number",
  },
  {
    path: "contact.email",
    read: (d) => d.contact?.email,
    needs: "a confirmed mailbox",
  },
  {
    path: "contact.address",
    read: (d) => d.contact?.address,
    needs: "the street address and postal code",
  },
];

async function main() {
  const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";
  const data = JSON.parse(await readFile(SITE_DATA, "utf8"));

  const outstanding = CHECKS.filter((check) => check.read(data)?.placeholder === true);

  if (outstanding.length === 0) {
    console.log("✓ No placeholder content remaining.");
    return;
  }

  const lines = outstanding.map(
    (check) => `  • site.data.json → ${check.path}  (needs ${check.needs})`,
  );

  if (!isProduction) {
    console.warn(
      [
        `⚠ ${outstanding.length} placeholder field group(s) still in place:`,
        ...lines,
        "",
        "  Fine for development and for a *.vercel.app deploy.",
        "  `NEXT_PUBLIC_SITE_ENV=production npm run build` will refuse to build",
        '  until each is replaced and its "placeholder" flag is set to false.',
      ].join("\n"),
    );
    return;
  }

  console.error(
    [
      "",
      `✗ Refusing to build for production: ${outstanding.length} placeholder field group(s) remain.`,
      ...lines,
      "",
      "  Replace the values in src/content/site.data.json and set each",
      '  "placeholder" flag to false.',
      "",
    ].join("\n"),
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
