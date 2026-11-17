/**
 * The donate mark: a coin dropping into a coffee cup. Flat strokes in the text colour and a
 * coral coin, no gradients. The coin drops in once when it appears; with reduced motion it
 * simply sits in the cup. Decorative only.
 *
 * `clipId` must be unique on the page if the mark is shown more than once.
 */
export function CoinCup({ className, clipId = "coin-cup-clip" }: { className?: string; clipId?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <clipPath id={clipId}>
          {/* Everything above the rim: the part of the coin not yet in the cup. */}
          <rect x="0" y="0" width="96" height="46" />
        </clipPath>
      </defs>

      {/* Drop trail */}
      <path d="M37 10v6M51 6v6" className="stroke-muted-foreground" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

      <g clipPath={`url(#${clipId})`}>
        <g className="motion-safe:animate-coin-drop">
          <circle cx="44" cy="40" r="11" className="fill-primary" />
          <circle cx="44" cy="40" r="6" className="stroke-primary-foreground" strokeWidth="2" opacity="0.5" />
        </g>
      </g>

      {/* Cup, handle and saucer */}
      <g className="stroke-foreground" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 46H66L62.5 72A7 7 0 0 1 55.6 78H32.4A7 7 0 0 1 25.5 72Z" />
        <path d="M65.2 52H70A7 7 0 0 1 70 66H63.4" />
        <path d="M16 85H72" />
      </g>
    </svg>
  );
}
