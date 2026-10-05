import Image from "next/image";

import { IMAGE_SIZES, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import {
  groupFocusRing,
  groupFocusRingPopover,
  hoverTitle,
  hoverZoom,
  pressable,
  railWidths,
} from "./classes";
import { IntentLink } from "./intent-link";

export interface LandscapeCardProps {
  /** Link target. Without it the card renders as a plain, non-interactive block. */
  href?: string;
  /** Optional accessible name override for the link (or for a wrapping button). */
  onClickLabel?: string;
  title: string;
  /** TMDB backdrop or still path. */
  imagePath: string | null;
  /** Full image URL that overrides imagePath (for example a YouTube thumbnail). Rendered as a plain lazy <img>. */
  imageSrc?: string;
  subtitle?: string | null;
  meta?: string | null;
  priority?: boolean;
  /** Overrides the default sizes (landscapeRail for width="rail", 100vw-based for "fill"). */
  sizes?: string;
  className?: string;
  /** "rail": w-[75vw] sm:w-[280px] lg:w-80; "fill": 100% of the parent. */
  width?: "rail" | "fill";
}

export type LandscapeCardInnerProps = Omit<
  LandscapeCardProps,
  "href" | "onClickLabel" | "width" | "className"
> & {
  className?: string;
  /** Picks the default `sizes` when none is passed: rail widths or a fluid grid cell. */
  width?: "rail" | "fill";
  /** Set when the card sits on a modal surface so the focus ring offset matches bg-popover. */
  onPopover?: boolean;
};

const FILL_SIZES = "(min-width:1280px) 25vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw";

/**
 * The card body without any link: 16:9 frame plus title, subtitle and meta
 * below. Built from spans only, so it is valid inside a <button> (client
 * wrappers such as VideoRail) as well as inside a link. The parent must carry
 * the "group" class for hover and focus styles.
 */
export function LandscapeCardInner({
  title,
  imagePath,
  imageSrc,
  subtitle,
  meta,
  priority = false,
  sizes,
  className,
  width = "rail",
  onPopover = false,
}: LandscapeCardInnerProps) {
  const src = imageSrc ? null : tmdbImage(imagePath);

  return (
    <span className={cn("block text-left", className)}>
      <span
        className={cn(
          "relative block aspect-video overflow-hidden rounded-media bg-muted",
          onPopover ? groupFocusRingPopover : groupFocusRing,
        )}
      >
        {imageSrc ? (
          // External thumbnails (YouTube) skip next/image and the TMDB loader on purpose.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            width={480}
            height={360}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn("absolute inset-0 h-full w-full object-cover", hoverZoom)}
          />
        ) : src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes ?? (width === "fill" ? FILL_SIZES : IMAGE_SIZES.landscapeRail)}
            priority={priority}
            className={cn("object-cover", hoverZoom)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center p-4 text-center text-[13px] leading-snug text-subtle-foreground"
          >
            <span className="line-clamp-3">{title}</span>
          </span>
        )}
      </span>
      <span className="mt-2 block">
        <span className={cn("line-clamp-1 text-sm font-medium leading-5 text-foreground", hoverTitle)}>
          {title}
        </span>
        {subtitle ? (
          <span className="line-clamp-1 text-[13px] leading-[18px] text-muted-foreground">{subtitle}</span>
        ) : null}
        {meta ? (
          <span className="line-clamp-1 text-[13px] leading-[18px] text-subtle-foreground tabular-nums">
            {meta}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * 16:9 still or backdrop card with text below. Presentational and
 * server-safe: for click handlers, render LandscapeCardInner inside your own
 * <button className="group ..."> in a client component.
 */
export function LandscapeCard({
  href,
  onClickLabel,
  width = "rail",
  className,
  ...inner
}: LandscapeCardProps) {
  const widthClass = width === "rail" ? railWidths.landscape : "w-full";

  if (href) {
    return (
      <IntentLink
        href={href}
        aria-label={onClickLabel}
        className={cn(
          "group block rounded-media focus-visible:outline-none",
          pressable,
          widthClass,
          className,
        )}
      >
        <LandscapeCardInner {...inner} width={width} />
      </IntentLink>
    );
  }

  return (
    <div className={cn("group block", widthClass, className)}>
      <LandscapeCardInner {...inner} width={width} />
    </div>
  );
}
