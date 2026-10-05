import Image from "next/image";

import { groupFocusRing, hoverTitle, hoverZoom, pressable, railWidths } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { Rating } from "@/components/ds/rating";
import { IMAGE_SIZES, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

export interface CreditCardProps {
  href: string;
  title: string;
  posterPath: string | null;
  /** Character or job(s), shown under the title. */
  role?: string | null;
  year?: number | null;
  /** TMDB vote_average, hidden when null. Ignored when dateLine is set. */
  rating?: number | null;
  /** TV credits get a "Series" label. */
  isSeries?: boolean;
  /** Replaces year and rating, for unreleased credits: "Dec 15, 2026" or "Announced". */
  dateLine?: string | null;
}

/**
 * Rail card for one credit of a person: same poster frame as PosterCard, with
 * the role and (for unreleased credits) the release date line that PosterCard
 * has no prop for. Server-safe, fixed rail width.
 */
export function CreditCard({ href, title, posterPath, role, year, rating, isSeries = false, dateLine }: CreditCardProps) {
  const src = tmdbImage(posterPath);

  return (
    <IntentLink
      href={href}
      className={cn("group block rounded-media focus-visible:outline-none", pressable, railWidths.poster)}
    >
      <span className={cn("relative block aspect-[2/3] overflow-hidden rounded-media bg-muted", groupFocusRing)}>
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={IMAGE_SIZES.posterRail}
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
        <span className={cn("line-clamp-1 text-sm font-medium leading-5 text-foreground", hoverTitle)}>{title}</span>
        {/* Always one line tall, so the date and rating lines line up across cards in a rail. */}
        <span className="line-clamp-1 min-h-5 text-[13px] leading-5 text-muted-foreground">{role}</span>
        <span className="flex h-5 items-center gap-3 text-[13px] leading-5 text-subtle-foreground tabular-nums">
          {dateLine ? <span>{dateLine}</span> : year ? <span>{year}</span> : null}
          {isSeries ? <span>Series</span> : null}
          {dateLine ? null : <Rating value={rating} />}
        </span>
      </span>
    </IntentLink>
  );
}
