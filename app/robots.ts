import type { MetadataRoute } from "next";

/**
 * Every unique /person and /movie page a crawler opens is a full server render that
 * calls TMDB. Crawlers that bring no search traffic (SEO scrapers, AI training and
 * answer-engine bots, Apple and Meta indexers) were the bulk of the Worker's traffic, so
 * they are kept out. Googlebot and Bingbot are not listed, so they follow the "*" rule.
 * Remove an entry here to let that crawler back in.
 */
const BLOCKED_CRAWLERS = [
  "Applebot",
  "Amazonbot",
  "meta-externalagent",
  "meta-webindexer",
  "ClaudeBot",
  "anthropic-ai",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "CCBot",
  "Bytespider",
  "SemrushBot",
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
  "PetalBot",
  "Barkrowler",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: BLOCKED_CRAWLERS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/"] },
    ],
  };
}
