import { groupFocusRing, hoverTitle, hoverZoom, pressable, railWidths } from "@/components/ds/classes";
import { ANJYS_BAGS, sponsorHref, sponsorImage, sponsorSrcSet } from "@/lib/sponsor";
import { cn } from "@/lib/utils";

import { blushText, bodyFont, headlineClass, PHOTO_WIDTHS, plumSurface } from "./brand";
import { SponsorImpression, SponsorLink } from "./sponsor-tracking";

/**
 * Poster-sized sponsor tile for a rail: the hero bag on white over a plum panel,
 * with a "Sponsored" caption where a poster has its title. Same width and press
 * feedback as PosterCard so the rail keeps its rhythm. The caller checks
 * SPONSOR_ADS_ENABLED (a Rail gives every child a slot, even one that renders nothing).
 */
export function SponsorTile() {
  const { hero } = ANJYS_BAGS;

  return (
    <SponsorImpression placement="row_tile" className={railWidths.poster}>
      <SponsorLink
        href={sponsorHref(ANJYS_BAGS.homePath, "row_tile")}
        placement="row_tile"
        item="store"
        ariaLabel={`Sponsored: shop ${ANJYS_BAGS.name} (opens in a new tab)`}
        className={cn("group block rounded-media focus-visible:outline-none", pressable)}
      >
        <span
          className={cn(
            "relative flex aspect-[2/3] flex-col overflow-hidden rounded-media",
            plumSurface,
            bodyFont.className,
            groupFocusRing,
          )}
        >
          <span className="relative block min-h-0 flex-1 overflow-hidden bg-white">
            {/* Cloudinary resizes the photo; next/image would send it through the TMDB loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sponsorImage(hero.image, 360)}
              srcSet={sponsorSrcSet(hero.image, PHOTO_WIDTHS)}
              sizes="(min-width: 1280px) 208px, (min-width: 1024px) 192px, (min-width: 768px) 176px, (min-width: 640px) 152px, 128px"
              alt=""
              width={930}
              height={1163}
              loading="lazy"
              decoding="async"
              className={cn("absolute inset-0 h-full w-full object-contain", hoverZoom)}
            />
          </span>
          <span className="flex flex-col gap-1.5 px-3 pb-3 pt-2.5 md:gap-2 md:px-4 md:pb-4 md:pt-3">
            <span className={cn(headlineClass, "text-[17px] sm:text-lg md:text-[22px]")}>{ANJYS_BAGS.headline}</span>
            <span className={cn(blushText, "text-[10px] uppercase leading-[14px] tracking-[0.14em] md:text-[11px]")}>
              {ANJYS_BAGS.cta}
            </span>
          </span>
        </span>
        <span className="mt-2 flex h-5 items-center gap-2">
          <span className="shrink-0 rounded-full bg-muted px-2 text-[10px] font-semibold uppercase leading-[18px] tracking-[0.1em] text-muted-foreground">
            Sponsored
          </span>
          <span className={cn("line-clamp-1 text-sm font-medium leading-5 text-foreground", hoverTitle)}>
            {ANJYS_BAGS.name}
          </span>
        </span>
      </SponsorLink>
    </SponsorImpression>
  );
}
