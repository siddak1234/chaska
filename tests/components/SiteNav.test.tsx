import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { SiteNav } from "@/components/layout/SiteNav";
import { getSite } from "@/content";
import { telHref } from "@/lib/format";

const site = getSite();
// Built the way Masthead builds it, so the fixture cannot drift from the
// real contact details.
const reserve = {
  label: `Reserve · ${site.contact.phone.display}`,
  href: telHref(site.contact.phone.e164),
};

function renderAt(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  return render(<SiteNav links={site.nav} reserve={reserve} />);
}

describe("SiteNav", () => {
  it.each([
    ["/", "Home"],
    ["/menu", "Menu"],
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
    // Matches the artboards: Catering stays unmarked while on /menu.
    renderAt("/menu");
    expect(screen.getByRole("link", { name: "Catering" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders the reserve link as a tel: anchor", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: reserve.label })).toHaveAttribute(
      "href",
      `tel:${site.contact.phone.e164}`,
    );
  });

  it("names the navigation landmark", () => {
    renderAt("/");
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });
});
