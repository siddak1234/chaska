import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Figure } from "@/components/media/Figure";
import { getImage } from "@/content/generated/images";

describe("Figure", () => {
  it("renders the photograph with the manifest's alt text", () => {
    render(<Figure imageId="home-hero" caption="Naan in the tandoor." ratio="3/2" />);
    expect(
      screen.getByRole("img", { name: getImage("home-hero").alt }),
    ).toBeInTheDocument();
  });

  it("applies the newsprint treatment in CSS, not to the file", () => {
    const { container } = render(
      <Figure imageId="home-dal" caption="Dal makhani." ratio="4/3" />,
    );
    expect(container.querySelector("img")?.className).toContain("newsprint");
  });

  it("renders the ruled caption", () => {
    render(<Figure imageId="home-saag" caption="Sarson da saag." ratio="4/3" />);
    expect(screen.getByText("Sarson da saag.")).toBeInTheDocument();
  });

  it("falls back to a designed empty frame when there is no photograph", () => {
    const { container } = render(
      <Figure
        imageId={null}
        caption="Ronika Singh, owner."
        emptyLabel="Photo of Ronika Singh"
        ratio="4/5"
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(
      screen.getByRole("img", { name: /Photo of Ronika Singh — photograph to come/ }),
    ).toBeInTheDocument();
  });
});
