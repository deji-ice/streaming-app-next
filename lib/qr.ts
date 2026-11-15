import qrcode from "qrcode-generator";

/** Blank modules around the code. The QR spec asks for 4 so scanners can find the edges. */
export const QR_QUIET_ZONE = 4;

/**
 * Encodes `text` as a QR code and returns it as SVG path data in module units: one
 * 1x1 square per dark module, so the whole code is a single <path>. Rendering it as
 * shapes (not an HTML string or an image) means nothing is injected into the page and
 * nothing is fetched.
 *
 * Error correction M (about 15% of the code can be damaged), which is plenty for a screen.
 * Pure and synchronous: call it from a Server Component so it runs at build time.
 */
export function qrPath(text: string): { size: number; d: string } {
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  const size = qr.getModuleCount();
  let d = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
    }
  }
  return { size, d };
}
