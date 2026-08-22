import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("keeps a font size and a text colour together", () => {
    // Both are `text-*`. Without the custom class groups in lib/cn.ts,
    // tailwind-merge treats them as one group and drops the first.
    const result = cn("text-ink", "text-lead");
    expect(result).toContain("text-ink");
    expect(result).toContain("text-lead");
  });

  it("still collapses two sizes to the last one", () => {
    expect(cn("text-row", "text-row-sm")).toBe("text-row-sm");
  });

  it("still collapses two colours to the last one", () => {
    expect(cn("text-ink", "text-oxblood")).toBe("text-oxblood");
  });

  it("collapses font families", () => {
    expect(cn("font-body", "font-display")).toBe("font-display");
  });

  it("collapses tracking", () => {
    expect(cn("tracking-ui", "tracking-kicker")).toBe("tracking-kicker");
  });

  it("drops falsy values", () => {
    expect(cn("text-ink", false, undefined, null, "")).toBe("text-ink");
  });
});
