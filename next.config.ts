import type { NextConfig } from "next";

/**
 * The site's own photographs are committed to `src/assets/images` and imported
 * statically. The one remote host is Shopify's CDN, for a product on the daily
 * menu that has no photograph of ours; the optimiser fetches it server-side,
 * so the Content-Security-Policy's `img-src 'self'` still holds.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF first, WebP fallback. Photographs only — no SVG is ever optimised.
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
  /**
   * Off deliberately: every link on this site comes out of JSON content, so a
   * compile-time `Route` union cannot see it. `linkSchema` validates hrefs
   * against `src/lib/routes.ts` at content-load time instead, and the e2e
   * link-integrity test checks the rendered pages.
   */
  typedRoutes: false,

  /**
   * The site serves no user content and loads nothing cross-origin, so these
   * are cheap and unconditional. `frame-ancestors` is set through CSP because
   * `X-Frame-Options` cannot express "same origin only" reliably across proxies.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              // Next injects inline bootstrap scripts and styles.
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
