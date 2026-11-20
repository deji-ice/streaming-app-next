import Image from "next/image";

import { IMAGE_SIZES, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

import { playerHeight } from "./layout-classes";

/**
 * Stands in for the player on titles taken down after a copyright notice (lib/takedowns.ts).
 * Same box as the player's poster screen, with no play button and no stream sources. The
 * rest of the page (details, trailer, "Streaming on") stays.
 */
export function UnavailablePlayer({
  backdropPath,
  hasWatchOptions,
}: {
  backdropPath: string | null;
  hasWatchOptions: boolean;
}) {
  const src = tmdbImage(backdropPath);
  return (
    <div className={cn("relative w-full overflow-hidden bg-muted", playerHeight)}>
      {src ? <Image src={src} alt="" fill sizes={IMAGE_SIZES.player} className="object-cover" priority /> : null}
      <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-gutter text-center">
        <p className="font-display text-xl font-semibold text-white md:text-2xl">Not available to watch here</p>
        <p className="max-w-md text-sm text-white/80 md:text-base">
          This title was removed after a copyright notice.
          {hasWatchOptions ? (
            <>
              {" "}
              <a
                href="#streaming-on-heading"
                className="rounded-sm font-medium text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                See where it&apos;s streaming
              </a>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
