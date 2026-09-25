"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import {
  localDateValue,
  validatePickup,
  type PickupForm,
  type PricedLine,
} from "@/lib/cart";

import { OrderLines } from "./OrderLines";

type CheckoutProps = {
  lines: readonly PricedLine[];
  /** "Frisco, Texas" */
  place: string;
  onBack: () => void;
  onPlace: (form: PickupForm) => void;
};

const EMPTY: PickupForm = { name: "", phone: "", date: "", time: "", notes: "" };

const field =
  "border border-ink bg-field px-3.5 py-3 font-ui text-[15px] font-normal tracking-normal text-ink normal-case";
const label = "flex flex-col gap-1.5 text-micro font-bold tracking-ui uppercase";

/** Pickup details beside the order summary, as the design's checkout view. */
export function Checkout({ lines, place, onBack, onPlace }: CheckoutProps) {
  const [form, setForm] = useState<PickupForm>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PickupForm>(key: K) {
    return (event: { target: { value: string } }) => {
      setForm((f) => ({ ...f, [key]: event.target.value }));
      setError(null);
    };
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = validatePickup(form, lines.length);
    if (problem) setError(problem);
    else onPlace(form);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-x-gap-split gap-y-10 pt-sec-sm rule-double min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-labelledby="pickup-heading">
        <button
          type="button"
          onClick={onBack}
          className="-my-3 cursor-pointer py-3 font-ui text-label font-semibold tracking-ui uppercase"
        >
          ← Back to dishes
        </button>
        <Heading level={2} size="feature" id="pickup-heading" className="mt-5">
          Pickup details
        </Heading>
        <p className="mt-2.5 max-w-[56ch] text-[14.5px] leading-6 text-ink-muted">
          Pickup is in {place}. We confirm your order, pickup time and the pickup
          address by text.
        </p>

        <form noValidate onSubmit={submit}>
          <div className="mt-7 grid auto-grid-240-min gap-x-5 gap-y-[18px] font-ui">
            <label className={label}>
              Name
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={set("name")}
                className={field}
              />
            </label>
            <label className={label}>
              Mobile phone
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={set("phone")}
                className={field}
              />
            </label>
            <label className={label}>
              Pickup date
              <input
                type="date"
                name="date"
                min={localDateValue()}
                value={form.date}
                onChange={set("date")}
                className={field}
              />
            </label>
            <label className={label}>
              Preferred pickup time
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={set("time")}
                className={field}
              />
            </label>
            <label className={`${label} col-span-full`}>
              Notes for the kitchen (optional)
              <textarea
                rows={3}
                name="notes"
                value={form.notes}
                onChange={set("notes")}
                placeholder="Spice level, allergies, anything we should know"
                className={`${field} resize-y`}
              />
            </label>
          </div>
          {error ? (
            <p role="alert" className="mt-4 font-ui text-[13px] text-oxblood">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="accent" className="mt-6 min-h-12 px-7">
            Place pickup order
          </Button>
        </form>
      </section>

      <aside aria-labelledby="summary-heading" className="border border-ink p-6">
        <Heading
          level={2}
          size="dish"
          id="summary-heading"
          className="border-b border-ink pb-3 leading-[normal]"
        >
          Order summary
        </Heading>
        <OrderLines lines={lines} layout="stacked" />
      </aside>
    </div>
  );
}
