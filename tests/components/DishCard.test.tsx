import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { CartButton } from "@/components/order/CartButton";
import { CartProvider } from "@/components/order/CartProvider";
import { DishCard } from "@/components/order/DishCard";
import { getImage } from "@/content/images";
import { CART_STORAGE_KEY } from "@/lib/cart";
import type { OrderDish } from "@/lib/daily-menu";

const DAHI: OrderDish = {
  id: "dahi-bhalla",
  name: "Dahi Bhalla",
  description: "Soft lentil dumplings.",
  categoryId: "small-plates",
  pricing: { kind: "container", small: 9, large: 16 },
  ...getImage("dahi-bhalla"),
};

function renderCard(dish: OrderDish = DAHI) {
  return render(
    <CartProvider>
      <CartButton />
      <DishCard dish={dish} />
    </CartProvider>,
  );
}

// jsdom's accessible-name computation joins the visible label and the hidden
// dish name without the space a browser keeps; the e2e suite checks the real
// name. These match either.
const addButton = (dish: string, verb = "Add") =>
  screen.getByRole("button", { name: new RegExp(`^${verb} ?${dish} to order$`) });

function storedCart(): unknown {
  return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
}

beforeEach(() => window.localStorage.clear());

describe("DishCard", () => {
  it("offers the two container sizes as real radio inputs, small first", () => {
    renderCard();
    const small = screen.getByRole("radio", { name: /Small.*\$9.*16 oz/ });
    const large = screen.getByRole("radio", { name: /Large.*\$16.*32 oz/ });
    expect(small).toBeChecked();
    expect(large).not.toBeChecked();
  });

  it("adds one at the chosen size each time, counts it and stores it", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("radio", { name: /Large/ }));
    await user.click(addButton("Dahi Bhalla"));
    await user.click(addButton("Dahi Bhalla", "Added"));

    expect(screen.getByRole("button", { name: /Cart/ })).toHaveTextContent(
      "Cart2 items",
    );
    expect(storedCart()).toEqual([{ dishId: "dahi-bhalla", size: "large", qty: 2 }]);
  });

  it("confirms the add on the button and to screen readers", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(addButton("Dahi Bhalla"));
    expect(addButton("Dahi Bhalla", "Added")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Dahi Bhalla added to your order.",
    );
  });

  it("sells a per-piece dish by the piece, with no size choice", async () => {
    const user = userEvent.setup();
    renderCard({
      ...DAHI,
      id: "kutchi-dabeli",
      name: "Kutchi Dabeli",
      pricing: { kind: "each", unit: "Per dabeli", each: 5 },
    });
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByText("Per dabeli")).toBeInTheDocument();
    await user.click(addButton("Kutchi Dabeli"));
    expect(storedCart()).toEqual([{ dishId: "kutchi-dabeli", size: "each", qty: 1 }]);
  });

  it("lays out without a photograph when the dish has none", () => {
    renderCard({ ...DAHI, image: null });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dahi Bhalla" })).toBeInTheDocument();
  });
});
