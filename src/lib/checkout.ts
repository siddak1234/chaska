"use server";

import { z } from "zod";

import { createCheckout, readShopifyConfig } from "@/lib/shopify";

/**
 * "Checkout" on the Order page when the daily menu comes from Shopify: builds
 * a Shopify cart from the order and hands back Shopify's hosted checkout URL,
 * which the browser then opens. Payment, pickup details and the receipt are
 * all Shopify's.
 *
 * Runs on the server so the page's Content-Security-Policy can keep
 * `connect-src 'self'`. Input is validated here because a server action is a
 * public endpoint; Shopify validates the variants themselves.
 */

const linesSchema = z
  .array(
    z.object({
      merchandiseId: z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1)
  .max(50);

export type CheckoutResult = { url: string } | { error: string };

export async function startCheckout(lines: unknown): Promise<CheckoutResult> {
  const config = readShopifyConfig();
  if (!config) return { error: "Online checkout is not available right now." };

  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) {
    return { error: "Your order could not be read. Please try again." };
  }

  try {
    return { url: await createCheckout(config, parsed.data) };
  } catch (error) {
    console.error("[checkout] Shopify cart could not be created.", error);
    return {
      error: "Checkout could not be started. Please try again in a moment.",
    };
  }
}
