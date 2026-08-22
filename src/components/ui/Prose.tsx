import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/**
 * A stack of body paragraphs at one of the four measures used across the
 * artboards.
 *
 * Paragraph spacing is not uniform in the source: the home lead sets 16px
 * between paragraphs, every other block sets 14px. `gap` carries that
 * distinction rather than averaging it away.
 */
const prose = cva("", {
  variants: {
    size: {
      /** 16px / 28px — the home lead. */
      lede: "text-lede",
      /** 15.5px / 27px — feature and About body copy. */
      body: "text-prose",
      /** 15px / 26px — the catering intro. */
      intro: "text-intro",
      /** 14.5px / 25px — cards and notices. */
      card: "text-card",
    },
    tone: {
      ink: "text-ink",
      secondary: "text-ink-secondary",
    },
    gap: {
      /** 16px — the home lead only. */
      lede: "[&>p+p]:mt-4",
      /** 14px — every other prose block in the artboards. */
      body: "[&>p+p]:mt-3.5",
    },
  },
  defaultVariants: { size: "body", tone: "ink", gap: "body" },
});

type ProseProps = VariantProps<typeof prose> & {
  paragraphs: readonly string[];
  className?: string;
};

export function Prose({ paragraphs, size, tone, gap, className }: ProseProps) {
  return (
    <div className={cn(prose({ size, tone, gap }), className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}
