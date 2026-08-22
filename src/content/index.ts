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
 * Canonical origin. `NEXT_PUBLIC_SITE_URL` wins so preview deployments get
 * correct canonicals; the JSON value is the (still placeholder) production one.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const raw = fromEnv && fromEnv.length > 0 ? fromEnv : site.url.value;
  return raw.replace(/\/+$/, "");
}
