import type { MetadataRoute } from "next";

// Served by Next at /manifest.webmanifest; the <link rel="manifest"> is injected
// automatically. Colors match the dark-only theme (#111827).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StreamScapeX - Watch Movies & TV Shows",
    short_name: "StreamScapeX",
    description:
      "Stream movies and TV shows in HD. Latest releases and popular classics.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#111827",
    theme_color: "#111827",
    categories: ["entertainment", "movies"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
