// The social card for this route. Next replaces — never deep-merges — a child
// segment's `openGraph` object, so a single root-level file would be dropped by
// the per-page metadata from `buildMetadata`. One re-export per page segment
// keeps the image and the metadata at the same depth. Implementation:
// src/lib/og-card.tsx
export {
  ogAlt as alt,
  ogContentType as contentType,
  ogSize as size,
} from "@/lib/og-card";
export { renderOgCard as default } from "@/lib/og-card";
