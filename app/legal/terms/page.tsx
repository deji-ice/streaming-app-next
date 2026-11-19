import type { Metadata } from "next";

import { Key, LegalLink, LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { TMDB_NOTICE } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using StreamScapeX: what the site is, what you are responsible for, and how accounts and third-party content work.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lead={
        <p>
          These terms cover your use of StreamScapeX at streamscapex.app. By using the site you agree to
          them. If you do not agree, please do not use it.
        </p>
      }
    >
      <LegalSection id="terms-service" number={1} title="About the service">
        <p>
          StreamScapeX is a personal project for browsing movies, series and the people who make them. It
          was built for educational, demonstration and portfolio purposes.
        </p>
        <p>
          <Key>StreamScapeX does not host, upload or store any video files.</Key> Titles, artwork, cast and
          ratings come from The Movie Database (TMDB), streaming availability from JustWatch, and facts from
          Wikidata. When you press play, the video is loaded from an outside player run by someone else.
        </p>
        <p>
          We do not run those players, and we cannot check what they show, whether it is licensed, or
          whether it stays available. The site is provided as it is. We may change it, or take it down, at
          any time.
        </p>
      </LegalSection>

      <LegalSection id="terms-responsibility" number={2} title="Your responsibility">
        <p>
          You use the site, and everything you reach through it, at your own risk. Use it for personal,
          non-commercial entertainment only.
        </p>
        <p>
          You are responsible for following the laws that apply where you live, including copyright law.
          Outside players and links are third-party content: StreamScapeX is not responsible for copyright
          claims, malware, pop-ups or any other harm that comes from them.
        </p>
        <p>Please do not:</p>
        <LegalList>
          <li>scrape the site or send automated bulk requests to it;</li>
          <li>try to get around its limits, or reverse-engineer or overload its services;</li>
          <li>use it to harm, harass or deceive other people.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="terms-accounts" number={3} title="Accounts">
        <p>
          An account is optional. You can create one with an email address and password, or sign in with
          Google or GitHub. It lets you keep a watchlist, favorites, ratings and watch history that follow
          you between devices. What we store is described in the{" "}
          <LegalLink href="/legal/privacy">Privacy Policy</LegalLink>.
        </p>
        <p>
          You are responsible for keeping your sign-in details safe and for what happens under your account.
          We may suspend or close an account that abuses the site, tries to break it, or breaks these terms.
          You can stop using your account at any time.
        </p>
      </LegalSection>

      <LegalSection id="terms-links" number={4} title="Links, sponsors and donations">
        <p>
          StreamScapeX links to other sites: streaming players, YouTube for trailers, and sponsors. Those
          sites have their own terms and privacy policies, and we do not control them.
        </p>
        <p>
          Some pages show a promotion for a store, Anjy&rsquo;s Bags. Promotions are marked as sponsored. If
          you click one, you leave StreamScapeX.
        </p>
        <p>
          Donations are optional gifts, sent in cryptocurrency to the wallet address on the donate page.
          They unlock nothing, they are not a payment for the service, and a blockchain transfer cannot be
          refunded. We will never message you to ask for crypto.
        </p>
      </LegalSection>

      <LegalSection id="terms-ip" number={5} title="Intellectual property">
        <p>
          The StreamScapeX interface, branding, code and custom graphics belong to the person who runs the
          site. Posters, backdrops, character images, logos and metadata belong to their owners: the studios,
          networks and rights holders behind them, and the sources named on the{" "}
          <LegalLink href="/about">credits</LegalLink> page.
        </p>
        <p>{TMDB_NOTICE}</p>
        <p>
          Streaming availability data is provided by JustWatch. All trademarks and logos belong to their
          respective owners, and no copyright infringement is intended.
        </p>
      </LegalSection>

      <LegalSection id="terms-liability" number={6} title="No warranty and limited liability">
        <p>
          The site comes with no promises. We do not guarantee that it will be accurate, always available or
          free of errors. To the fullest extent the law allows, StreamScapeX and the person who runs it are
          not liable for any loss or damage that comes from using the site or from third-party content
          reached through it.
        </p>
      </LegalSection>

      <LegalSection id="terms-changes" number={7} title="Changes to these terms">
        <p>
          We may change these terms from time to time. The &ldquo;Last updated&rdquo; date at the top shows
          the latest version. If you keep using the site after a change, you accept the new terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
