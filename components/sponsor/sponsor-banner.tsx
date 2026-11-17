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

/**
 * Banner on the movie and series pages, between the overview/details and the
 * cast rail (not under the player). Laid out from the store's brief: one bag on a white panel (about 45%), and on Deep Plum the
 * logo, headline, short line, button and web address. The whole banner is one
 * link to the store. Below sm the logo and the short line drop out first, so
 * the headline and the button stay readable on a phone.
 */
export function SponsorBanner({ className }: { className?: string }) {
  if (!SPONSOR_ADS_ENABLED) return null;
  const { hero } = ANJYS_BAGS;

  return (
    <div className={cn(pageWrapper, className)}>
      <SponsorImpression placement="detail_banner" className="max-w-[1040px]" reveal>
        <SponsorLink
          href={sponsorHref(ANJYS_BAGS.homePath, "detail_banner")}
          placement="detail_banner"
          item="store"
          ariaLabel={`Sponsored: shop ${ANJYS_BAGS.name} (opens in a new tab)`}
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
              src={sponsorImage(hero.image, 480)}
              srcSet={sponsorSrcSet(hero.image, PHOTO_WIDTHS)}
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
              <span className={cn(headlineClass, "text-2xl md:text-[34px]")}>{ANJYS_BAGS.headline}</span>
              <span className={cn(blushText, "hidden text-sm leading-5 sm:block")}>{ANJYS_BAGS.line}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className={cn(pillClass, "max-sm:px-4 max-sm:text-[11px] group-hover:bg-white")}>
                  {ANJYS_BAGS.cta}
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
