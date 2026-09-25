import { markIconContentType, renderMarkIcon } from "@/lib/mark-icon";

export const size = { width: 64, height: 64 };
export const contentType = markIconContentType;

/** The browser-tab icon. Implementation: src/lib/mark-icon.tsx */
export default function Icon() {
  return renderMarkIcon({ size, fontSize: 46, paddingBottom: 4 });
}
