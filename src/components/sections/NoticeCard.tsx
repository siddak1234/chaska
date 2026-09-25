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
 *   notice  (home, the catering notice)
 *           padding 28 · kicker margin-bottom 12 · body 14.5/25 at margin-top 14
 *           · footer at margin-top 20
 *   package (menu, the three catering cards)
 *           padding 26 · kicker margin-bottom 0, heading margin-top 10
 *           · body 14/24 at margin-top 12
 */
const card = cva("border border-ink", {
  variants: { variant: { notice: "p-7", package: "p-[26px]" } },
  defaultVariants: { variant: "notice" },
});

type NoticeCardProps = VariantProps<typeof card> & {
  kicker: string;
  title: string;
  body: string;
  /** The home notice's button. */
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
      {/* The package heading is 24px with the artboards' default leading,
          not the 1.2 the `dish` token carries for the home dish cards. */}
      <Heading
        level={isPackage ? 3 : 2}
        size={isPackage ? "dish" : "notice"}
        className={isPackage ? "mt-2.5 leading-[normal]" : undefined}
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
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}
