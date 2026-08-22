import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuCourse } from "@/components/sections/MenuCourse";
import { MenuRow } from "@/components/sections/MenuRow";
import { getMenu } from "@/content";

const item = {
  id: "samosa-te-chole",
  name: "Samosa te Chole",
  price: { amount: 8, currency: "USD" as const },
  description: "Crisp samosas over spiced chickpeas.",
};

describe("MenuRow", () => {
  it("prints the price as a bare numeral, as designed", () => {
    const { container } = render(
      <dl>
        <MenuRow item={item} size="lg" />
      </dl>,
    );
    const priceCell = container.querySelectorAll("dd")[0];
    // Only the numeral is on screen; the currency lives in the sr-only span.
    priceCell?.querySelector(".sr-only")?.remove();
    expect(priceCell?.textContent?.trim()).toBe("8");
  });

  it("speaks the currency through a visually hidden span", () => {
    const { container } = render(
      <dl>
        <MenuRow item={item} size="lg" />
      </dl>,
    );
    const hidden = container.querySelector(".sr-only");
    expect(hidden?.textContent?.trim()).toBe("8 US dollars");
  });

  it("hides the decorative dotted leader from assistive technology", () => {
    const { container } = render(
      <dl>
        <MenuRow item={item} size="lg" />
      </dl>,
    );
    const leader = container.querySelector("dt span[aria-hidden='true']");
    expect(leader).not.toBeNull();
  });

  it("uses dt for the dish and dd for price and description", () => {
    const { container } = render(
      <dl>
        <MenuRow item={item} size="lg" />
      </dl>,
    );
    expect(container.querySelector("dt")?.textContent).toContain("Samosa te Chole");
    const dds = container.querySelectorAll("dd");
    expect(dds).toHaveLength(2);
    expect(dds[1]?.textContent).toContain("Crisp samosas");
  });

  it("omits the description row when a dish has none", () => {
    const { container } = render(
      <dl>
        <MenuRow item={{ ...item, description: undefined }} size="sm" />
      </dl>,
    );
    expect(container.querySelectorAll("dd")).toHaveLength(1);
  });
});

describe("MenuCourse", () => {
  it("labels the list with the course heading", () => {
    const course = getMenu().courses[0]!;
    const { container } = render(<MenuCourse course={course} />);
    const heading = screen.getByRole("heading", { name: course.name });
    const list = container.querySelector("dl");
    expect(list?.getAttribute("aria-labelledby")).toBe(heading.id);
  });

  it("renders every dish in the course", () => {
    const course = getMenu().courses[1]!;
    render(<MenuCourse course={course} />);
    for (const dish of course.items) {
      expect(screen.getByText(dish.name)).toBeInTheDocument();
    }
  });
});
