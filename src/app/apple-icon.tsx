import { markIconContentType, renderMarkIcon } from "@/lib/mark-icon";

export const size = { width: 180, height: 180 };
export const contentType = markIconContentType;

/** The home-screen icon. Implementation: src/lib/mark-icon.tsx */
export default function AppleIcon() {
  return renderMarkIcon({ size, fontSize: 128, paddingBottom: 12 });
}
