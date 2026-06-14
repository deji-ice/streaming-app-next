// One-off generator for the PWA wordmark icon set.
// Run: node scripts/generate-pwa-icons.mjs
// Produces public/icons/*.png from an inline SVG ("SX" monogram on the dark
// brand color). Replace with real brand art later and re-run.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "icons");
await mkdir(OUT, { recursive: true });

const BG = "#111827"; // dark brand color (matches theme_color)
const FG = "#FFFFFF";
const ACCENT = "#d31d09"; // brand red used by the player

function svg(size, { maskable = false } = {}) {
  // Maskable icons keep content inside the ~80% safe zone, so use smaller text.
  const fontSize = Math.round(size * (maskable ? 0.34 : 0.46));
  const textY = Math.round(size * 0.5 + fontSize * 0.34);
  const accentH = Math.max(3, Math.round(size * 0.045));
  const accentW = Math.round(size * (maskable ? 0.28 : 0.38));
  const accentX = Math.round((size - accentW) / 2);
  const accentY = Math.round(size * 0.5 + fontSize * 0.52);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text x="50%" y="${textY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" fill="${FG}">SX</text>
  <rect x="${accentX}" y="${accentY}" width="${accentW}" height="${accentH}" rx="${accentH / 2}" fill="${ACCENT}"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, maskable: false },
  { name: "icon-512.png", size: 512, maskable: false },
  { name: "maskable-192.png", size: 192, maskable: true },
  { name: "maskable-512.png", size: 512, maskable: true },
  { name: "apple-touch-icon-180.png", size: 180, maskable: false },
];

for (const t of targets) {
  const buf = Buffer.from(svg(t.size, { maskable: t.maskable }));
  await sharp(buf).png().toFile(path.join(OUT, t.name));
  console.log("wrote", t.name);
}
