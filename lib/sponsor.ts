/**
 * House sponsor: Anjy's Bags (https://anjysbags.ng), shown in three places:
 *
 *   row_tile       a poster-shaped tile inside the "Popular movies" rail (home)
 *   home_strip     the shop strip between "New in theaters" and "Browse by genre" (home)
 *   detail_banner  the banner on movie and series pages, between the details and the cast rail
 *   player_poster  a bar over the player's poster screen, before the viewer presses Play
 *                  (it never touches the stream; closing it hides it for the browser session)
 *
 * Set SPONSOR_ADS_ENABLED to false to take all four down at once.
 *
 * Copy, colours, fonts and the logo follow the store's own brief. Prices show only on the
 * strip's product cards and are typed in here, so update them when the store changes them
 * (checked against the product pages on 2026-11-17). Leave discount codes, delivery
 * promises and stock counts out. Clicks carry utm_source=streamscapex and utm_medium=<placement> so the
 * store's Google Analytics can count visits and sales per placement. GA4 on this side gets
 * sponsor_impression and sponsor_click (lib/analytics.ts).
 */
export const SPONSOR_ADS_ENABLED = true;

export type SponsorPlacement = "row_tile" | "home_strip" | "detail_banner" | "player_poster";

export interface SponsorProduct {
  name: string;
  /** Path on the store, after the domain. */
  path: string;
  /** As the product page shows it. */
  price: string;
  /** Cloudinary asset path after /image/upload/ (version and file). */
  image: string;
}

const STORE_ORIGIN = "https://anjysbags.ng";
const CLOUDINARY_UPLOAD = "https://res.cloudinary.com/dhvwthnzq/image/upload";

export const ANJYS_BAGS = {
  id: "anjys_bags",
  name: "Anjy's Bags",
  homePath: "/ng",
  displayUrl: "anjysbags.ng",
  headline: "Carry your elegance.",
  line: "Every bag here is one Anjy would carry.",
  /** Shown in capitals by CSS, so screen readers read words, not letters. */
  cta: "Shop the collection",
  /** The store's logo for dark backgrounds, copied from the store repo. Never recolour or redraw it. */
  logo: { src: "/sponsors/anjys-bags-logo.png", width: 396, height: 396 },
  /**
   * The hero bag, then the strip's four. All photos are 930x1163 (4:5) on plain white, picked
   * by the store: lifestyle shots (Mide Tote, Corporate Shoulder Bag) read as second-hand
   * listings next to studio ones.
   */
  hero: {
    name: "The Perfect Bag",
    path: "/ng/products/the-perfect-bag",
    image: "v1776892438/ehftlnvnxdecfzod9xxi.jpg",
  },
  products: [
    {
      name: "The Perfect Bag",
      path: "/ng/products/the-perfect-bag",
      price: "₦15,000",
      image: "v1776892438/ehftlnvnxdecfzod9xxi.jpg",
    },
    {
      name: "My Lacy Tote",
      path: "/ng/products/my-lacy-tote",
      price: "₦15,000",
      image: "v1776890379/jok12xpgawfiebtmupk0.jpg",
    },
    {
      name: "Toniaa Bag",
      path: "/ng/products/toniaa-bag",
      price: "₦15,000",
      image: "v1794339840/dukvaoyqm5zrlrbbdrv6.jpg",
    },
    {
      // The store's own spelling, lower-case "fave" included.
      name: "Anjy's fave",
      path: "/ng/products/anjys-fave",
      price: "₦15,000",
      image: "v1794339520/qzxazjdujiccs4wuctaa.jpg",
    },
  ] satisfies SponsorProduct[],
} as const;

/** Store link for a placement. utm_campaign stays the same so all placements group together. */
export function sponsorHref(path: string, placement: SponsorPlacement): string {
  const url = new URL(path, STORE_ORIGIN);
  url.searchParams.set("utm_source", "streamscapex");
  url.searchParams.set("utm_medium", placement);
  url.searchParams.set("utm_campaign", "streamscapex_sponsor");
  return url.toString();
}

/** Cloudinary rendition at a given width, in the best format and quality the browser accepts. */
export function sponsorImage(image: string, width: number): string {
  return `${CLOUDINARY_UPLOAD}/w_${width},q_auto,f_auto/${image}`;
}

/** srcset for a plain <img>: Cloudinary resizes, so the TMDB image loader is not involved. */
export function sponsorSrcSet(image: string, widths: readonly number[]): string {
  return widths.map((width) => `${sponsorImage(image, width)} ${width}w`).join(", ");
}
