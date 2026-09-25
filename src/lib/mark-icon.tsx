import { ImageResponse } from "next/og";

import { getSite } from "@/content";
import { OG_COLORS, gurmukhiFont } from "@/lib/og-fonts";

export const markIconContentType = "image/png";

/**
 * The site mark: the first Gurmukhi letter of ਚਸਕਾ, cream on oxblood.
 *
 * Drawn from the vendored font rather than an SVG `<text>` element, which would
 * depend on the viewer's machine having a Gurmukhi face installed. `app/icon`
 * and `app/apple-icon` are the same picture at two sizes, so they share this
 * and differ only in the numbers they pass.
 */
export async function renderMarkIcon(options: {
  size: { width: number; height: number };
  fontSize: number;
  /** Optical centring: the glyph sits high in its em box. */
  paddingBottom: number;
}) {
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
        fontSize: options.fontSize,
        lineHeight: 1,
        paddingBottom: options.paddingBottom,
      }}
    >
      {[...site.nameGurmukhi][0]}
    </div>,
    {
      ...options.size,
      fonts: [
        { name: "Gurmukhi", data: await gurmukhiFont(), style: "normal", weight: 400 },
      ],
    },
  );
}
