import { DM_Sans, Josefin_Sans } from "next/font/google";

/*
 * Anjy's Bags brand, from the store's brief: Josefin Sans Light for headlines,
 * DM Sans Regular for everything else, Deep Plum ground with Warm White and
 * Blush text. Dusty Rose is decoration only and is never used for text.
 *
 * The fonts are not preloaded: they would compete with the player poster and
 * the first rail for bandwidth, and swap in fine once the units scroll into view.
 */

export const headlineFont = Josefin_Sans({
  subsets: ["latin"],
  weight: "300",
  display: "swap",
  preload: false,
});

export const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/** Deep Plum ground, Warm White text. */
export const plumSurface = "bg-[#3D1A1D] text-[#FDFAF9]";

/** Blush: the short line, the web address and small labels on plum. */
export const blushText = "text-[#F2DADA]";

/** Headline: Josefin Sans Light, tight tracking and leading (sizes set per unit). */
export const headlineClass = `${headlineFont.className} font-light leading-[1.05] tracking-[-0.02em]`;

/** "Sponsored" label on plum. */
export const sponsoredLabel = `${blushText} text-[11px] uppercase leading-4 tracking-[0.14em]`;

/** Focus ring for controls that sit on the plum ground. */
export const plumFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDFAF9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3D1A1D]";

/** Warm White pill with Deep Plum capitals: the store's own button. */
export const pillClass =
  "inline-flex min-h-11 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full bg-[#FDFAF9] px-5 text-[12px] uppercase tracking-[0.14em] text-[#3D1A1D] transition-[transform,background-color] duration-150 ease-out md:text-[13px]";

/** Widths offered in srcset for product photos (Cloudinary resizes on request). */
export const PHOTO_WIDTHS = [240, 360, 480, 720, 960] as const;
