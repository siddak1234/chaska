import { afterEach, describe, expect, it } from "vitest";

import { getSite, getSiteUrl } from "@/content";

/**
 * `getSiteUrl` decides every canonical, the sitemap, robots and each
 * `og:image`. Getting it wrong is invisible in the browser and only shows up as
 * dead link previews and mis-indexed pages, so the resolution order is pinned
 * here.
 *
 * These cover the case that matters right now: the domain is still a
 * placeholder, so the deployment's own origin has to win.
 */
const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

describe("getSiteUrl", () => {
  it("assumes the domain is still a placeholder", () => {
    // If this fails the domain has landed — good. The last two cases below
    // then no longer describe reality and should be revisited.
    expect(getSite().url.placeholder).toBe(true);
  });

  it("falls back to the configured value when nothing else is set", () => {
    expect(getSiteUrl()).toBe("https://chaskadallas.com");
  });

  it("prefers the deployment origin over an unowned placeholder domain", () => {
    process.env.VERCEL_URL = "chaska-git-abc.vercel.app";
    expect(getSiteUrl()).toBe("https://chaska-git-abc.vercel.app");
  });

  it("prefers the stable production URL over the per-deployment one", () => {
    process.env.VERCEL_URL = "chaska-xyz.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "chaska.vercel.app";
    expect(getSiteUrl()).toBe("https://chaska.vercel.app");
  });

  it("lets an explicit override win over everything", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "chaska.vercel.app";
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.example.com";
    expect(getSiteUrl()).toBe("https://staging.example.com");
  });

  it("normalises scheme and trailing slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "staging.example.com///";
    expect(getSiteUrl()).toBe("https://staging.example.com");
  });

  it("never returns a trailing slash, so path joins cannot double up", () => {
    for (const value of ["https://a.com/", "a.com", "https://a.com"]) {
      process.env.NEXT_PUBLIC_SITE_URL = value;
      expect(getSiteUrl()).toBe("https://a.com");
    }
  });
});
