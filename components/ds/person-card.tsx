import Image from "next/image";

import { getInitials } from "@/lib/format";
import { IMAGE_SIZES, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { groupFocusRing, hoverTitle, hoverZoom, pressable, railWidths } from "./classes";
import { IntentLink } from "./intent-link";

export interface PersonCardProps {
  href: string;
  name: string;
  profilePath: string | null;
  /** Character or job. */
  role?: string | null;
  /** md: 80px avatar (rails), lg: 112px. */
  size?: "md" | "lg";
  className?: string;
}

/**
 * Circle avatar with the name and role centered below. Missing photos show
 * initials on bg-muted. Server-safe.
 */
export function PersonCard({ href, name, profilePath, role, size = "md", className }: PersonCardProps) {
  const src = tmdbImage(profilePath);
  const lg = size === "lg";

  return (
    <IntentLink
      href={href}
      className={cn(
        "group flex flex-col items-center rounded-panel text-center focus-visible:outline-none",
        pressable,
        lg ? railWidths.personLg : railWidths.person,
        className,
      )}
    >
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-full bg-muted",
          lg ? "size-28" : "size-20",
          groupFocusRing,
        )}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={lg ? "112px" : IMAGE_SIZES.avatar}
            className={cn("object-cover object-top", hoverZoom)}
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 flex items-center justify-center font-display font-bold text-subtle-foreground",
              lg ? "text-3xl" : "text-xl",
            )}
          >
            {getInitials(name)}
          </span>
        )}
      </span>
      <span className={cn("mt-2 line-clamp-2 w-full text-sm font-medium leading-5 text-foreground", hoverTitle)}>
        {name}
      </span>
      {role ? (
        <span className="mt-0.5 line-clamp-2 w-full text-[13px] leading-[18px] text-subtle-foreground">
          {role}
        </span>
      ) : null}
    </IntentLink>
  );
}
