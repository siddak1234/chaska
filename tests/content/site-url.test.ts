import { afterEach, describe, expect, it } from "vitest";

import { getSite, getSiteUrl, resolveSiteUrl } from "@/content";

/**
 * `getSiteUrl` decides every canonical, the sitemap, robots and each
 * `og:image`. Getting it wrong is invisible in the browser and shows up only as
 * dead link previews and mis-indexed pages, so the resolution order is pinned
 * here.
 *
 * The order is tested through the pure `resolveSiteUrl`, so the host-fallback
 * branch stays covered even though a real domain now short-circuits it.
 */
const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

describe("resolveSiteUrl", () => {
  it("uses the configured domain once it is no longer a placeholder", () => {
    expect(
      resolveSiteUrl({
        configured: "https://eatchaska.com",
        isPlaceholder: false,
      }),
    ).toBe("https://eatchaska.com");
  });

  it("lets a real domain beat the deployment origin", () => {
    expect(
      resolveSiteUrl({
        configured: "https://eatchaska.com",
        isPlaceholder: false,
        hostUrl: "chaska.vercel.app",
      }),
    ).toBe("https://eatchaska.com");
  });

  it("falls back to the deployment origin while the domain is a placeholder", () => {
    // Still exercised on any host without a domain of its own.
    expect(
      resolveSiteUrl({
        configured: "https://placeholder.example",
        isPlaceholder: true,
        hostUrl: "chaska-git-abc.vercel.app",
      }),
    ).toBe("https://chaska-git-abc.vercel.app");
  });

  it("lets an explicit override win over everything", () => {
    expect(
      resolveSiteUrl({
        explicit: "https://staging.example.com",
        configured: "https://eatchaska.com",
        isPlaceholder: false,
        hostUrl: "chaska.vercel.app",
      }),
    ).toBe("https://staging.example.com");
  });

  it("normalises scheme and trailing slashes", () => {
    for (const value of ["https://a.com/", "a.com", "https://a.com///", " a.com "]) {
      expect(
        resolveSiteUrl({ explicit: value, configured: "x", isPlaceholder: false }),
      ).toBe("https://a.com");
    }
  });
});

describe("getSiteUrl", () => {
  it("returns the live domain", () => {
    expect(getSiteUrl()).toBe("https://eatchaska.com");
    expect(getSite().url.placeholder).toBe(false);
  });

  it("still honours an explicit override, for staging", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.example.com/";
    expect(getSiteUrl()).toBe("https://staging.example.com");
  });

  it("ignores the Vercel origin now that the domain is real", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "chaska.vercel.app";
    expect(getSiteUrl()).toBe("https://eatchaska.com");
  });

  it("never returns a trailing slash, so path joins cannot double up", () => {
    expect(getSiteUrl().endsWith("/")).toBe(false);
  });
});
