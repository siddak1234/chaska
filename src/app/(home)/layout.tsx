import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/SiteShell";

/** The home page carries the full-width masthead and the tagline. */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return <SiteShell variant="hero">{children}</SiteShell>;
}
