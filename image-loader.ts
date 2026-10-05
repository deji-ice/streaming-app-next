// Thin root-level shim for next.config.ts `images.loaderFile`.
//
// Why this file exists: Next hands Turbopack the loader path as
// "./" + path.relative(projectRoot, loaderFile). On Windows, a loader in a
// subfolder becomes "./lib\tmdb-image-loader.ts" (mixed separators), which
// Turbopack cannot resolve, so every <Image> throws "missing loader prop" in
// `next dev --turbopack`. A file at the project root has no separator in its
// relative path, so it resolves everywhere. The real logic lives in
// lib/tmdb-image-loader.ts.
export { default } from "./lib/tmdb-image-loader";
