import type { z } from "zod";

import aboutData from "./about.data.json";
import cateringData from "./catering.data.json";
import dishesData from "./dishes.data.json";
import homeData from "./home.data.json";
import { getImage, type SlotImage } from "./images";
import menuData from "./menu.data.json";
import orderData from "./order.data.json";
import {
  aboutPageSchema,
  cateringSchema,
  dishesSchema,
  homePageSchema,
  menuSchema,
  orderPageSchema,
  siteSchema,
  type AboutPage,
  type Catering,
  type Dish,
  type HomePage,
  type Menu,
  type MenuCourse,
  type MenuItem,
  type OrderPage,
  type Site,
  type StripFigure,
} from "./schema";
import siteData from "./site.data.json";

/**
 * The only way the app reads content.
 *
 * Components never import a `*.data.json` file directly, so moving this layer
 * onto a CMS later means reimplementing these accessors and nothing else.
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
const { dishes } = parse(dishesSchema, dishesData, "dishes.data.json");
const menu = parse(menuSchema, menuData, "menu.data.json");
const catering = parse(cateringSchema, cateringData, "catering.data.json");
const orderPage = parse(orderPageSchema, orderData, "order.data.json");
const homePage = parse(homePageSchema, homeData, "home.data.json");
const aboutPage = parse(aboutPageSchema, aboutData, "about.data.json");

/**
 * Pages name catalogue dishes by id. An id with no dish is a content error,
 * so it fails at module load — the same moment a schema error would — rather
 * than rendering a gap.
 */
const dishById = new Map(dishes.map((dish) => [dish.id, dish]));

function resolveDish(id: string, file: string): Dish {
  const dish = dishById.get(id);
  if (!dish) {
    throw new Error(`Invalid content in src/content/${file}: no dish with id "${id}"`);
  }
  return dish;
}

/** A catalogue dish as a menu row: the Menu page's description, no price. */
function toMenuItem(dish: Dish): MenuItem {
  return {
    id: dish.id,
    name: dish.name,
    description: dish.description,
    ...(dish.nonVeg ? { nonVeg: true } : {}),
  };
}

export type SignatureBand = {
  courses: MenuCourse[];
  photoStrip: StripFigure[];
};

const signatureBands: SignatureBand[] = menu.signature.bands.map((band) => ({
  courses: band.courses.map(({ dishIds, ...course }) => ({
    ...course,
    items: dishIds.map((id) => toMenuItem(resolveDish(id, "menu.data.json"))),
  })),
  photoStrip: band.photoStrip,
}));

export type HomeDish = { id: string; name: string; description: string } & SlotImage;

const homeDishes: HomeDish[] = homePage.kitchen.dishes.map(
  ({ dishId, description }) => {
    const dish = resolveDish(dishId, "home.data.json");
    return { id: dish.id, name: dish.name, description, ...getImage(dish.imageId) };
  },
);

export function getSite(): Site {
  return site;
}

export function getMenu(): Menu {
  return menu;
}

export function getCatering(): Catering {
  return catering;
}

/** The orderable catalogue, in the order the Order page lists it. */
export function getDishes(): Dish[] {
  return dishes;
}

export function getOrderPage(): OrderPage {
  return orderPage;
}

/** The Menu page's photographed dishes, resolved from the catalogue. */
export function getSignatureBands(): SignatureBand[] {
  return signatureBands;
}

/** "From the Kitchen" on the home page, resolved from the catalogue. */
export function getHomeDishes(): HomeDish[] {
  return homeDishes;
}

export function getHomePage(): HomePage {
  return homePage;
}

export function getAboutPage(): AboutPage {
  return aboutPage;
}

/** Every dish on the full menu, flattened. */
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
