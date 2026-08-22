import { cn } from "@/lib/cn";

import { RATIO_CLASS_MAP, type FrameRatio } from "./ratios";

type EmptyFrameProps = {
  label: string;
  ratio: FrameRatio;
  className?: string;
};

/**
 * The designed empty state for an image slot with no photograph yet.
 *
 * `about-ronika` on the About artboard has no `src` — it is a genuinely
 * unfilled `<image-slot>` waiting on a portrait. Rather than substitute a
 * stock photo of a stranger, this renders the newspaper convention for a
 * picture that has not arrived: a ruled box with a set caption.
 */
export function EmptyFrame({ label, ratio, className }: EmptyFrameProps) {
  return (
    <div
      role="img"
      aria-label={`${label} — photograph to come`}
      className={cn(
        "relative flex w-full items-center justify-center border border-rule",
        "bg-[color-mix(in_srgb,var(--color-rule)_14%,transparent)]",
        RATIO_CLASS_MAP[ratio],
        className,
      )}
    >
      <span className="px-6 text-center font-ui text-micro font-bold tracking-kicker text-ink-muted uppercase">
        {label}
      </span>
    </div>
  );
}
