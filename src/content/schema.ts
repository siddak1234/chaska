import { z } from "zod";

import { isValidHref } from "@/lib/routes";

/**
 * The content contract.
 *
 * Every `*.data.json` file in this directory is parsed through one of these
 * schemas at module load, so malformed content fails `next build` rather than
 * rendering a broken page. Data lives in JSON — not TS — for two reasons:
 * `scripts/check-placeholders.ts` can read it with `node:fs` and no module
 * resolution, and a future CMS only has to produce the same shape.
 */

/* ── Primitives ─────────────────────────────────────────────────────────── */

export const linkSchema = z.object({
  label: z.string().min(1),
  /**
   * Either a route in `lib/routes.ts` (optionally with a fragment) or an
   * external `mailto:` / `tel:` / `https:` target. This is what stops a
   * leftover `Menu.dc.html` from the artboards reaching production.
   */
  href: z
    .string()
    .min(1)
    .refine(isValidHref, {
      error: (issue) =>
        `"${String(issue.input)}" is not a known route or external target — see src/lib/routes.ts`,
    }),
});

export const priceSchema = z.object({
  /** Whole dollars, as printed on the artboards ("8", "15" — never "$8.00"). */
  amount: z.number().int().positive(),
  currency: z.literal("USD"),
});

/** Marks a field group that still holds design-placeholder data. */
const placeholder = z.boolean();

/* ── Site ───────────────────────────────────────────────────────────────── */

export const hoursSchema = z.object({
  /** Machine-readable, for schema.org `openingHoursSpecification`. */
  openDays: z
    .array(
      z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]),
    )
    .min(1),
  opens: z.string().regex(/^\d{2}:\d{2}$/),
  closes: z.string().regex(/^\d{2}:\d{2}$/),
  /** Human-readable, printed verbatim from the artboards. */
  displayDays: z.string().min(1),
  displayTime: z.string().min(1),
  displayClosed: z.string().min(1),
});

export const siteSchema = z.object({
  name: z.string().min(1),
  nameGurmukhi: z.string().min(1),
  descriptor: z.string().min(1),
  tagline: z.string().min(1),
  topbar: z.tuple([z.string(), z.string(), z.string()]),
  footerMeta: z.string().min(1),
  cuisine: z.string().min(1),
  /** The wider market the restaurant caters to, for search context. */
  metroArea: z.string().min(1),
  url: z.object({ value: z.url(), placeholder }),
  contact: z.object({
    phone: z.object({
      /** E.164, for `tel:` and schema.org. */
      e164: z.string().regex(/^\+[1-9]\d{6,14}$/),
      display: z.string().min(1),
      placeholder,
    }),
    email: z.object({
      general: z.email(),
      catering: z.email(),
      placeholder,
    }),
    address: z.object({
      street: z.string().nullable(),
      locality: z.string().min(1),
      region: z.string().length(2),
      regionName: z.string().min(1),
      postalCode: z.string().nullable(),
      country: z.string().length(2),
      placeholder,
    }),
  }),
  hours: hoursSchema,
  nav: z.array(linkSchema).min(1),
  footerNav: z.array(linkSchema).min(1),
});

/* ── Menu ───────────────────────────────────────────────────────────────── */

export const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /**
   * Optional. The current menu is published without prices; when they arrive
   * this becomes a data edit, and `MenuRow` shows the dotted leader and figure
   * again with no change to the layout.
   */
  price: priceSchema.optional(),
  description: z.string().min(1).optional(),
  /** Flags a dish that is not vegetarian, within an otherwise vegetarian course. */
  nonVeg: z.boolean().optional(),
  /** e.g. "South Indian", "Indo-Chinese" — shown as a small note beside the name. */
  origin: z.string().min(1).optional(),
});

export const menuCourseSchema = z.object({
  id: z.string().min(1),
  /** Punjabi course name, set in the display face. */
  name: z.string().min(1),
  /** English gloss, set as an oxblood kicker beneath it. */
  englishName: z.string().min(1),
  /**
   * `grid`    — auto-fit rows with descriptions.
   * `stack`   — a single narrow column of name/price rows.
   * `columns` — a dense multi-column list of names, for the long courses that
   *             carry no prices and no descriptions.
   */
  layout: z.enum(["grid", "stack", "columns"]),
  /** Optional line under the course heading, e.g. a vegetarian note. */
  note: z.string().min(1).optional(),
  items: z.array(menuItemSchema).min(1),
});

export const menuSchema = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  titleGurmukhi: z.string().min(1),
  intro: z.string().min(1),
  courses: z.array(menuCourseSchema).min(1),
  /** The captioned band of photographs between the first two courses. */
  photoStrip: z
    .array(
      z.object({
        imageId: z.string().min(1),
        caption: z.string().min(1),
      }),
    )
    .min(1),
});

/* ── Catering ───────────────────────────────────────────────────────────── */

export const cateringPackageSchema = z.object({
  id: z.string().min(1),
  /** "10 to 25 guests" */
  guests: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  /** "From $22 per guest" or "Enquire for pricing" — printed as written. */
  pricing: z.string().min(1),
});

export const cateringSchema = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  packages: z.array(cateringPackageSchema).min(1),
  /**
   * Label only. The `mailto:` target is composed from
   * `site.contact.email.catering` so the address lives in exactly one place.
   */
  ctaLabel: z.string().min(1),
});

/* ── Pages ──────────────────────────────────────────────────────────────── */

/** A titled block of prose with an optional kicker and call-to-action pair. */
export const proseBlockSchema = z.object({
  kicker: z.string().min(1).optional(),
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const figureSchema = z.object({
  /** Key into `src/content/generated/images.ts`. */
  imageId: z.string().min(1),
  caption: z.string().min(1),
  /** Aspect ratio of the frame, exactly as set on the artboard. */
  ratio: z.enum(["3/2", "4/3", "4/5"]),
});

export const dishHighlightSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  imageId: z.string().min(1),
});

export const homePageSchema = z.object({
  lead: proseBlockSchema.extend({
    figure: figureSchema,
    actions: z.array(linkSchema).length(2),
  }),
  kitchen: z.object({
    title: z.string().min(1),
    moreLink: linkSchema,
    dishes: z.array(dishHighlightSchema).min(1),
  }),
  family: proseBlockSchema.extend({
    figure: figureSchema,
    action: linkSchema,
  }),
  cateringNotice: z.object({
    kicker: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    action: linkSchema,
  }),
  visiting: z.object({
    kicker: z.string().min(1),
    hoursLabel: z.string().min(1),
    contactLabel: z.string().min(1),
  }),
});

export const aboutPageSchema = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  owner: proseBlockSchema.extend({
    /** No `imageId` — the artboard's `about-ronika` slot is genuinely empty. */
    figure: z.object({
      imageId: z.string().min(1).nullable(),
      caption: z.string().min(1),
      ratio: z.enum(["3/2", "4/3", "4/5"]),
      emptyLabel: z.string().min(1),
    }),
  }),
  family: proseBlockSchema.extend({ figure: figureSchema }),
  quote: z.object({
    text: z.string().min(1),
    attribution: z.string().min(1),
    actions: z.array(linkSchema).length(2),
  }),
});

/* ── Images (generated) ─────────────────────────────────────────────────── */

export const imageCreditSchema = z.object({
  author: z.string().min(1),
  licenseName: z.string().min(1),
  licenseUrl: z.url(),
  sourceUrl: z.url(),
  fileName: z.string().min(1),
});

/* ── Inferred types ─────────────────────────────────────────────────────── */

export type Link = z.infer<typeof linkSchema>;
export type Price = z.infer<typeof priceSchema>;
export type Hours = z.infer<typeof hoursSchema>;
export type Site = z.infer<typeof siteSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuCourse = z.infer<typeof menuCourseSchema>;
export type Menu = z.infer<typeof menuSchema>;
export type CateringPackage = z.infer<typeof cateringPackageSchema>;
export type Catering = z.infer<typeof cateringSchema>;
export type ProseBlock = z.infer<typeof proseBlockSchema>;
export type Figure = z.infer<typeof figureSchema>;
export type DishHighlight = z.infer<typeof dishHighlightSchema>;
export type HomePage = z.infer<typeof homePageSchema>;
export type AboutPage = z.infer<typeof aboutPageSchema>;
export type ImageCredit = z.infer<typeof imageCreditSchema>;
