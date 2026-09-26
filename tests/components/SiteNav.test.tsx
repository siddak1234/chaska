import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { SiteNav } from "@/components/layout/SiteNav";
import { getSite } from "@/content";

const site = getSite();

function renderAt(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  return render(<SiteNav links={site.nav} />);
}

describe("SiteNav", () => {
  it.each([
    ["/menu", "Menu"],
    ["/order", "Order"],
    ["/catering", "Catering"],
    ["/about", "About"],
  ])("marks %s as the current page", (pathname, label) => {
    renderAt(pathname);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks exactly one link as current", () => {
    const { container } = renderAt("/menu");
    expect(container.querySelectorAll("[aria-current='page']")).toHaveLength(1);
  });

  it("never marks a fragment link as current", () => {
    // A fragment points into a page, not at the page itself.
    vi.mocked(usePathname).mockReturnValue("/menu");
    render(<SiteNav links={[{ label: "Full menu", href: "/menu#full-menu" }]} />);
    expect(screen.getByRole("link", { name: "Full menu" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks nothing current on the home page, which the wordmark links to", () => {
    const { container } = renderAt("/");
    expect(container.querySelectorAll("[aria-current='page']")).toHaveLength(0);
  });

  it("lists the four destinations, in order, with no phone link", () => {
    // Four fit on one line on a phone. Home is the wordmark above the nav and
    // the first footer link; the phone number lives in the footer.
    renderAt("/");
    expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual([
      "Menu",
      "Order",
      "Catering",
      "About",
    ]);
  });

  it("names the navigation landmark", () => {
    renderAt("/");
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });
});
