/**
 * House sponsor: Anjy's Bags (https://anjysbags.ng), shown in three places:
 *
 *   row_tile       a poster-shaped tile inside the "Popular movies" rail (home)
 *   detail_banner  the banner on movie and series pages, between the details and the cast rail
 *   player_poster  a bar over the player's poster screen, before the viewer presses Play
 *                  (it never touches the stream; closing it hides it for the browser session)
 *
 * The home shop strip (home_strip, components/sponsor/sponsor-strip.tsx) is off the home page
 * since 2026-11-17; put <SponsorStrip /> back in app/page.tsx to show it again.
 *
 * Set SPONSOR_ADS_ENABLED to false to take them all down at once.
 *
 * Copy, colours, fonts and the logo follow the store's own brief. Prices show only on the
 * strip's product cards (so nowhere while the strip is off). They are typed in here: update
 * them when the store changes them (checked against the product pages on 2026-11-17).
 * Leave discount codes, delivery promises and stock counts out.
 *
 * Clicks carry utm_source=streamscapex and utm_medium=<placement> so the store's Google
 * Analytics can count visits and sales per placement. GA4 on this side gets
 * sponsor_impression, sponsor_click and sponsor_dismiss (lib/analytics.ts).
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
  /*
   * The tile, banner and poster bar are product ads: each names the bag in its photo, gives
   * its price and links to that bag's page, with buyCta on the button. A named bag at a known
   * price is what gets the click; a tagline ("Carry your elegance.") does not. Every claim
   * comes from the store: prices from its product pages, delivery from its FAQ (Lagos in 1-3
   * business days, checked 2026-11-17). No discount codes or stock counts: none are confirmed.
   */
  /** Shown in capitals by CSS, so screen readers read words, not letters. */
  buyCta: "Get this bag",
  /** The banner's line after the price. */
  delivery: "Lagos delivery in 1–3 working days",
  /** Only the home shop strip (off the home page) uses headline, line and cta. */
  headline: "Bags Anjy would carry.",
  line: "Totes, shoulder bags and clutches. Prices from ₦13,000.",
  cta: "Shop Anjy's bags",
  /** The store's logo for dark backgrounds, copied from the store repo. Never recolour or redraw it. */
  logo: { src: "/sponsors/anjys-bags-logo.png", width: 396, height: 396 },
  /**
   * The bags in the ads: five of the six of the store's 23 shot on plain white (checked
   * 2026-11-17). The Perfect Bag is left out at the user's request (2026-11-18).
   * The rest are room shots (hands, blinds, shelves, other bags) that read as second-hand
   * listings next to studio ones. Most photos are 930x1163 (4:5); Sienna Loop Bag is square.
   * Each page view shows them in a random order (components/sponsor/use-shuffled.ts): the
   * banner, poster bar and rail tile each show the first (the strip, when on, shows four).
   * Add or remove bags here when the store gets new ones on a plain background.
   */
  products: [
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
    {
      name: "JB bag",
      path: "/ng/products/jb-bag",
      price: "₦15,000",
      image: "v1776890635/sczk3rb7kri9mspwq6hh.jpg",
    },
    {
      name: "Sienna Loop Bag",
      path: "/ng/products/sienna-loop-bag",
      price: "₦15,000",
      image: "v1776847564/tx8yx9dfxnjlw2jcb6tk.jpg",
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
  // c_limit: never enlarge past the original (some originals are only 800px wide).
  return `${CLOUDINARY_UPLOAD}/w_${width},c_limit,q_auto,f_auto/${image}`;
}

/** srcset for a plain <img>: Cloudinary resizes, so the TMDB image loader is not involved. */
export function sponsorSrcSet(image: string, widths: readonly number[]): string {
  return widths.map((width) => `${sponsorImage(image, width)} ${width}w`).join(", ");
}
