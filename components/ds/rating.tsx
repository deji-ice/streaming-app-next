import { Star } from "@phosphor-icons/react/dist/ssr";

import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface RatingProps {
  /** TMDB vote_average (0-10). 0, null and undefined render nothing. */
  value: number | null | undefined;
  /** TMDB vote_count, shown as "(12.3K)". */
  votes?: number | null;
  /** Adds the "TMDB" source label. The score is TMDB's, never label it IMDb. */
  showSource?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Star (fill, coral) + score with one decimal + optional source and vote count. */
export function Rating({ value, votes, showSource = false, size = "sm", className }: RatingProps) {
  if (!value || !Number.isFinite(value) || value <= 0) return null;
  const votesText = votes && votes > 0 ? formatCompact(votes) : null;
  const md = size === "md";

  return (
    <span
      className={cn(
        "inline-flex items-center tabular-nums",
        md ? "gap-1.5 text-sm" : "gap-1 text-[13px]",
        className,
      )}
    >
      <Star weight="fill" size={md ? 16 : 12} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="sr-only">Rating: </span>
      <span className={md ? "font-semibold text-foreground" : undefined}>{value.toFixed(1)}</span>
      <span className="sr-only"> out of 10</span>
      {showSource ? <span className="text-subtle-foreground">TMDB</span> : null}
      {votesText ? (
        <span className="text-subtle-foreground">
          ({votesText}
          <span className="sr-only"> votes</span>)
        </span>
      ) : null}
    </span>
  );
}
