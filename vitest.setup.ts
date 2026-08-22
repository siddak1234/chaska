import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * `SiteNav` derives its active item from the route. Tests set the pathname via
 * `vi.mocked(usePathname).mockReturnValue(...)`.
 */
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));
