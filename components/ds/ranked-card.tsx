import { cn } from "@/lib/utils";

import { PosterCard, type PosterCardProps } from "./poster-card";

export type RankedPosterCardProps = PosterCardProps & { rank: number };

/**
 * Top 10 card: a big outlined display numeral beside a rail-width poster.
 * The numeral is decorative; the link is named "Number {rank}: {title}".
 * Server-safe.
 */
export function RankedPosterCard({ rank, className, ...poster }: RankedPosterCardProps) {
  return (
    <div className={cn("flex items-end", className)}>
      <span
        aria-hidden="true"
        className="mr-1 select-none pb-12 font-display text-[5rem] font-extrabold leading-[0.8] tracking-tight text-transparent [-webkit-text-stroke:2px_rgb(var(--subtle-foreground))] [font-stretch:75%] md:mr-2 md:text-[7rem]"
      >
        {rank}
      </span>
      <PosterCard {...poster} width="rail" ariaLabel={`Number ${rank}: ${poster.title}`} />
    </div>
  );
}
