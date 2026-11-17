import type { DonateMethod } from "@/lib/donate";

import { AddressCopy } from "./address-copy";
import { ChainLogo } from "./chain-logo";
import { QrCode } from "./donate-qr";
import { QrReveal } from "./qr-reveal";

/**
 * One way to give on the /donate page. A Server Component, so the QR code is built on the
 * server. From md up: name, what to send, QR code, address. On phones the address and the
 * copy button come right after the name, and the QR code waits behind a button at the bottom.
 */
export function DonateMethodCard({ method }: { method: DonateMethod }) {
  const headingId = `donate-${method.chain}`;

  return (
    <section aria-labelledby={headingId} className="flex h-full flex-col rounded-panel border border-border p-4 sm:p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
          <ChainLogo chain={method.chain} className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="type-section text-foreground">
            {method.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {method.assets}, {method.network} only.
          </p>
        </div>
      </div>

      <QrReveal className="order-last mt-3 md:order-none md:mt-6">
        <QrCode
          address={method.address}
          label={`QR code for the ${method.name} address`}
          className="w-full max-w-[220px]"
        />
      </QrReveal>

      <div className="mt-4 md:mt-6">
        <AddressCopy method={method} source="page" />
      </div>
    </section>
  );
}
