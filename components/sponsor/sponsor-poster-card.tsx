"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { ANJYS_BAGS, sponsorHref, sponsorImage, sponsorSrcSet } from "@/lib/sponsor";
import { cn } from "@/lib/utils";

import { blushText, bodyFont, headlineClass, PHOTO_WIDTHS, pillClass, plumFocusRing, plumSurface } from "./brand";
import { sponsorDropClass, SponsorImpression, SponsorLink } from "./sponsor-tracking";
import { useShuffled } from "./use-shuffled";

const DISMISS_KEY = "ssx-sponsor-poster-dismissed";

/**
 * Sponsor bar over the player's poster screen, shown until the viewer presses
 * Play (the poster, and this bar with it, then unmounts) or closes it. It sits
 * on the poster only and never touches the stream.
 *
 * A product ad: the bag's photo, name and price, linking to its page. Phones
 * get a slim bar along the bottom (photo, name, price and "Get this bag"); from md
 * it is a centred bar inside the middle 80% of the player with the button, from
 * lg the logo, and from xl the web address moves beside the button. The close button hides it for the
 * browser session. Rendered after mount so a closed bar never flashes back in;
 * it is absolutely positioned, so appearing late shifts nothing.
 *
 * The parent marks itself `group/poster`; the bar carries data-sponsor-card so the
 * play button can lift above it on phones (see VideoPlayer).
 */
export function SponsorPosterCard() {
  const [visible, setVisible] = useState(false);
  const bag = useShuffled(ANJYS_BAGS.products)[0];

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Storage blocked: show it; closing still works for this page view.
    }
    setVisible(!dismissed);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    trackEvent("sponsor_dismiss", { sponsor: ANJYS_BAGS.id, placement: "player_poster" });
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage blocked: it stays closed until the next page load.
    }
  };


  return (
    <div
      data-sponsor-card
      className="absolute inset-x-2 bottom-2 z-10 md:inset-x-auto md:bottom-6 md:left-1/2 md:w-[min(960px,80%)] md:-translate-x-1/2"
    >
      <SponsorImpression placement="player_poster" label={`Sponsored: ${ANJYS_BAGS.name}`}>
        <div
          className={cn(
            // The drop sits here, not on the positioned wrapper: its keyframes set transform,
            // which would undo the wrapper's centring translate while it runs.
            "relative flex h-14 overflow-hidden rounded-media md:h-24 md:rounded-panel",
            sponsorDropClass,
            plumSurface,
            bodyFont.className,
          )}
        >
          <SponsorLink
            href={sponsorHref(bag.path, "player_poster")}
            placement="player_poster"
            item={bag.name}
            ariaLabel={`Sponsored: get the ${bag.name}, ${bag.price}, from ${ANJYS_BAGS.name} (opens in a new tab)`}
            className="group flex min-w-0 flex-1 items-center gap-3 pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FDFAF9] md:gap-5 md:pr-16"
          >
            <span className="relative block h-full w-14 shrink-0 bg-white md:w-24 lg:w-32">
              {/* Cloudinary resizes the photo; next/image would send it through the TMDB loader. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsorImage(bag.image, 240)}
                srcSet={sponsorSrcSet(bag.image, PHOTO_WIDTHS)}
                sizes="(min-width: 1024px) 128px, (min-width: 768px) 96px, 56px"
                alt=""
                width={930}
                height={1163}
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain py-1 md:py-2"
              />
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ANJYS_BAGS.logo.src}
              alt=""
              width={ANJYS_BAGS.logo.width}
              height={ANJYS_BAGS.logo.height}
              decoding="async"
              className="hidden size-16 shrink-0 lg:block"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className={cn(blushText, "text-[9px] uppercase leading-3 tracking-[0.14em] md:text-[10px] md:leading-4")}>
                Sponsored
              </span>
              <span className={cn(headlineClass, "truncate text-base md:text-[22px] lg:text-[26px]")}>
                {bag.name}
              </span>
              <span className={cn(blushText, "truncate text-xs leading-4 tabular-nums md:text-sm md:leading-5")}>
                {bag.price}
                {/* Phones have no room for the button, so the ask goes here instead of the address. */}
                <span className="text-[#FDFAF9] md:hidden"> · {ANJYS_BAGS.buyCta} →</span>
                <span className="hidden md:inline xl:hidden"> · {ANJYS_BAGS.displayUrl}</span>
              </span>
            </span>
            <span className={cn(pillClass, "hidden group-hover:bg-white md:inline-flex")}>{ANJYS_BAGS.buyCta}</span>
            <span className={cn(blushText, "hidden shrink-0 text-sm xl:inline")}>{ANJYS_BAGS.displayUrl}</span>
          </SponsorLink>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Hide ad"
            className={cn(
              "absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-150 ease-out hover:text-[#FDFAF9] md:right-3",
              blushText,
              plumFocusRing,
            )}
          >
            <XIcon size={18} aria-hidden="true" />
          </button>
        </div>
      </SponsorImpression>
    </div>
  );
}
