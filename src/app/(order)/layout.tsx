import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/SiteShell";
import { CartButton } from "@/components/order/CartButton";
import { CartProvider } from "@/components/order/CartProvider";

/**
 * The Order page: the compact masthead with the cart button on its nav rule.
 * The cart provider wraps the whole shell because the button lives in the
 * masthead and the cart it counts lives in the page.
 */
export default function OrderLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteShell variant="compact" navAction={<CartButton />}>
        {children}
      </SiteShell>
    </CartProvider>
  );
}
