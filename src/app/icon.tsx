import { ImageResponse } from "next/og";

import { getSite } from "@/content";
import { OG_COLORS, gurmukhiFont } from "@/lib/og-fonts";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The browser-tab icon: the first Gurmukhi letter of ਚਸਕਾ, cream on oxblood.
 *
 * Drawn from the vendored font rather than an SVG `<text>` element, which would
 * depend on the viewer's machine having a Gurmukhi face installed.
 */
export default async function Icon() {
  const site = getSite();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: OG_COLORS.oxblood,
        color: OG_COLORS.paper,
        fontFamily: "Gurmukhi",
        fontSize: 46,
        lineHeight: 1,
        paddingBottom: 4,
      }}
    >
      {[...site.nameGurmukhi][0]}
    </div>,
    {
      ...size,
      fonts: [
        { name: "Gurmukhi", data: await gurmukhiFont(), style: "normal", weight: 400 },
      ],
    },
  );
}
