import Image from "next/image";

import { formatYear } from "@/lib/format";
import { IMAGE_SIZES, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { groupFocusRing, hoverTitle, hoverZoom, pressable, railWidths } from "./classes";
import { IntentLink } from "./intent-link";
import { Rating } from "./rating";

export interface PosterCardProps {
  href: string;
  title: string;
  posterPath: string | null;
  /** A year (2024), or a TMDB date ("2024-03-01") which is reduced to its year. */
  year?: string | number | null;
  /** TMDB vote_average 0-10, one decimal, hidden when 0 or null. */
  rating?: number | null;
  /** Extra line under the title, for example a character name, "Series" or "S2 E5". */
  subtitle?: string | null;
  priority?: boolean;
  /** Overrides the default sizes (posterRail for width="rail", posterGrid for width="fill"). */
  sizes?: string;
  className?: string;
  /** "rail": fixed rail widths; "fill": 100% of the grid cell. */
  width?: "rail" | "fill";
  /** Replaces the link's accessible name (used by RankedPosterCard). */
  ariaLabel?: string;
}

function yearLabel(year: PosterCardProps["year"]): string | null {
  if (year === null || year === undefined || year === "") return null;
  if (typeof year === "number") return String(year);
  return formatYear(year) ?? year;
}

/**
 * Poster (2:3) with the title and meta below it, on the page surface.
 * No overlays on the image. Server-safe: no hooks.
 */
export function PosterCard({
  href,
  title,
  posterPath,
  year,
  rating,
  subtitle,
  priority = false,
  sizes,
  className,
  width = "rail",
  ariaLabel,
}: PosterCardProps) {
  const src = tmdbImage(posterPath);
  const yearText = yearLabel(year);

  return (
    <IntentLink
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "group block rounded-media focus-visible:outline-none",
        pressable,
        width === "rail" ? railWidths.poster : "w-full",
        className,
      )}
    >
      <span
        className={cn(
          "relative block aspect-[2/3] overflow-hidden rounded-media bg-muted",
          groupFocusRing,
        )}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes ?? (width === "rail" ? IMAGE_SIZES.posterRail : IMAGE_SIZES.posterGrid)}
            priority={priority}
            className={cn("object-cover", hoverZoom)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center p-3 text-center text-[13px] leading-snug text-subtle-foreground"
          >
            <span className="line-clamp-4">{title}</span>
          </span>
        )}
      </span>
      <span className="mt-2 block">
        <span className={cn("line-clamp-1 text-sm font-medium leading-5 text-foreground", hoverTitle)}>
          {title}
        </span>
        {subtitle ? (
          <span className="line-clamp-1 text-[13px] leading-5 text-muted-foreground">{subtitle}</span>
        ) : null}
        <span className="flex h-5 items-center gap-3 text-[13px] leading-5 text-subtle-foreground tabular-nums">
          {yearText ? <span>{yearText}</span> : null}
          <Rating value={rating} />
        </span>
      </span>
    </IntentLink>
  );
}
