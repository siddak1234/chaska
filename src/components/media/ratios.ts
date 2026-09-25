import type { FrameRatio } from "@/content/schema";

export type { FrameRatio };

export const RATIO_CLASS_MAP: Record<FrameRatio, string> = {
  "16/9": "aspect-[16/9]",
  /** The home page's lead photograph, beside the headline. */
  "5/4": "aspect-[5/4]",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
};
