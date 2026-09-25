import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { IMAGE_IDS, images } from "@/content/images";

const IMAGE_DIR = path.join(process.cwd(), "src", "assets", "images");

describe("image manifest", () => {
  it("lists every file in src/assets/images, and nothing else", () => {
    // A file on disk with no manifest entry is dead weight in the repo; an
    // entry with no file fails the build. Both directions are checked.
    const onDisk = readdirSync(IMAGE_DIR)
      .filter((f) => f.endsWith(".jpg"))
      .map((f) => f.replace(/\.jpg$/, ""))
      .sort();
    expect([...IMAGE_IDS].sort()).toEqual(onDisk);
  });

  it("names each photograph by what it shows, one entry per file", () => {
    for (const [id, slot] of Object.entries(images)) {
      expect(slot.image.src, `${id} points at another file`).toContain(`${id}.jpg`);
    }
  });

  it("gives every photograph non-empty alt text", () => {
    for (const [id, slot] of Object.entries(images)) {
      expect(slot.alt.trim().length, `${id} has no alt text`).toBeGreaterThan(0);
    }
  });

  it("keeps the owner portrait at 4:5", () => {
    const { image, alt } = images["ronika-portrait"];
    expect(image.width / image.height).toBeCloseTo(4 / 5, 3);
    expect(alt).toBe("Ronika Singh Bhatia, owner of Chaska");
  });

  it("stores the dish photographs large enough for their widest frame", () => {
    // The widest dish frame is the home lead at 592 CSS px; at 2x that is
    // 1184 device pixels. The crops are 1159–1260px wide.
    for (const [id, { image }] of Object.entries(images)) {
      if (id === "ronika-portrait") continue;
      expect(image.width, `${id} is ${image.width}px wide`).toBeGreaterThanOrEqual(
        1150,
      );
    }
  });
});
