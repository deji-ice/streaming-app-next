"use client";

import Link from "next/link";
import type { ComponentProps, KeyboardEvent } from "react";

export type ToggleLinkProps = Omit<ComponentProps<typeof Link>, "prefetch" | "role" | "aria-pressed"> & {
  /** Whether the option this link toggles is currently on. */
  pressed: boolean;
};

/**
 * A real link (works without JavaScript, opens in a new tab on Ctrl+click)
 * that behaves as a toggle button for assistive technology: role="button"
 * with aria-pressed. A native button also activates on Space, so this does
 * too; a plain link would scroll the page instead.
 */
export function ToggleLink({ pressed, onKeyDown, onKeyUp, ...rest }: ToggleLinkProps) {
  return (
    <Link
      {...rest}
      prefetch={false}
      role="button"
      aria-pressed={pressed}
      onKeyDown={(event: KeyboardEvent<HTMLAnchorElement>) => {
        onKeyDown?.(event);
        if (event.key === " ") event.preventDefault();
      }}
      onKeyUp={(event: KeyboardEvent<HTMLAnchorElement>) => {
        onKeyUp?.(event);
        if (event.key === " ") event.currentTarget.click();
      }}
    />
  );
}
