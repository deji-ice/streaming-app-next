/**
 * Shared class strings for the design-system kit (components/ds).
 * Plain constants, safe to import from Server and Client Components.
 */

/** Visible focus ring for interactive elements on the page background. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Focus ring for interactive elements that sit on a modal or menu surface (bg-popover). */
export const focusRingPopover =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover";

/** Draws the focus ring on a media frame when its parent link (".group") has keyboard focus. */
export const groupFocusRing =
  "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background";

/** Same as groupFocusRing for cards that sit on a modal surface (bg-popover). */
export const groupFocusRingPopover =
  "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-popover";

/** Image zoom on card hover. Only on devices that really hover, so taps never stick. */
export const hoverZoom =
  "transition-transform duration-150 ease-out [@media(hover:hover)]:group-hover:scale-[1.04]";

/** Card title turns coral on hover (hover-capable devices only). */
export const hoverTitle =
  "transition-colors duration-150 ease-out [@media(hover:hover)]:group-hover:text-primary";

/** Press feedback for cards and buttons. */
export const pressable = "transition-transform duration-150 ease-out active:scale-[0.98]";

/** Pill button base: 44px tall (touch target), full radius. */
export const pillBase =
  "inline-flex h-11 shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const pillVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-accent",
} as const;

export type PillVariant = keyof typeof pillVariants;

/** Fixed card widths inside rails. */
export const railWidths = {
  poster: "w-32 sm:w-[152px] md:w-44 lg:w-48 xl:w-52",
  landscape: "w-[75vw] sm:w-[280px] lg:w-80",
  person: "w-24 md:w-28",
  personLg: "w-28 md:w-32",
  provider: "w-[88px] md:w-[104px]",
} as const;

/** Listing grid for PosterCard width="fill" (spec 7.2). */
export const posterGridClass =
  "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";
