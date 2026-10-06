#!/usr/bin/env node
/**
 * Pre-build environment check. Runs first in `pnpm run cf:build` (package.json).
 *
 * Why it exists: on Cloudflare Workers Builds the build runs in its own container with its own
 * variables (Worker > Settings > Build > "Variables and secrets"). Two things surprise people:
 *   - Worker *runtime* secrets are not visible to `next build`, but the build prerenders pages
 *     that call TMDB, so the TMDB token has to be a *build* variable too.
 *   - NEXT_PUBLIC_* values are baked into the browser bundle at build time. A missing one does not
 *     fail the build; it silently switches that feature off in the shipped site.
 *
 * Fails (exit 1) only for what would break the build anyway. Everything else is a loud warning.
 * Loads .env files the same way `next build` does, so local builds behave the same.
 */
import { createRequire } from "node:module";

try {
  const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");
  loadEnvConfig(process.cwd(), false);
} catch {
  // @next/env not resolvable: fall back to the variables already in the process environment.
}

const has = (name) => typeof process.env[name] === "string" && process.env[name].trim() !== "";

const errors = [];
const warnings = [];

// TMDB: lib/tmdb/client.ts accepts these names, in this order.
const tokenName = ["TMDB_READ_TOKEN", "TMDB_API_KEY", "NEXT_PUBLIC_TMDB_API_KEY"].find(has);
if (!tokenName) {
  errors.push(
    [
      "TMDB_READ_TOKEN is not set. The build prerenders the home page and needs it.",
      "  Add it as a BUILD variable (type: Secret): Workers & Pages > your Worker > Settings > Build > Variables and secrets.",
      "  Also add it under Settings > Variables and Secrets (runtime), or pages revalidate with no token.",
      "  Value: your TMDB \"API Read Access Token\" (or the 32-character v3 API key).",
    ].join("\n"),
  );
} else if (tokenName === "NEXT_PUBLIC_TMDB_API_KEY") {
  warnings.push(
    "TMDB credential found only as NEXT_PUBLIC_TMDB_API_KEY. It works, but that name marks a value as public. Rename it to TMDB_READ_TOKEN.",
  );
}

// Supabase (sign-in, watchlist, favorites, history sync): inlined into the browser bundle at build time.
for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
  if (!has(name)) {
    warnings.push(
      `${name} is not set: sign-in will be switched off in this build. It must be a BUILD variable; a Worker secret is not enough because the value is compiled into the client code.`,
    );
  }
}

// Canonical URLs, sitemap and share previews.
if (!has("NEXT_PUBLIC_APP_URL")) {
  warnings.push(
    "NEXT_PUBLIC_APP_URL is not set: canonical URLs and share previews will use the fallback domain in app/layout.tsx. Set it to the site's real URL as a BUILD variable.",
  );
}

const indent = (text) => text.replace(/^/gm, "    ");

if (warnings.length > 0) {
  console.warn("\n[check-env] WARNING");
  for (const warning of warnings) console.warn(indent(`- ${warning}`));
}

if (errors.length > 0) {
  console.error("\n[check-env] BUILD STOPPED: missing required configuration");
  for (const error of errors) console.error(indent(`- ${error}`));
  console.error("");
  process.exit(1);
}

console.log(`[check-env] ok${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? "" : "s"} above)` : ""}`);
