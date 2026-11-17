/**
 * Product analytics. Every event here goes to Google Analytics 4 through gtag, which
 * app/layout.tsx loads when NEXT_PUBLIC_GA_ID is set. Nothing is sent from the Worker,
 * so tracking adds no Cloudflare requests or CPU.
 *
 * Names follow GA4 recommended events where one exists (search, sign_up, login). To read a
 * parameter in GA4 reports (for example `title` on video_play), register it once under
 * Admin > Custom definitions > Create custom dimension (scope: Event). Until then it is only
 * visible in Realtime and DebugView.
 */
export type AnalyticsEvent =
  | "video_play" // pressed play: content_type, content_id, title, provider, season, episode
  | "source_switch" // changed stream source while watching: from_provider, to_provider
  | "episode_next" // pressed Next Episode: season, episode (the one being left)
  | "search" // search_term, result_count, no_results
  | "add_to_watchlist" // content_type, content_id, title
  | "add_to_favorites" // content_type, content_id, title
  | "sign_up" // method: email
  | "login" // method: email
  | "oauth_start" // method: google | github (the provider page opens; success is not visible here)
  | "browse_provider" // provider, provider_slug
  | "trailer_play" // title
  | "pwa_install" // the browser reported the app as installed
  | "donate_copy" // chain: solana | ethereum, source: page | prompt (a copy is interest, not a completed donation)
  | "donate_prompt_shown" // the donation popup opened
  | "donate_prompt_dismissed" // choice: later | copied | never
  | "sponsor_impression" // half of a sponsor unit was on screen: sponsor, placement (once per page view)
  | "sponsor_click" // opened the sponsor's site: sponsor, placement, item (product name, or "store")
  | "sponsor_dismiss"; // closed a sponsor unit that has a close button: sponsor, placement

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export const trackEvent = (eventName: AnalyticsEvent, parameters?: AnalyticsParams) => {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", eventName, parameters);
  }

  // Vercel Analytics
  if (window.va) {
    window.va("event", {
      name: eventName,
      ...parameters,
    });
  }
};
