import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Figure } from "@/components/media/Figure";
import { getImage } from "@/content/images";

describe("Figure", () => {
  it("renders the photograph with the manifest's alt text", () => {
    render(<Figure imageId="masala-idli" caption="Masala idli." ratio="5/4" />);
    expect(
      screen.getByRole("img", { name: getImage("masala-idli").alt }),
    ).toBeInTheDocument();
  });

  it("shows the photograph untreated, as the current design does", () => {
    // The first artboards toned every photograph with a sepia filter; the
    // current design shows the kitchen's own photographs as they are.
    const { container } = render(
      <Figure imageId="panjiri" caption="Panjiri." ratio="4/3" />,
    );
    expect(container.querySelector("img")?.className).not.toMatch(/sepia|newsprint/);
  });

  it("renders the ruled caption", () => {
    render(
      <Figure imageId="kadhi-pakora" caption="Punjabi kadhi pakora." ratio="4/3" />,
    );
    expect(screen.getByText("Punjabi kadhi pakora.")).toBeInTheDocument();
  });

  it("falls back to a designed empty frame when there is no photograph", () => {
    const { container } = render(
      <Figure
        imageId={null}
        caption="Snoopy, sous chef."
        emptyLabel="Photo of Snoopy"
        ratio="4/5"
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(
      screen.getByRole("img", { name: /Photo of Snoopy — photograph to come/ }),
    ).toBeInTheDocument();
  });
});
