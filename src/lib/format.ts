import type { Address, Price } from "@/content/schema";

/**
 * The menu prints prices as bare integers ("8", "15") — no currency mark. That
 * reads fine visually but is ambiguous to a screen reader, so the visual string
 * and the spoken string are produced separately.
 */
export function formatPrice(price: Price): string {
  return String(price.amount);
}

/** "8 US dollars" — rendered into a visually hidden span beside the numeral. */
export function formatPriceForSpeech(price: Price): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    currencyDisplay: "name",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price.amount);
}

/** "$9" — the Order page and cart print whole dollars with the sign. */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** schema.org `Offer.price` wants a machine value. */
export function priceForSchema(amount: number): string {
  return amount.toFixed(2);
}

/** "Frisco, Texas" — the only place the site names. */
export function formatPlace(address: Address): string {
  return `${address.locality}, ${address.regionName}`;
}

/** `tel:` targets must be bare E.164 — no spaces, no parentheses. */
export function telHref(e164: string): string {
  return `tel:${e164}`;
}

/**
 * `sms:` with a pre-filled body. The `?&body=` form is the one iOS and Android
 * both accept: iOS reads the body after `&`, Android after `?`.
 */
export function smsHref(e164: string, body: string): string {
  return `sms:${e164}?&body=${encodeURIComponent(body)}`;
}

export function mailtoHref(
  email: string,
  options: { subject?: string; body?: string } = {},
): string {
  const params = [
    options.subject ? `subject=${encodeURIComponent(options.subject)}` : null,
    options.body ? `body=${encodeURIComponent(options.body)}` : null,
  ].filter(Boolean);
  return params.length > 0 ? `mailto:${email}?${params.join("&")}` : `mailto:${email}`;
}

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${handle}/`;
}
