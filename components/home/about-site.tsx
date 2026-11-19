import Link from "next/link";

import { focusRing } from "@/components/ds/classes";
import { cn } from "@/lib/utils";

import { GENRE_SECTION_CLASS } from "./classes";

const textLink = cn(
  "rounded-sm underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground hover:decoration-foreground",
  focusRing,
);

/**
 * Plain-language statement of what the site is and what it does with a Google sign-in, on the
 * home page where a visitor (and Google's app review for the sign-in screen) can read it
 * without logging in. Keep it consistent with the footer line, /about and /legal/privacy.
 * Server-safe.
 */
export function AboutSite() {
  return (
    <section aria-labelledby="home-about" className={GENRE_SECTION_CLASS}>
      <h2 id="home-about" className="type-section text-foreground">
        About StreamScapeX
      </h2>
      <div className="mt-3 max-w-[64ch] space-y-3 text-[15px] leading-7 text-muted-foreground">
        <p>
          StreamScapeX is a place to browse movies, series and the people who make them. See what is trending, watch
          trailers, check the cast and crew, and find where each title is streaming. Create an account with your email
          or Google to keep a watchlist, favorites and your watch history.
        </p>
        <p>
          If you sign in with Google, StreamScapeX receives your name, email address and profile picture, and uses them
          only to create and show your account. Details are in the{" "}
          <Link href="/legal/privacy" className={textLink}>
            Privacy Policy
          </Link>{" "}
          and the{" "}
          <Link href="/legal/terms" className={textLink}>
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
