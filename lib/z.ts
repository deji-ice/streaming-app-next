/**
 * Z-index scale (design spec section 2.5). Mirrors the --z-* CSS variables in
 * app/globals.css and the Tailwind zIndex keys (z-nav, z-banner, z-overlay,
 * z-popover, z-toast). Use only these values; never arbitrary z-[..] classes.
 */
export const Z = {
  /** Sticky top bar and the mobile bottom tab bar. */
  nav: 40,
  /** PWA install prompt. */
  banner: 45,
  /** Dialog and sheet overlay plus content. */
  overlay: 50,
  /** Dropdown menus, selects and popovers (above dialogs so they work inside them). */
  popover: 55,
  /** Toasts. */
  toast: 60,
} as const;

export type ZLayer = keyof typeof Z;

export const zIndex = (layer: ZLayer): number => Z[layer];
