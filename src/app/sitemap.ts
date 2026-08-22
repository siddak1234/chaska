import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/content";
import { ROUTES } from "@/lib/routes";

/** Priority ordering: the front page, then the menu, then everything else. */
const PRIORITY: Record<string, number> = {
  "/": 1,
  "/menu": 0.9,
  "/about": 0.7,
  "/credits": 0.3,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();

  return ROUTES.map((route) => ({
    url: `${origin}${route === "/" ? "" : route}`,
    changeFrequency: "monthly" as const,
    priority: PRIORITY[route] ?? 0.5,
  }));
}
