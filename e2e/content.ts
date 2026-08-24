import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Reads the content files directly.
 *
 * Playwright's loader will not resolve a JSON module import, and these tests
 * need no module graph — only the same source of truth the pages render from.
 * Values are read rather than frozen as literals so a menu change does not
 * silently rot the suite; that the content itself is correct is asserted in
 * `tests/content/content.test.ts`.
 */
function read<T>(file: string): T {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), "src", "content", file), "utf8"),
  ) as T;
}

type Menu = {
  title: string;
  courses: Array<{ name: string; items: Array<{ name: string }> }>;
};

export const menu = read<Menu>("menu.data.json");
export const home = read<{ lead: { title: string } }>("home.data.json");
export const about = read<{ title: string }>("about.data.json");

export const dishCount = menu.courses.reduce(
  (total, course) => total + course.items.length,
  0,
);
