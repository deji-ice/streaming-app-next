import type { DonateMethod } from "@/lib/donate";

import { AddressCopy } from "./address-copy";
import { ChainLogo } from "./chain-logo";
import { QrCode } from "./donate-qr";

/**
 * One way to give on the /donate page: network logo and name, what to send, a centred QR
 * code and the address in full. A Server Component, so the QR code is computed at build time.
 */
export function DonateMethodCard({ method }: { method: DonateMethod }) {
  const headingId = `donate-${method.chain}`;

  return (
    <section aria-labelledby={headingId} className="rounded-panel border border-border p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
          <ChainLogo chain={method.chain} className="size-5" />
        </span>
        <h2 id={headingId} className="type-section text-foreground">
          {method.name}
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {method.assets}, {method.network} only.
      </p>

      <QrCode
        address={method.address}
        label={`QR code for the ${method.name} address below`}
        className="mx-auto mt-5 block w-full max-w-[220px]"
      />

      <div className="mt-5">
        <AddressCopy method={method} source="page" />
      </div>
    </section>
  );
}
