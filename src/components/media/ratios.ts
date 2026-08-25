export type FrameRatio = "16/9" | "3/2" | "4/3" | "4/5";

export const RATIO_CLASS_MAP: Record<FrameRatio, string> = {
  /** The home page's lead photograph, running the full content width. */
  "16/9": "aspect-[16/9]",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
};
