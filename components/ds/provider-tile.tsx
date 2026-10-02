import Image from "next/image";

import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { groupFocusRing, hoverTitle, pressable, railWidths } from "./classes";
import { IntentLink } from "./intent-link";

export interface ProviderTileProps {
  href: string;
  name: string;
  /** TMDB watch provider logo_path (square app icon). */
  logoPath: string | null;
  className?: string;
  /** "rail" (default): 88px, 104px md+. "fill": 100% of a grid cell. */
  width?: "rail" | "fill";
}

const RAIL_SIZES = "(min-width:768px) 104px, 88px";
const FILL_SIZES = "(min-width:1024px) 160px, (min-width:640px) 20vw, 33vw";

/** Square streaming-service logo with its name below. Server-safe. */
export function ProviderTile({ href, name, logoPath, className, width = "rail" }: ProviderTileProps) {
  const src = tmdbImage(logoPath);

  return (
    <IntentLink
      href={href}
      className={cn(
        "group block rounded-media focus-visible:outline-none",
        pressable,
        width === "rail" ? railWidths.provider : "w-full",
        className,
      )}
    >
      <span
        className={cn("relative block aspect-square overflow-hidden rounded-media bg-muted", groupFocusRing)}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={width === "rail" ? RAIL_SIZES : FILL_SIZES}
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center p-2 text-center text-[13px] leading-snug text-subtle-foreground"
          >
            <span className="line-clamp-3">{name}</span>
          </span>
        )}
      </span>
      <span className={cn("mt-2 line-clamp-1 text-[13px] leading-[18px] text-muted-foreground", hoverTitle)}>
        {name}
      </span>
    </IntentLink>
  );
}
