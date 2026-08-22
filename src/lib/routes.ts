/**
 * The site's route table.
 *
 * Links come out of JSON content, so they cannot be checked by `typedRoutes`.
 * They are validated here instead — by `linkSchema` at content-load time, and
 * again by the link-integrity e2e test. A typo in a content file is a build
 * failure, not a 404 discovered in production.
 */

export const ROUTES = ["/", "/menu", "/about", "/credits"] as const;

export type AppRoute = (typeof ROUTES)[number];

/** Anchors that pages are expected to expose, keyed by route. */
export const ROUTE_ANCHORS: Partial<Record<AppRoute, readonly string[]>> = {
  "/menu": ["catering"],
};

/** `/menu`, `/menu#catering`, `#catering` — but not `/menu.dc.html`. */
export function isInternalHref(href: string): boolean {
  if (href.startsWith("#")) return /^#[a-z][a-z0-9-]*$/.test(href);

  const [pathPart, hash, ...rest] = href.split("#");
  if (rest.length > 0) return false;
  if (!ROUTES.includes(pathPart as AppRoute)) return false;
  if (hash === undefined) return true;
  return /^[a-z][a-z0-9-]*$/.test(hash);
}

/** `mailto:`, `tel:` and absolute URLs leave the app. */
export function isExternalHref(href: string): boolean {
  return /^(?:https?:\/\/|mailto:|tel:)/.test(href);
}

export function isValidHref(href: string): boolean {
  return isInternalHref(href) || isExternalHref(href);
}

/** The route part of an href, ignoring any fragment. */
export function routeOf(href: string): AppRoute | null {
  const [pathPart] = href.split("#");
  return ROUTES.includes(pathPart as AppRoute) ? (pathPart as AppRoute) : null;
}
