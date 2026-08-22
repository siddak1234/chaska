export type FrameRatio = "3/2" | "4/3" | "4/5";

export const RATIO_CLASS_MAP: Record<FrameRatio, string> = {
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
};
