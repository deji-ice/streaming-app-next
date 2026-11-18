"use client";

import { groupFocusRing, hoverTitle, hoverZoom, pressable, railWidths } from "@/components/ds/classes";
import { ANJYS_BAGS, sponsorHref, sponsorImage, sponsorSrcSet } from "@/lib/sponsor";
import { cn } from "@/lib/utils";

import { blushText, bodyFont, headlineClass, PHOTO_WIDTHS, plumSurface } from "./brand";
import { SponsorImpression, SponsorLink } from "./sponsor-tracking";
import { useShuffled } from "./use-shuffled";

/**
 * Poster-sized product ad for a rail: a random bag on white over a plum panel
 * with its name, its price and the button text, linking to that bag's
 * page. Under it, "Anjy's Bags" sits where a poster has its title and the
 * "Sponsored" chip where a poster has its year, so it fits a 128px phone tile.
 * Same width and press feedback as PosterCard so the rail keeps its rhythm. The
 * caller checks SPONSOR_ADS_ENABLED (a Rail gives every child a slot, even one
 * that renders nothing).
 */
export function SponsorTile() {
  const bag = useShuffled(ANJYS_BAGS.products)[0];

  return (
    <SponsorImpression placement="row_tile" className={railWidths.poster}>
      <SponsorLink
        href={sponsorHref(bag.path, "row_tile")}
        placement="row_tile"
        item={bag.name}
        ariaLabel={`Sponsored: get the ${bag.name}, ${bag.price}, from ${ANJYS_BAGS.name} (opens in a new tab)`}
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
              src={sponsorImage(bag.image, 360)}
              srcSet={sponsorSrcSet(bag.image, PHOTO_WIDTHS)}
              sizes="(min-width: 1280px) 208px, (min-width: 1024px) 192px, (min-width: 768px) 176px, (min-width: 640px) 152px, 128px"
              alt=""
              width={930}
              height={1163}
              loading="lazy"
              decoding="async"
              className={cn("absolute inset-0 h-full w-full object-contain", hoverZoom)}
            />
          </span>
          <span className="flex flex-col gap-0.5 px-3 pb-3 pt-2.5 md:gap-1 md:px-4 md:pb-4 md:pt-3">
            <span className={cn(headlineClass, "line-clamp-2 text-[17px] sm:text-lg md:text-[22px]")}>{bag.name}</span>
            <span className={cn(blushText, "text-[13px] leading-5 tabular-nums md:text-sm")}>{bag.price}</span>
            <span className="mt-1 whitespace-nowrap text-[10px] uppercase leading-[14px] tracking-[0.06em] text-[#FDFAF9] sm:tracking-[0.14em] md:text-[11px]">
              {ANJYS_BAGS.buyCta} →
            </span>
          </span>
        </span>
        <span className="mt-2 block">
          <span className={cn("line-clamp-1 text-sm font-medium leading-5 text-foreground", hoverTitle)}>
            {ANJYS_BAGS.name}
          </span>
          <span className="flex h-5 items-center">
            <span className="rounded-full bg-muted px-2 text-[10px] font-semibold uppercase leading-[18px] tracking-[0.1em] text-muted-foreground">
              Sponsored
            </span>
          </span>
        </span>
      </SponsorLink>
    </SponsorImpression>
  );
}
