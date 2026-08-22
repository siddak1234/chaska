import {
  Libre_Caslon_Display,
  Libre_Caslon_Text,
  Libre_Franklin,
  Noto_Serif_Gurmukhi,
} from "next/font/google";

/**
 * The artboards load these four families through a blocking
 * `<link href="fonts.googleapis.com">`. `next/font` self-hosts them instead:
 * the files are downloaded at build time, served from our own origin, and
 * given a matched size-adjusted fallback so there is no layout shift.
 *
 * Each font exposes a CSS variable consumed by the `--font-*` tokens in
 * `globals.css`.
 */

/** Headings, dish names, the CHASKA wordmark. Only ships at 400. */
const caslonDisplay = Libre_Caslon_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caslon-display-src",
});

/** Body copy. Italic is used for nothing yet but belongs to the family. */
const caslonText = Libre_Caslon_Text({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caslon-text-src",
});

/** Every uppercase, letterspaced element: kickers, nav, buttons, prices. */
const franklin = Libre_Franklin({
  weight: "variable",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-franklin-src",
});

/** ਚਸਕਾ and ਮੀਨੂ. The `gurmukhi` subset is required — `latin` does not cover it. */
const gurmukhi = Noto_Serif_Gurmukhi({
  weight: "variable",
  subsets: ["gurmukhi", "latin"],
  display: "swap",
  variable: "--font-gurmukhi-src",
});

export const fontVariables = [
  caslonDisplay.variable,
  caslonText.variable,
  franklin.variable,
  gurmukhi.variable,
].join(" ");
