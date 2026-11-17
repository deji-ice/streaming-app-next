"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";
import { ANJYS_BAGS, type SponsorPlacement } from "@/lib/sponsor";
import { cn } from "@/lib/utils";

/** Plays the drop-and-squash entrance (tailwind.config.ts, "sponsor-drop"). Off for reduced motion. */
export const sponsorDropClass = "origin-bottom motion-safe:animate-sponsor-drop";

/**
 * Wraps a sponsor unit and sends one sponsor_impression to GA4 the first time
 * half of it is on screen. Server children pass straight through.
 *
 * With `reveal`, the unit also drops into place the first time a quarter of it
 * scrolls into view. It is only hidden after hydration, and only while it is
 * still below the fold, so it never vanishes without JavaScript and never blinks
 * out when it is already on screen. Reduced motion skips both the hiding and the drop.
 */
export function SponsorImpression({
  placement,
  className,
  label,
  reveal = false,
  children,
}: {
  placement: SponsorPlacement;
  className?: string;
  /** Accessible name of the region, for example "Sponsored: Anjy's Bags". */
  label?: string;
  reveal?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<"static" | "waiting" | "dropping">("static");

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    let counted = false;
    let revealed = !reveal;
    if (reveal) {
      const box = element.getBoundingClientRect();
      if (box.top >= window.innerHeight) setStage("waiting");
      else revealed = true; // Already on screen: leave it as it is.
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const ratio = Math.max(...entries.map((entry) => (entry.isIntersecting ? entry.intersectionRatio : 0)));
        if (!revealed && ratio >= 0.25) {
          revealed = true;
          setStage("dropping");
        }
        if (!counted && ratio >= 0.5) {
          counted = true;
          trackEvent("sponsor_impression", { sponsor: ANJYS_BAGS.id, placement });
        }
        if (counted && revealed) observer.disconnect();
      },
      { threshold: [0.25, 0.5] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [placement, reveal]);

  return (
    <div
      ref={ref}
      className={cn(
        className,
        stage === "waiting" && "motion-safe:opacity-0",
        stage === "dropping" && sponsorDropClass,
      )}
      role={label ? "region" : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}

/** Link to the sponsor's store: new tab, marked sponsored, click sent to GA4. */
export function SponsorLink({
  href,
  placement,
  item,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  placement: SponsorPlacement;
  /** What was clicked: a product name, or "store" for the store link. */
  item: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener"
      aria-label={ariaLabel}
      className={className}
      onClick={() => trackEvent("sponsor_click", { sponsor: ANJYS_BAGS.id, placement, item })}
    >
      {children}
    </a>
  );
}
