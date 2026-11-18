"use client";

import { focusRing } from "@/components/ds/classes";
import { pageWrapper } from "@/components/details/layout-classes";
import { ANJYS_BAGS, SPONSOR_ADS_ENABLED, sponsorHref, sponsorImage, sponsorSrcSet } from "@/lib/sponsor";
import { cn } from "@/lib/utils";

import {
  blushText,
  bodyFont,
  headlineClass,
  PHOTO_WIDTHS,
  pillClass,
  plumSurface,
  sponsoredLabel,
} from "./brand";
import { SponsorImpression, SponsorLink } from "./sponsor-tracking";
import { useShuffled } from "./use-shuffled";

/**
 * Banner on the movie and series pages, between the overview/details and the
 * cast rail (not under the player). A product ad: one bag (random per page
 * view) on a white panel (about 45%), and on Deep Plum the logo, the bag's
 * name, its price and delivery time, the button and the web address. The whole
 * banner links to that bag's page. Below md the logo drops out and below sm the
 * delivery time, so the name, price and button stay readable on a phone.
 */
export function SponsorBanner({ className }: { className?: string }) {
  // The second bag of the page's order: the poster bar on the same page shows the first.
  const bag = useShuffled(ANJYS_BAGS.products)[1] ?? ANJYS_BAGS.products[0];
  if (!SPONSOR_ADS_ENABLED) return null;

  return (
    <div className={cn(pageWrapper, className)}>
      <SponsorImpression placement="detail_banner" className="max-w-[1040px]" reveal>
        <SponsorLink
          href={sponsorHref(bag.path, "detail_banner")}
          placement="detail_banner"
          item={bag.name}
          ariaLabel={`Sponsored: get the ${bag.name}, ${bag.price}, from ${ANJYS_BAGS.name} (opens in a new tab)`}
          className={cn(
            "group grid grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-panel sm:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]",
            plumSurface,
            bodyFont.className,
            focusRing,
          )}
        >
          <span className="relative block min-h-[168px] bg-white md:min-h-[216px]">
            {/* Cloudinary resizes the photo; next/image would send it through the TMDB loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sponsorImage(bag.image, 480)}
              srcSet={sponsorSrcSet(bag.image, PHOTO_WIDTHS)}
              sizes="(min-width: 640px) 240px, 140px"
              alt=""
              width={930}
              height={1163}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain py-3 transition-transform duration-150 ease-out [@media(hover:hover)]:group-hover:scale-[1.04]"
            />
          </span>
          <span className="flex items-center gap-6 p-4 sm:p-6 md:gap-8 md:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ANJYS_BAGS.logo.src}
              alt=""
              width={ANJYS_BAGS.logo.width}
              height={ANJYS_BAGS.logo.height}
              loading="lazy"
              decoding="async"
              className="hidden size-24 shrink-0 md:block lg:size-28"
            />
            <span className="flex min-w-0 flex-col items-start gap-2 md:gap-3">
              <span className={sponsoredLabel}>Sponsored</span>
              <span className={cn(headlineClass, "text-2xl md:text-[34px]")}>{bag.name}</span>
              <span className={cn(blushText, "text-sm leading-5 tabular-nums")}>
                <span className="text-base text-[#FDFAF9]">{bag.price}</span>
                <span className="hidden sm:inline"> · {ANJYS_BAGS.delivery}</span>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className={cn(pillClass, "max-sm:px-4 max-sm:text-[11px] group-hover:bg-white")}>
                  {ANJYS_BAGS.buyCta}
                </span>
                <span className={cn(blushText, "text-sm")}>{ANJYS_BAGS.displayUrl}</span>
              </span>
            </span>
          </span>
        </SponsorLink>
      </SponsorImpression>
    </div>
  );
}
