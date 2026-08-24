import type { z } from "zod";

import aboutData from "./about.data.json";
import cateringData from "./catering.data.json";
import homeData from "./home.data.json";
import menuData from "./menu.data.json";
import {
  aboutPageSchema,
  cateringSchema,
  homePageSchema,
  menuSchema,
  siteSchema,
  type AboutPage,
  type Catering,
  type HomePage,
  type Menu,
  type MenuItem,
  type Site,
} from "./schema";
import siteData from "./site.data.json";

/**
 * The only way the app reads content.
 *
 * Components never import a `*.data.json` file directly, so moving this layer
 * onto a CMS later means reimplementing these five functions and nothing else.
 * Parsing happens once, eagerly, at module load — a malformed file fails the
 * build with a path-precise error instead of blanking a page in production.
 */

function parse<T extends z.ZodType>(
  schema: T,
  data: unknown,
  file: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid content in src/content/${file}:\n${issues}`);
  }
  return result.data;
}

const site = parse(siteSchema, siteData, "site.data.json");
const menu = parse(menuSchema, menuData, "menu.data.json");
const catering = parse(cateringSchema, cateringData, "catering.data.json");
const homePage = parse(homePageSchema, homeData, "home.data.json");
const aboutPage = parse(aboutPageSchema, aboutData, "about.data.json");

export function getSite(): Site {
  return site;
}

export function getMenu(): Menu {
  return menu;
}

export function getCatering(): Catering {
  return catering;
}

export function getHomePage(): HomePage {
  return homePage;
}

export function getAboutPage(): AboutPage {
  return aboutPage;
}

/** Flat list of every dish, for structured data and lookups. */
export function getAllMenuItems(): MenuItem[] {
  return menu.courses.flatMap((course) => course.items);
}

/**
 * Canonical origin for canonicals, the sitemap, robots and every `og:image`.
 *
 * Resolution order, most explicit first:
 *
 *  1. `NEXT_PUBLIC_SITE_URL` — an explicit override always wins.
 *  2. `site.url.value`, once it is no longer flagged as a placeholder — the
 *     real domain beats anything the host reports.
 *  3. The Vercel deployment's own origin. Before a domain exists this is what
 *     makes a `*.vercel.app` deploy self-consistent: without it every canonical
 *     and social-card URL points at `chaskadallas.com`, which nobody owns, so
 *     link previews resolve to nothing.
 *  4. The placeholder, as a last resort.
 */
export function getSiteUrl(): string {
  const normalise = (value: string) =>
    `https://${value.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalise(explicit);

  if (!site.url.placeholder) return normalise(site.url.value);

  // `VERCEL_PROJECT_PRODUCTION_URL` is stable across deployments;
  // `VERCEL_URL` changes every time, so it is only the fallback.
  const fromHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (fromHost) return normalise(fromHost);

  return normalise(site.url.value);
}
