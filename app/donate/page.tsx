import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CoinCup } from "@/components/donate/coin-cup";
import { DonateMethodCard } from "@/components/donate/donate-method";
import { NetworkTabs } from "@/components/donate/network-tabs";
import { DONATE_METHODS, hasDonations } from "@/lib/donate";

export const metadata: Metadata = {
  title: "Donate",
  description: "Help cover the hosting costs of StreamScapeX with a crypto donation.",
  alternates: { canonical: "/donate" },
  // Not something to rank for, and one less page for lookalike scams to point at.
  robots: { index: false, follow: true },
};

/** Prerendered at build time from the NEXT_PUBLIC_DONATE_* variables (see lib/donate.ts). */
export default function DonatePage() {
  if (!hasDonations) notFound();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-6 md:pt-12">
      <div className="flex max-w-[880px] flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="max-w-[60ch]">
          <h1 className="type-display-md text-foreground">Support StreamScapeX</h1>
          <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground md:mt-4 md:space-y-4">
            <p>StreamScapeX is free and has no ads. Our hosting provider, unfortunately, is not free.</p>
            <p>
              You don’t have to give anything. Donating doesn’t unlock any extras, and the site is the same for
              everyone. But if you use it a lot and want to help keep it running, we really appreciate it.
            </p>
          </div>
        </div>
        <CoinCup clipId="coin-cup-page" className="order-first size-20 shrink-0 md:order-none md:size-32" />
      </div>

      <div className="mt-8 max-w-[880px] md:mt-10">
        <NetworkTabs tabs={DONATE_METHODS.map(({ chain, name }) => ({ chain, name }))}>
          {DONATE_METHODS.map((method) => (
            <DonateMethodCard key={method.chain} method={method} />
          ))}
        </NetworkTabs>
      </div>

      <section aria-labelledby="donate-before" className="mt-8 max-w-[65ch] md:mt-10">
        <h2 id="donate-before" className="text-base font-semibold text-foreground">
          A few things before you send:
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Use the network listed above. If you send on the wrong one, the money is usually lost.</li>
          <li>
            Crypto can’t be refunded, so check the first and last few characters of the address before you
            confirm.
          </li>
          <li>Only copy the address from this page. We’ll never message you asking for crypto. If someone does, it’s not us.</li>
        </ul>
      </section>
    </div>
  );
}
