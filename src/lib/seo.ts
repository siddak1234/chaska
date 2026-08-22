import type { Metadata } from "next";

import { getSite, getSiteUrl } from "@/content";

/**
 * Per-route metadata. The title template, canonical origin and Open Graph
 * defaults live in the root layout; this only fills in what changes per page.
 */
export function buildMetadata(options: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const site = getSite();
  const url = `${getSiteUrl()}${options.path === "/" ? "" : options.path}`;

  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${options.title} · ${site.name}`,
      description: options.description,
      url,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${options.title} · ${site.name}`,
      description: options.description,
    },
  };
}
