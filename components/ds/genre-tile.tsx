import Image from "next/image";

import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { groupFocusRing, hoverTitle, hoverZoom, pressable } from "./classes";
import { IntentLink } from "./intent-link";

export interface GenreTileProps {
  href: string;
  name: string;
  /** A TMDB backdrop path for a title in this genre. Null shows an empty muted frame. */
  imagePath: string | null;
  /** Defaults to the home genre grid (2 columns, 4 from md). */
  sizes?: string;
  className?: string;
}

const DEFAULT_SIZES = "(min-width:1440px) 340px, (min-width:768px) 25vw, 50vw";

/** 16:9 backdrop with the genre name below it (never on the image). Server-safe. */
export function GenreTile({ href, name, imagePath, sizes, className }: GenreTileProps) {
  const src = tmdbImage(imagePath);

  return (
    <IntentLink
      href={href}
      className={cn("group block rounded-media focus-visible:outline-none", pressable, className)}
    >
      <span
        className={cn("relative block aspect-video overflow-hidden rounded-media bg-muted", groupFocusRing)}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes ?? DEFAULT_SIZES}
            className={cn("object-cover", hoverZoom)}
          />
        ) : null}
      </span>
      <span className={cn("mt-2 block text-[15px] font-medium leading-5 text-foreground", hoverTitle)}>
        {name}
      </span>
    </IntentLink>
  );
}
