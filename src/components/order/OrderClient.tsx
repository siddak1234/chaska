"use client";

import { useMemo, useState } from "react";

import { formatPickup, orderMessage, priceLines, type PickupForm } from "@/lib/cart";
import { mailtoHref, smsHref } from "@/lib/format";

import { CartDrawer } from "./CartDrawer";
import { useCart } from "./CartProvider";
import { Checkout } from "./Checkout";
import { DishCard } from "./DishCard";
import { OrderSent, type PlacedOrder } from "./OrderSent";
import type { OrderContact, OrderDish } from "./types";

type OrderClientProps = {
  dishes: OrderDish[];
  contact: OrderContact;
  place: string;
};

/**
 * The Order page below its header: the dish grid, then checkout, then the
 * sent order — the design's three views — plus the cart drawer.
 *
 * Orders reach the kitchen as a text message to its number, by the owner's
 * decision: "Place pickup order" opens the customer's messaging app with the
 * order written out. On a mouse-driven device, where there is usually no
 * messaging app, it opens an email instead. Both stay available afterwards.
 */
export function OrderClient({ dishes, contact, place }: OrderClientProps) {
  const { cart, clear, setDrawerOpen } = useCart();
  const [view, setView] = useState<"menu" | "checkout" | "sent">("menu");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const lines = useMemo(() => priceLines(cart, dishes), [cart, dishes]);

  function goTo(next: "menu" | "checkout") {
    setView(next);
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }

  function place_(form: PickupForm) {
    const message = orderMessage(form, lines);
    const order: PlacedOrder = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      when: formatPickup(form.date, form.time),
      lines,
      smsHref: smsHref(contact.phoneE164, message),
      mailtoHref: mailtoHref(contact.email, {
        subject: `Pickup order — ${form.name.trim()}`,
        body: message,
      }),
    };
    setPlaced(order);
    setView("sent");
    clear();
    window.scrollTo(0, 0);

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    window.location.href = coarse ? order.smsHref : order.mailtoHref;
  }

  return (
    <div className="pb-16">
      {view === "menu" ? (
        <section aria-label="Dishes" className="pt-sec-sm rule-double">
          <div className="grid auto-fill-270-min gap-x-gap-order gap-y-9">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </section>
      ) : null}

      {view === "checkout" ? (
        <Checkout
          lines={lines}
          place={place}
          onBack={() => goTo("menu")}
          onPlace={place_}
        />
      ) : null}

      {view === "sent" && placed ? (
        <OrderSent
          order={placed}
          phoneDisplay={contact.phoneDisplay}
          onNewOrder={() => {
            setPlaced(null);
            goTo("menu");
          }}
        />
      ) : null}

      <CartDrawer
        lines={lines}
        note={`Pickup only · ${place}`}
        onCheckout={() => goTo("checkout")}
      />
    </div>
  );
}
