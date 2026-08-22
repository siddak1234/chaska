/**
 * Build guard: refuses to produce a production build while the site still
 * carries design-placeholder contact details.
 *
 * The artboards ship a fake phone number — `(214) 000 0000` — unverified
 * `@chaskadallas.com` mailboxes, and no street address. Those values are real
 * enough to look finished and wrong enough to lose a booking, so they are
 * flagged in `src/content/site.data.json` and this script fails the build
 * while any flag is still `true`.
 *
 * Runs as `prebuild`. Only blocks when NEXT_PUBLIC_SITE_ENV=production, so
 * local development and preview deploys are unaffected.
 *
 * Reads JSON directly rather than importing the content module — no bundler,
 * no module resolution, nothing to break.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DATA = path.join(ROOT, "src", "content", "site.data.json");

type Flagged = { placeholder?: boolean } & Record<string, unknown>;

type SiteData = {
  url?: Flagged;
  contact?: {
    phone?: Flagged;
    email?: Flagged;
    address?: Flagged;
  };
};

const CHECKS: Array<{
  path: string;
  read: (data: SiteData) => Flagged | undefined;
  needs: string;
}> = [
  {
    path: "url",
    read: (d) => d.url,
    needs: "the production domain",
  },
  {
    path: "contact.phone",
    read: (d) => d.contact?.phone,
    needs: "a real, dialable phone number",
  },
  {
    path: "contact.email",
    read: (d) => d.contact?.email,
    needs: "confirmed hello@ and catering@ mailboxes",
  },
  {
    path: "contact.address",
    read: (d) => d.contact?.address,
    needs: "the street address and postal code",
  },
];

async function main(): Promise<void> {
  const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

  const data = JSON.parse(await readFile(SITE_DATA, "utf8")) as SiteData;

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
        "  Fine for development. `NEXT_PUBLIC_SITE_ENV=production npm run build`",
        "  will refuse to build until each is replaced and its",
        '  "placeholder" flag is set to false.',
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

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
