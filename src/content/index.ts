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
 * Pure resolution of the canonical origin, most explicit first:
 *
 *  1. an explicit override (`NEXT_PUBLIC_SITE_URL`);
 *  2. the configured domain, once it is no longer a placeholder — a real
 *     domain always beats whatever the host reports;
 *  3. the deployment's own origin, which is what kept a `*.vercel.app` deploy
 *     self-consistent before the domain existed;
 *  4. the configured value as a last resort.
 *
 * Split out from `getSiteUrl` so every branch stays testable no matter what
 * the content currently holds — branch 3 is unreachable through `getSiteUrl`
 * now that the domain is real, but it still runs on any host without one.
 */
export function resolveSiteUrl(input: {
  explicit?: string | undefined;
  configured: string;
  isPlaceholder: boolean;
  hostUrl?: string | undefined;
}): string {
  const normalise = (value: string) =>
    `https://${value
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "")}`;

  const explicit = input.explicit?.trim();
  if (explicit) return normalise(explicit);

  if (!input.isPlaceholder) return normalise(input.configured);

  const host = input.hostUrl?.trim();
  if (host) return normalise(host);

  return normalise(input.configured);
}

/**
 * Canonical origin for canonicals, the sitemap, robots and every `og:image`.
 */
export function getSiteUrl(): string {
  return resolveSiteUrl({
    explicit: process.env.NEXT_PUBLIC_SITE_URL,
    configured: site.url.value,
    isPlaceholder: site.url.placeholder,
    // `VERCEL_PROJECT_PRODUCTION_URL` is stable across deployments;
    // `VERCEL_URL` changes every time, so it is only the fallback.
    hostUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL,
  });
}
