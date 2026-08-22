import type { Hours, Price } from "@/content/schema";

/**
 * The artboards print prices as bare integers ("8", "15") — no currency mark
 * anywhere on the menu. That reads fine visually but is ambiguous to a screen
 * reader, so the visual string and the spoken string are produced separately.
 */
export function formatPrice(price: Price): string {
  return String(price.amount);
}

/** "8 dollars" — rendered into a visually hidden span beside the numeral. */
export function formatPriceForSpeech(price: Price): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    currencyDisplay: "name",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price.amount);
}

/** "$8.00" — schema.org `MenuItem.offers.price` wants a machine value. */
export function priceForSchema(price: Price): string {
  return price.amount.toFixed(2);
}

/** schema.org `openingHoursSpecification`. */
export function toOpeningHoursSpecification(hours: Hours) {
  return {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: hours.openDays,
    opens: hours.opens,
    closes: hours.closes,
  };
}

/** `tel:` targets must be bare E.164 — no spaces, no parentheses. */
export function telHref(e164: string): string {
  return `tel:${e164}`;
}

export function mailtoHref(email: string, subject?: string): string {
  return subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
}
