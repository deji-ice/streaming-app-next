import type { ReactNode } from "react";

import { playerBand, playerFrame } from "./layout-classes";

/**
 * Full-width black band holding the player. The player's height is capped
 * (see layout-classes), so a strip of the page always shows below it in the
 * first viewport.
 */
export function PlayerBand({ children }: { children: ReactNode }) {
  return (
    <div className={playerBand}>
      <div className={playerFrame}>{children}</div>
    </div>
  );
}
