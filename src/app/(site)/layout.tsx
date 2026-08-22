import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/SiteShell";

/** Inner pages use the compact masthead: smaller wordmark, no tagline. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell variant="compact">{children}</SiteShell>;
}
