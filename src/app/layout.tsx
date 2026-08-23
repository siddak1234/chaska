import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { getSite, getSiteUrl } from "@/content";
import { JsonLd, restaurantJsonLd } from "@/lib/jsonld";

import { fontVariables } from "./fonts";
import "./globals.css";

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${site.name} · ${site.descriptor} in ${site.contact.address.locality}`,
    template: `%s · ${site.name}`,
  },
  description:
    `${site.descriptor} in ${site.contact.address.locality}, ${site.contact.address.regionName}, ` +
    `serving the ${site.metroArea} area. ${site.tagline}.`,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  robots: { index: true, follow: true },
  formatDetection: { telephone: true, address: false, email: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {children}
        <JsonLd data={restaurantJsonLd()} />
      </body>
    </html>
  );
}
