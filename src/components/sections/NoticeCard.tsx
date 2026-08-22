import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { cn } from "@/lib/cn";

/**
 * The ruled box: a hairline ink border around a kicker, heading and short body.
 *
 * The two uses look alike but are not identical in the artboards, so the
 * measurements are enumerated rather than shared:
 *
 *   notice  (home, "The same food, for your gathering")
 *           padding 28 · kicker margin-bottom 12 · body 14.5/25 at margin-top 14
 *           · footer at margin-top 20
 *   package (menu, the three catering tiers)
 *           padding 26 · kicker margin-bottom 0, heading margin-top 10
 *           · body 14/24 at margin-top 12 · footer at margin-top 16
 */
const card = cva("border border-ink", {
  variants: { variant: { notice: "p-7", package: "p-[26px]" } },
  defaultVariants: { variant: "notice" },
});

type NoticeCardProps = VariantProps<typeof card> & {
  kicker: string;
  title: string;
  body: string;
  /** A button on the home notice; the plain pricing line on a package. */
  footer?: ReactNode;
};

export function NoticeCard({
  kicker,
  title,
  body,
  footer,
  variant = "notice",
}: NoticeCardProps) {
  const isPackage = variant === "package";

  return (
    <div className={card({ variant })}>
      <Kicker size={isPackage ? "meta" : "md"} className={isPackage ? "" : "mb-3"}>
        {kicker}
      </Kicker>
      <Heading
        level={isPackage ? 3 : 2}
        size="dish"
        className={cn(isPackage ? "mt-2.5 text-dish leading-[normal]" : "text-notice")}
      >
        {title}
      </Heading>
      <p
        className={cn(
          "text-ink-secondary",
          isPackage ? "mt-3 text-note leading-6" : "mt-3.5 text-card",
        )}
      >
        {body}
      </p>
      {footer ? <div className={isPackage ? "mt-4" : "mt-5"}>{footer}</div> : null}
    </div>
  );
}
