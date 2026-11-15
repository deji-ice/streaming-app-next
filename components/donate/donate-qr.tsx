import { QR_QUIET_ZONE, qrPath } from "@/lib/qr";
import { cn } from "@/lib/utils";

/**
 * QR code for a wallet address, drawn as SVG shapes. Black on white whatever the theme,
 * because scanners need that contrast. Size it with `className`. Safe in Server and Client
 * Components (no hooks); the page prerenders it, the popup draws it when it opens.
 */
export function QrCode({ address, label, className }: { address: string; label: string; className?: string }) {
  const { size, d } = qrPath(address);
  const edge = size + QR_QUIET_ZONE * 2;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${-QR_QUIET_ZONE} ${-QR_QUIET_ZONE} ${edge} ${edge}`}
      shapeRendering="crispEdges"
      className={cn("aspect-square rounded-media bg-white", className)}
    >
      <path d={d} fill="#000" />
    </svg>
  );
}
