import { describe, expect, it } from "vitest";

import { isExternalHref, isInternalHref, isValidHref, routeOf } from "@/lib/routes";

describe("route validation", () => {
  it("accepts every known route", () => {
    for (const route of ["/", "/menu", "/order", "/catering", "/about"]) {
      expect(isInternalHref(route)).toBe(true);
    }
  });

  it("no longer routes to the credits page, which has nothing left to credit", () => {
    expect(isInternalHref("/credits")).toBe(false);
  });

  it("accepts a route with a fragment", () => {
    expect(isInternalHref("/menu#full-menu")).toBe(true);
  });

  it("accepts a bare fragment", () => {
    expect(isInternalHref("#full-menu")).toBe(true);
  });

  it("rejects the artboards' filenames", () => {
    // The whole point of the check: no `Menu.dc.html` survives the port.
    expect(isValidHref("Menu.dc.html")).toBe(false);
    expect(isValidHref("Home.dc.html")).toBe(false);
    expect(isValidHref("Menu.dc.html#full-menu")).toBe(false);
  });

  it("rejects unknown routes", () => {
    expect(isInternalHref("/reservations")).toBe(false);
  });

  it("recognises external targets", () => {
    expect(isExternalHref("mailto:hello@example.com")).toBe(true);
    expect(isExternalHref("tel:+12145550100")).toBe(true);
    expect(isExternalHref("sms:+12145550100?&body=hi")).toBe(true);
    expect(isExternalHref("https://www.instagram.com/tasteofchaska/")).toBe(true);
    expect(isExternalHref("/menu")).toBe(false);
  });

  it("extracts the route from an href with a fragment", () => {
    expect(routeOf("/menu#full-menu")).toBe("/menu");
    expect(routeOf("mailto:x@y.z")).toBeNull();
  });
});
