import { GENRE_SECTION_CLASS } from "@/components/home/classes";
import { ANJYS_BAGS, SPONSOR_ADS_ENABLED, sponsorHref, sponsorImage, sponsorSrcSet } from "@/lib/sponsor";
import { cn } from "@/lib/utils";

import {
  blushText,
  bodyFont,
  headlineClass,
  PHOTO_WIDTHS,
  pillClass,
  plumFocusRing,
  plumSurface,
  sponsoredLabel,
} from "./brand";
import { SponsorImpression, SponsorLink } from "./sponsor-tracking";

/**
 * Home page shop strip: the brand on the left, four bags with their prices on
 * the right (two on phones). Each bag opens its product page; the pill opens the store.
 * Uses the genre section's wrapper so it lines up with the page grid.
 */
export function SponsorStrip() {
  if (!SPONSOR_ADS_ENABLED) return null;

  return (
    <section aria-label={`Sponsored: ${ANJYS_BAGS.name}`} className={GENRE_SECTION_CLASS}>
      <SponsorImpression placement="home_strip">
        <div className={cn("rounded-panel", plumSurface, bodyFont.className)}>
          <div className="flex flex-col gap-8 p-6 md:p-10 lg:flex-row lg:items-center lg:gap-12 lg:p-12">
            <div className="flex flex-col items-start gap-4 lg:w-[340px] lg:shrink-0">
              <div className="flex w-full items-start justify-between gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ANJYS_BAGS.logo.src}
                  alt={ANJYS_BAGS.name}
                  width={ANJYS_BAGS.logo.width}
                  height={ANJYS_BAGS.logo.height}
                  loading="lazy"
                  decoding="async"
                  className="size-24 md:size-36"
                />
                <p className={sponsoredLabel}>Sponsored</p>
              </div>
              <h2 className={cn(headlineClass, "text-[36px] md:text-5xl")}>{ANJYS_BAGS.headline}</h2>
              <p className={cn(blushText, "text-[15px] leading-6")}>{ANJYS_BAGS.line}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
                <SponsorLink
                  href={sponsorHref(ANJYS_BAGS.homePath, "home_strip")}
                  placement="home_strip"
                  item="store"
                  className={cn(pillClass, plumFocusRing, "hover:bg-white active:scale-[0.98]")}
                >
                  {ANJYS_BAGS.cta}
                  <span className="sr-only"> at {ANJYS_BAGS.name} (opens in a new tab)</span>
                </SponsorLink>
                <span className={cn(blushText, "text-sm")}>{ANJYS_BAGS.displayUrl}</span>
              </div>
            </div>

            <ul className="grid min-w-0 flex-1 grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {ANJYS_BAGS.products.map((product, index) => (
                <li key={product.path} className={cn(index >= 2 && "max-md:hidden")}>
                  <SponsorLink
                    href={sponsorHref(product.path, "home_strip")}
                    placement="home_strip"
                    item={product.name}
                    className="group block rounded-media focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "relative block aspect-[4/5] overflow-hidden rounded-media bg-white",
                        "group-focus-visible:ring-2 group-focus-visible:ring-[#FDFAF9] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#3D1A1D]",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sponsorImage(product.image, 480)}
                        srcSet={sponsorSrcSet(product.image, PHOTO_WIDTHS)}
                        sizes="(min-width: 1024px) 200px, (min-width: 768px) 22vw, 45vw"
                        alt=""
                        width={930}
                        height={1163}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-contain transition-transform duration-150 ease-out [@media(hover:hover)]:group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="mt-2 block text-sm leading-5 transition-colors duration-150 ease-out [@media(hover:hover)]:group-hover:text-[#F2DADA]">
                      {product.name}
                    </span>
                    <span className={cn(blushText, "block text-sm leading-5 tabular-nums")}>
                      {product.price}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </SponsorLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SponsorImpression>
    </section>
  );
}
