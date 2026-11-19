# StreamScapeX — brag plan

**Format:** vertical 1080×1920, 30 fps, 23.0 s (690 frames). Made for Instagram / WhatsApp Stories and Status, Reels, TikTok, Shorts.
**Tone:** `default`: punchy, playful, clean. Four-on-the-floor pop at 120 BPM.

## Answers

- **What is it?** StreamScapeX (streamscapex.app) is a free site to browse and watch movies and series, with trailers, cast and crew, where each title streams, and fun facts.
- **Who is it for?** Anyone who wants one place to find the thing they want to watch tonight.
- **What sets it apart?** The size of the catalog (TMDB-backed, every service's full catalog), data-rich title pages (fun facts from Wikidata and TMDB), and the new Google sign-in that keeps a watchlist, favorites and history in sync.
- **Most impressive claim:** almost every movie and show you want to watch, in one place. (The user's claim; the poster wall shows real current titles behind it.)
- **Visual hook:** a full-frame wall of real posters racing in four columns, with the headline locked in a clean band across the middle.
- **Real UI to show:** the mobile home Spotlight + Top 10 rail, the real auth modal ("Continue with Google"), the account Dashboard (counts, Continue watching, Watchlist), The Odyssey's title header and its real Fun facts list.
- **Share caption:** "StreamScapeX now has Google sign-in: your watchlist, favorites and history follow you."

## Angle

The catalog is the hook, Google sign-in is the news, fun facts are the delight. Everything on screen is the app's own design system: its Tailwind config compiled from its own `globals.css`, Bricolage Grotesque + Geist, the #0D0D10 / #FF6B4A palette, Phosphor icons, and markup copied from the server-rendered pages. No gradients, no card shadows (the app's own rules).

## Layout system

- App UI is the real mobile layout rendered at 450 CSS px wide, scaled ×2.4 to fill 1080 px.
- Caption band on the page background: y 250–600. App viewport below it from y ≈ 620.
- Anything meant to be read sits between y 250 and y 1536 and out of the right 140 px of the lower half.

## Storyboard (beat = 0.5 s; cuts on beats)

Revised mid-run at the user's request to feature Continue watching ("where you left off"), Watchlist, Favorites and History.

| # | Time | Scene | On screen | Motion | Sound |
|---|---|---|---|---|---|
| 1 | 0.0–3.0 | **Hook: poster wall** | Four columns of real posters. Middle band: "Almost **every** movie & show you want." | Columns scroll in alternating directions from frame 0; headline in by 0.6 s, holds 2.1 s; wall speeds up into the cut | Kick + bass from frame 0, riser into 3.0 |
| 2 | 3.0–5.5 | **Reveal** | Wordmark StreamScape**X** lands big, then shrinks into the app's own nav; mobile home rises under it (Spotlight: The Odyssey) | Wordmark morph 3.8–4.3; page rises 3.95–4.6; slow scroll | Impact on 3.0 |
| 3 | 5.5–8.0 | **New: Google sign-in** | Caption "New / Sign in with Google." Real auth modal (z above the nav) over the dimmed home | Frame slides down for the caption band; modal fade + 0.98 zoom; tap Continue with Google at 7.0; modal closes, avatar replaces "Sign in" | Whoosh, tap, sign-in chime |
| 4 | 8.0–11.5 | **Continue watching** | Caption "Pick up where you left off." Continue watching rail (Breaking Bad S5 E14 · yesterday, The Odyssey, Project Hail Mary) with the History link, Top 10 below | Page scrolls to the rail; swipe one card; tap The Odyssey at 10.5 | Whoosh, swipe, tap |
| 5 | 11.5–15.0 | **Watchlist + favorites** | Caption "Your watchlist and favorites, in sync." The Odyssey title page | Tap bookmark at 12.5 (fills coral, toast "Added to watchlist"); tap heart at 13.5 (toast "Added to favorites" stacks in front) | Taps, toast chimes |
| 6 | 15.0–19.0 | **Fun facts** | Caption "Fun facts for the movie nerds." Same page scrolls to Fun facts: box office, filming locations, music, cinematography | Facts arrive one per beat from 15.5 | A rising pluck per fact |
| 7 | 19.0–23.0 | **Outro** | Wordmark, streamscapex.app, "Continue with Google" pill, drifting poster rail, TMDB credit | Staggered in, rail drifts, hold | Impact on 19.0, final Am stab at 21.0, fade |

Durations: 3.0 + 2.5 + 2.5 + 3.5 + 3.5 + 4.0 + 4.0 = 23.0 s.

## Readability check

- Hook headline, 7 words → 2.1 s needed; settled 0.6–2.72 s.
- "New / Sign in with Google." 5 words → 1.5 s; settled ≈5.85–7.84 s.
- "Pick up where you left off." 6 words → 1.8 s; settled 8.4–11.34 s.
- "Your watchlist and favorites, in sync." 6 words → 1.8 s; settled 11.9–14.84 s.
- "Fun facts for the movie nerds." 6 words → 1.8 s; settled 15.4–18.8 s. Box office fact (10 words) visible 15.8–18.75 s.

## Data and privacy

- Titles, posters, backdrops, The Odyssey's metadata and fun facts come from the user's running dev server (TMDB + Wikidata), downloaded once.
- The signed-in account is fictional (initial "A", illustrative watch history). No real user data, emails or keys.
- TMDB attribution in the outro: the approved TMDB logo, smaller than the StreamScapeX mark.
- Streams and the player are not shown.

## Music

120 BPM in A minor, Am–F–C–G per bar (2 s), then F–G into a resolving Am at the outro (19.0). Kick four-on-the-floor, clap on 2 and 4, offbeat hats, pulsing eighth-note bass ducked by the kick, filtered chord stabs, a pentatonic pluck motif from scene 2. Effects are pitched to the key and share one reverb with the music: risers into 3.0 and 16.0, whooshes on cuts, a tap at 7.25, plucks on the facts.
