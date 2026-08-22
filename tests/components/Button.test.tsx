import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ButtonLink } from "@/components/ui/Button";

describe("ButtonLink", () => {
  it("declares a hover colour rather than inheriting the global link hover", () => {
    // The artboards let `a:hover { color: #8b1e1e }` apply to solid buttons,
    // which is oxblood on near-black at 1.96:1. Each variant must override it.
    render(
      <ButtonLink href="/menu" variant="ink">
        View the menu
      </ButtonLink>,
    );
    const className = screen.getByRole("link").className;
    expect(className).toContain("hover:bg-oxblood");
    expect(className).toContain("hover:text-paper");
  });

  it("renders mailto: as a plain anchor without a new tab", () => {
    render(<ButtonLink href="mailto:catering@example.com">Enquire</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "mailto:catering@example.com");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens off-site http links in a new tab, safely", () => {
    render(<ButtonLink href="https://example.com">Elsewhere</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("applies the requested variant and size", () => {
    render(
      <ButtonLink href="/about" variant="outline" size="sm">
        Our story
      </ButtonLink>,
    );
    const className = screen.getByRole("link").className;
    expect(className).toContain("border-ink");
    expect(className).toContain("px-5");
  });
});
