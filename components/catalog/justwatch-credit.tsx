import { cn } from "@/lib/utils";

import { inlineLink } from "./styles";

/**
 * Streaming availability comes from JustWatch through TMDB; TMDB's terms ask
 * every surface that shows it to credit JustWatch. Inline (a span), so it can
 * sit inside a paragraph or a SectionHeader description.
 */
export function JustWatchCredit({ className }: { className?: string }) {
  return (
    <span className={cn(className)}>
      Availability data by{" "}
      <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" className={inlineLink}>
        JustWatch
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </span>
  );
}
