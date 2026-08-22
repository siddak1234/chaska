import { describe, expect, it } from "vitest";

import { isExternalHref, isInternalHref, isValidHref, routeOf } from "@/lib/routes";

describe("route validation", () => {
  it("accepts every known route", () => {
    for (const route of ["/", "/menu", "/about", "/credits"]) {
      expect(isInternalHref(route)).toBe(true);
    }
  });

  it("accepts a route with a fragment", () => {
    expect(isInternalHref("/menu#catering")).toBe(true);
  });

  it("accepts a bare fragment", () => {
    expect(isInternalHref("#catering")).toBe(true);
  });

  it("rejects the artboards' filenames", () => {
    // The whole point of the check: no `Menu.dc.html` survives the port.
    expect(isValidHref("Menu.dc.html")).toBe(false);
    expect(isValidHref("Home.dc.html")).toBe(false);
    expect(isValidHref("Menu.dc.html#catering")).toBe(false);
  });

  it("rejects unknown routes", () => {
    expect(isInternalHref("/reservations")).toBe(false);
  });

  it("recognises external targets", () => {
    expect(isExternalHref("mailto:hello@example.com")).toBe(true);
    expect(isExternalHref("tel:+12145550100")).toBe(true);
    expect(isExternalHref("https://commons.wikimedia.org")).toBe(true);
    expect(isExternalHref("/menu")).toBe(false);
  });

  it("extracts the route from an href with a fragment", () => {
    expect(routeOf("/menu#catering")).toBe("/menu");
    expect(routeOf("mailto:x@y.z")).toBeNull();
  });
});
