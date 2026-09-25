import type { StaticImageData } from "next/image";

import bhuttaDip from "@/assets/images/bhutta-dip.jpg";
import burrataLababdar from "@/assets/images/burrata-lababdar.jpg";
import butterChickenSliders from "@/assets/images/butter-chicken-sliders.jpg";
import dahiBhalla from "@/assets/images/dahi-bhalla.jpg";
import kadhiPakora from "@/assets/images/kadhi-pakora.jpg";
import kutchiDabeli from "@/assets/images/kutchi-dabeli.jpg";
import masalaIdli from "@/assets/images/masala-idli.jpg";
import moongSalad from "@/assets/images/moong-salad.jpg";
import paneerKathi from "@/assets/images/paneer-kathi.jpg";
import panjiri from "@/assets/images/panjiri.jpg";
import pestoEggs from "@/assets/images/pesto-eggs.jpg";
import ronikaPortrait from "@/assets/images/ronika-portrait.jpg";

export type SlotImage = {
  image: StaticImageData;
  alt: string;
};

/**
 * Every photograph on the site, keyed by what it shows — one entry per file,
 * however many places it appears.
 *
 * All are the restaurant's own: the dishes are cropped from the
 * @tasteofchaska Instagram posts the design was built from, and the portrait
 * was supplied by the owner. None carries a third-party licence, which is why
 * the site has no credits page.
 *
 * Alt text follows the design's `aria-label` for each dish.
 */
export const images = {
  "bhutta-dip": { image: bhuttaDip, alt: "Masala bhutta dip" },
  "burrata-lababdar": { image: burrataLababdar, alt: "Burrata lababdar" },
  "butter-chicken-sliders": {
    image: butterChickenSliders,
    alt: "Butter chicken sliders",
  },
  "dahi-bhalla": { image: dahiBhalla, alt: "Dahi bhalla catering tray" },
  "kadhi-pakora": { image: kadhiPakora, alt: "Punjabi kadhi pakora" },
  "kutchi-dabeli": { image: kutchiDabeli, alt: "Kutchi dabeli" },
  "masala-idli": { image: masalaIdli, alt: "Masala idli with coconut chutney" },
  "moong-salad": { image: moongSalad, alt: "Sprouted moong dal salad" },
  "paneer-kathi": { image: paneerKathi, alt: "Royal paneer kathi roll" },
  panjiri: { image: panjiri, alt: "Panjiri" },
  "pesto-eggs": { image: pestoEggs, alt: "Garden pesto eggs" },
  "ronika-portrait": {
    image: ronikaPortrait,
    alt: "Ronika Singh Bhatia, owner of Chaska",
  },
} as const satisfies Record<string, SlotImage>;

export type ImageId = keyof typeof images;

export const IMAGE_IDS = Object.keys(images) as [ImageId, ...ImageId[]];

export function getImage(id: ImageId): SlotImage {
  return images[id];
}
