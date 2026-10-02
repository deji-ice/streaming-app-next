import type { ReactNode } from "react";

import { playerBand, playerFrame } from "./layout-classes";

/**
 * Full-width black band with the player centered inside. The frame width is
 * capped by the viewport height (see layout-classes), so on desktop the title
 * header below it is visible in the first viewport.
 */
export function PlayerBand({ children }: { children: ReactNode }) {
  return (
    <div className={playerBand}>
      <div className={playerFrame}>{children}</div>
    </div>
  );
}
