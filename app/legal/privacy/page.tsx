import type { Metadata } from "next";

import { ContactLink, Key, LegalLink, LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { CONTACT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What StreamScapeX stores, what it sends to third parties, and the choices you have.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lead={
        <>
          <p>
            StreamScapeX collects only what its features need. You can browse and watch without an account.
            This page explains what is stored, where, and who else can see it.
          </p>
          <p>By using the site you agree to the practices described here.</p>
        </>
      }
    >
      <LegalSection id="privacy-collect" number={1} title="Information we collect">
        <p>
          <Key>Without an account,</Key> we do not ask for your name, email or any sign-in. A few things are
          kept on your own device so the site can remember you:
        </p>
        <LegalList>
          <li>your watch history, up to 50 titles, with the season and episode you last opened;</li>
          <li>your recent searches;</li>
          <li>the streaming source you picked, and whether you dismissed a prompt or banner.</li>
        </LegalList>
        <p>
          This stays in your browser&rsquo;s storage. Clear your browser data and it is gone.
        </p>
        <p>
          <Key>With an account,</Key> we store:
        </p>
        <LegalList>
          <li>your email address, plus the name and picture from Google or GitHub if you sign in with them;</li>
          <li>your password, if you use one, in hashed form held by our sign-in provider, not in readable text;</li>
          <li>
            your watchlist, favorites, ratings and watch history (the title, season and episode, how far you
            got, and when).
          </li>
        </LegalList>
        <p>
          <Key>Usage data.</Key> We use Google Tag Manager and Google Analytics to count visits and see what
          is used. They record the pages you view and actions such as pressing play, switching source,
          searching (including the search term), adding to a list, and clicking a sponsor or the donate
          prompt. They also receive technical details such as your browser, device, approximate location from
          your IP address, and a cookie identifier. The site does not send your name or email with these events.
        </p>
      </LegalSection>

      <LegalSection id="privacy-cookies" number={2} title="Cookies and browser storage">
        <p>The site and its providers use a small number of cookies and local storage entries:</p>
        <LegalList>
          <li>sign-in cookies that keep you signed in, set only if you use an account;</li>
          <li>Google Analytics cookies that tell one visitor from another;</li>
          <li>local storage for your watch history, recent searches, chosen source and dismissed prompts.</li>
        </LegalList>
        <p>
          You can delete these any time in your browser&rsquo;s settings. Blocking them will not stop the site
          from working, though a signed-in session or your saved history will be lost.
        </p>
      </LegalSection>

      <LegalSection id="privacy-third-parties" number={3} title="Third-party content and IP addresses">
        <p>
          <Key>StreamScapeX does not host any media.</Key> Posters, video players and trailers load from other
          companies&rsquo; servers, and your browser connects to them directly. That means each of them can
          see your IP address and the browser details your device sends, and they can set their own cookies.
        </p>
        <LegalList>
          <li>
            <Key>TMDB</Key> (image.tmdb.org) serves posters and backdrops.
          </li>
          <li>
            <Key>Streaming players</Key> (VidSrc, VidLink and Videasy) serve the video when you press play, and
            may show their own ads.
          </li>
          <li>
            <Key>YouTube</Key> (youtube-nocookie.com) plays trailers.
          </li>
          <li>
            <Key>Google</Key> receives the analytics data described above.
          </li>
          <li>
            <Key>Supabase</Key> stores account data for signed-in users. <Key>Cloudflare</Key> hosts and
            delivers the site, and sees request logs such as IP addresses.
          </li>
          <li>
            <Key>Sponsors.</Key> If you click a sponsor, you go to its own site, which has its own privacy
            policy. The link tells the store that you came from StreamScapeX.
          </li>
        </LegalList>
        <p>
          We do not control how these companies handle data. Please read their privacy policies if that
          matters to you.
        </p>
      </LegalSection>

      <LegalSection id="privacy-sharing" number={4} title="Data sharing and security">
        <p>
          <Key>We do not sell, rent or trade your personal information.</Key> It is shared only with the
          providers above, and only so the site can run.
        </p>
        <p>
          Your watchlist, favorites and watch history are protected by database rules that let only your own
          account read or change them. The site is served over HTTPS. Even so, no method of sending or storing
          data over the internet is completely secure, so we cannot promise absolute security.
        </p>
        <p>
          Donations go straight to a public crypto wallet address. We do not collect your name or wallet
          details, and blockchain transactions are public by design.
        </p>
      </LegalSection>

      <LegalSection id="privacy-choices" number={5} title="Your choices">
        <LegalList>
          <li>Clear your browser data to remove local history, searches and settings.</li>
          <li>Sign out any time from the profile menu.</li>
          <li>
            To limit analytics, block cookies or scripts in your browser, or use Google&rsquo;s{" "}
            <LegalLink href="https://tools.google.com/dlpage/gaoptout">browser opt-out add-on</LegalLink>.
          </li>
          {CONTACT_EMAIL ? (
            <li>
              To have your account and its data deleted, email <ContactLink /> from the address on the
              account.
            </li>
          ) : null}
        </LegalList>
        <p>
          StreamScapeX is not meant for children under 13, and we do not knowingly collect their information.
        </p>
      </LegalSection>

      <LegalSection id="privacy-changes" number={6} title="Changes to this policy">
        <p>
          We may update this policy as the site changes. The &ldquo;Last updated&rdquo; date at the top shows the
          latest version. Using the site after a change means you accept it. The{" "}
          <LegalLink href="/legal/terms">Terms of Service</LegalLink> explain the rules for using the site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
