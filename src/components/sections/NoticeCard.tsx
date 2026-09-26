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
 *   notice  (the Order page, when today's menu is empty or cannot load)
 *           padding 28 · kicker margin-bottom 12 · body 14.5/25 at margin-top 14
 *           · footer at margin-top 20
 *   package (the Catering page's three cards)
 *           padding 20 on a phone, 26 from sm · heading, then body 14/24 at
 *           margin-top 12
 */
const card = cva("border border-ink", {
  variants: { variant: { notice: "p-7", package: "p-5 sm:p-[26px]" } },
  defaultVariants: { variant: "notice" },
});

type NoticeCardProps = VariantProps<typeof card> & {
  /** Omitted on the catering packages, where it only repeated the name. */
  kicker?: string;
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
      {kicker ? (
        <Kicker size={isPackage ? "meta" : "md"} className={isPackage ? "" : "mb-3"}>
          {kicker}
        </Kicker>
      ) : null}
      {/* The package heading is 24px with the artboards' default leading,
          not the 1.2 the `dish` token carries for the home dish cards. */}
      <Heading
        level={2}
        size={isPackage ? "dish" : "notice"}
        className={isPackage ? "leading-[normal]" : undefined}
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
