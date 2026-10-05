import { TrashIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

import { focusRing } from "./classes";

/**
 * "Remove" action that sits under a card, as a sibling of the card link (never
 * inside it) and always visible. 44px tall on touch screens, 36px from md.
 * The negative left margin lines the icon up with the card text above.
 */
export function RemoveButton({
  title,
  from,
  onClick,
}: {
  /** Title of the item, for the accessible name. */
  title: string;
  /** Where it is removed from, for example "watchlist". */
  from: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Remove ${title} from ${from}`}
      className={cn(
        "-ml-3 inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-destructive active:scale-[0.98] md:h-9",
        focusRing,
      )}
    >
      <TrashIcon size={16} aria-hidden="true" />
      Remove
    </button>
  );
}
