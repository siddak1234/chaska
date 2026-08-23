import { ImageResponse } from "next/og";

import { getSite } from "@/content";
import {
  OG_COLORS,
  caslonDisplayFont,
  franklinFont,
  gurmukhiFont,
} from "@/lib/og-fonts";

export const ogAlt = "Chaska — a Punjabi family restaurant in Frisco, Texas";
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * The social card: the masthead, rendered as an image.
 *
 * Lives here rather than in `app/` because Next replaces — does not deep-merge —
 * a child segment's `openGraph` object. Since every page sets one through
 * `buildMetadata`, a single root `opengraph-image` file is dropped from the
 * resolved metadata. Each route group re-exports this instead, so the file
 * convention resolves at the same segment as the metadata that would clobber it.
 */
export async function renderOgCard() {
  const site = getSite();
  const [caslon, franklin, gurmukhi] = await Promise.all([
    caslonDisplayFont(),
    franklinFont(),
    gurmukhiFont(),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: OG_COLORS.paper,
        color: OG_COLORS.ink,
        padding: "54px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          fontFamily: "Franklin",
          fontSize: 20,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          paddingBottom: 18,
          borderBottom: `2px solid ${OG_COLORS.ink}`,
        }}
      >
        <span>{site.topbar[0]}</span>
        <span>{site.topbar[2]}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Gurmukhi",
            fontSize: 54,
            color: OG_COLORS.oxblood,
            marginBottom: 14,
          }}
        >
          {site.nameGurmukhi}
        </div>
        <div
          style={{
            fontFamily: "Caslon",
            fontSize: 178,
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          {site.name.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: "Franklin",
            fontSize: 24,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginTop: 34,
          }}
        >
          {site.tagline}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          fontFamily: "Franklin",
          fontSize: 20,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: OG_COLORS.muted,
          paddingTop: 18,
          borderTop: `2px solid ${OG_COLORS.ink}`,
        }}
      >
        {site.descriptor}
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Caslon", data: caslon, style: "normal", weight: 400 },
        { name: "Franklin", data: franklin, style: "normal", weight: 400 },
        { name: "Gurmukhi", data: gurmukhi, style: "normal", weight: 400 },
      ],
    },
  );
}
