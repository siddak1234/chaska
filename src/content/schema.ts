import { z } from "zod";

import { IMAGE_IDS } from "@/content/images";
import { isValidHref } from "@/lib/routes";

/**
 * The content contract.
 *
 * Every `*.data.json` file in this directory is parsed through one of these
 * schemas at module load, so malformed content fails `next build` rather than
 * rendering a broken page. Data lives in JSON — not TS — so
 * `scripts/check-placeholders.mjs` can read it with `node:fs` and no module
 * resolution, and a future CMS only has to produce the same shape.
 */

/* ── Primitives ─────────────────────────────────────────────────────────── */

export const linkSchema = z.object({
  label: z.string().min(1),
  /**
   * Either a route in `lib/routes.ts` (optionally with a fragment) or an
   * external `mailto:` / `tel:` / `sms:` / `https:` target. This is what stops
   * a leftover `Menu.dc.html` from the artboards reaching production.
   */
  href: z
    .string()
    .min(1)
    .refine(isValidHref, {
      error: (issue) =>
        `"${String(issue.input)}" is not a known route or external target — see src/lib/routes.ts`,
    }),
});

/** Whole US dollars, as the design prints them ("9", never "9.00"). */
export const amountSchema = z.number().int().positive();

export const priceSchema = z.object({
  amount: amountSchema,
  currency: z.literal("USD"),
});

/** Key into `src/content/images.ts`; an unknown photograph fails the build. */
export const imageIdSchema = z.enum(IMAGE_IDS);

/** Aspect ratio of a photographic frame, exactly as set on the artboard. */
export const frameRatioSchema = z.enum(["16/9", "5/4", "3/2", "4/3", "4/5"]);

export const figureSchema = z.object({
  imageId: imageIdSchema,
  caption: z.string().min(1),
  ratio: frameRatioSchema,
});

/**
 * A figure whose photograph may not exist yet. With `imageId: null` the frame
 * renders the designed empty state, captioned with `emptyLabel` — the design's
 * own placeholder for a slot still waiting on a picture.
 */
export const optionalFigureSchema = figureSchema.extend({
  imageId: imageIdSchema.nullable(),
  emptyLabel: z.string().min(1),
});

/** Marks a field group that still holds design-placeholder data. */
const placeholder = z.boolean();

/* ── Site ───────────────────────────────────────────────────────────────── */

export const siteSchema = z.object({
  name: z.string().min(1),
  nameGurmukhi: z.string().min(1),
  /** "A Punjabi family kitchen" — the topbar, the footer and every title. */
  descriptor: z.string().min(1),
  tagline: z.string().min(1),
  cuisine: z.string().min(1),
  /** The wider market the kitchen caters to, for search context. */
  metroArea: z.string().min(1),
  url: z.object({ value: z.url(), placeholder }),
  social: z.object({
    /** Without the "@". The profile URL is derived from it. */
    instagram: z.string().regex(/^[a-z0-9._]+$/),
  }),
  contact: z.object({
    phone: z.object({
      /** E.164, for `tel:`, `sms:` and schema.org. */
      e164: z.string().regex(/^\+[1-9]\d{6,14}$/),
      display: z.string().min(1),
      placeholder,
    }),
    email: z.object({
      general: z.email(),
      placeholder,
    }),
    /**
     * Town-level only, by decision: the site names Frisco, Texas and publishes
     * no street address or postal code. schema.org accepts a `PostalAddress`
     * without them.
     */
    address: z.object({
      locality: z.string().min(1),
      region: z.string().length(2),
      regionName: z.string().min(1),
      country: z.string().length(2),
      placeholder,
    }),
  }),
  nav: z.array(linkSchema).min(1),
  footerNav: z.array(linkSchema).min(1),
});

/* ── Dishes (the orderable catalogue) ───────────────────────────────────── */

/**
 * How a dish is sold on the Order page. Containers come in the design's two
 * sizes — a 16 oz pint and a 32 oz quart; everything else is sold by the piece.
 */
export const dishPricingSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("container"),
    small: amountSchema,
    large: amountSchema,
  }),
  z.object({
    kind: z.literal("each"),
    /** "Per dabeli" */
    unit: z.string().min(1),
    each: amountSchema,
  }),
]);

export const dishSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  imageId: imageIdSchema,
  /** The Menu page's line. */
  description: z.string().min(1),
  /** The Order card's shorter line, where the design gives one. */
  orderDescription: z.string().min(1).optional(),
  nonVeg: z.boolean().optional(),
  pricing: dishPricingSchema,
});

export const dishesSchema = z.object({
  dishes: z.array(dishSchema).min(1),
});

/* ── Menu ───────────────────────────────────────────────────────────────── */

export const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /**
   * Optional. The full menu is published without prices; when they arrive
   * this becomes a data edit, and `MenuRow` shows the dotted leader and figure
   * again with no change to the layout.
   */
  price: priceSchema.optional(),
  description: z.string().min(1).optional(),
  /** Flags a dish that is not vegetarian, within an otherwise vegetarian course. */
  nonVeg: z.boolean().optional(),
  /** e.g. "South Indian", "Mumbai" — shown as a small note beside the name. */
  origin: z.string().min(1).optional(),
});

const courseLayoutSchema = z.enum(["grid", "stack", "columns"]);

export const menuCourseSchema = z.object({
  id: z.string().min(1),
  /** Punjabi course name, set in the display face. */
  name: z.string().min(1),
  /** English gloss, set as an oxblood kicker beneath it. */
  englishName: z.string().min(1),
  /**
   * `grid`    — auto-fit rows with descriptions.
   * `stack`   — a single narrow column, set two-up beside another course.
   * `columns` — a dense multi-column list, for the long courses.
   */
  layout: courseLayoutSchema,
  /** Optional line under the course heading. */
  note: z.string().min(1).optional(),
  items: z.array(menuItemSchema).min(1),
});

/** A captioned photograph in one of the menu's three-across strips. */
export const stripFigureSchema = z.object({
  imageId: imageIdSchema,
  caption: z.string().min(1),
});

/**
 * The design's photographed dishes, set in bands: one or two courses, then a
 * strip of three photographs. Courses name catalogue dishes by id, so a dish's
 * name and description live in `dishes.data.json` alone.
 */
export const signatureSchema = z.object({
  title: z.string().min(1),
  bands: z
    .array(
      z.object({
        courses: z
          .array(
            z.object({
              id: z.string().min(1),
              name: z.string().min(1),
              englishName: z.string().min(1),
              layout: courseLayoutSchema,
              dishIds: z.array(z.string().min(1)).min(1),
            }),
          )
          .min(1)
          .max(2),
        photoStrip: z.array(stripFigureSchema).length(3),
      }),
    )
    .min(1),
});

export const menuSchema = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  titleGurmukhi: z.string().min(1),
  intro: z.string().min(1),
  signature: signatureSchema,
  /** Heading over the full list, below the signature dishes. */
  fullMenuTitle: z.string().min(1),
  courses: z.array(menuCourseSchema).min(1),
});

/* ── Catering ───────────────────────────────────────────────────────────── */

export const cateringPackageSchema = z.object({
  id: z.string().min(1),
  /** "Trays" */
  kicker: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
});

export const cateringSchema = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  packages: z.array(cateringPackageSchema).min(1),
  /**
   * Label only. The target is the Instagram profile, composed from
   * `site.social.instagram` so the handle lives in exactly one place.
   */
  ctaLabel: z.string().min(1),
});

/* ── Order ──────────────────────────────────────────────────────────────── */

export const orderPageSchema = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
});

/* ── Pages ──────────────────────────────────────────────────────────────── */

/** A titled block of prose with an optional kicker. */
export const proseBlockSchema = z.object({
  kicker: z.string().min(1).optional(),
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const homePageSchema = z.object({
  lead: proseBlockSchema.extend({
    figure: figureSchema,
    actions: z.array(linkSchema).length(2),
  }),
  kitchen: z.object({
    title: z.string().min(1),
    moreLink: linkSchema,
    /** Catalogue dishes, each with the home page's own line about it. */
    dishes: z
      .array(z.object({ dishId: z.string().min(1), description: z.string().min(1) }))
      .min(1),
  }),
  family: proseBlockSchema.extend({
    figure: figureSchema,
    action: linkSchema,
  }),
  catering: z.object({
    kicker: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    action: linkSchema,
    figure: figureSchema,
  }),
});

export const aboutPageSchema = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  owner: proseBlockSchema.extend({ figure: optionalFigureSchema }),
  family: proseBlockSchema.extend({ figure: optionalFigureSchema }),
  quote: z.object({
    text: z.string().min(1),
    attribution: z.string().min(1),
    actions: z.array(linkSchema).length(2),
  }),
});

/* ── Inferred types ─────────────────────────────────────────────────────── */

export type Link = z.infer<typeof linkSchema>;
export type Price = z.infer<typeof priceSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Address = Site["contact"]["address"];
export type Dish = z.infer<typeof dishSchema>;
export type DishPricing = z.infer<typeof dishPricingSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuCourse = z.infer<typeof menuCourseSchema>;
export type StripFigure = z.infer<typeof stripFigureSchema>;
export type Menu = z.infer<typeof menuSchema>;
export type Catering = z.infer<typeof cateringSchema>;
export type OrderPage = z.infer<typeof orderPageSchema>;
export type FrameRatio = z.infer<typeof frameRatioSchema>;
export type HomePage = z.infer<typeof homePageSchema>;
export type AboutPage = z.infer<typeof aboutPageSchema>;
