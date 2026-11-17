"use client";

import { memo, useState } from "react";

import { Modal, ModalClose, ModalContent } from "@/components/ds/modal";
import { Button } from "@/components/ui/button";
import { DONATE_METHODS, type DonateChain } from "@/lib/donate";

import { AddressCopy } from "./address-copy";
import { ChainLogo } from "./chain-logo";
import { CoinCup } from "./coin-cup";
import { QrReveal } from "./qr-reveal";
import { QrCode } from "./donate-qr";

// Props are plain strings, so the QR code is encoded once per network, not on every render.
const Qr = memo(QrCode);

export interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** An address was copied. */
  onCopied: () => void;
  /** "Don't show this again". */
  onNever: () => void;
}

/**
 * The donation popup: why, one network at a time, a QR code to scan from another device and
 * a copy button for the same device. Loaded lazily by DonatePrompt, so the QR encoder is not
 * part of the page for anyone who never sees the popup.
 */
export default function DonateDialog({ open, onOpenChange, onCopied, onNever }: DonateDialogProps) {
  const [chain, setChain] = useState<DonateChain>(DONATE_METHODS[0].chain);
  const [copied, setCopied] = useState(false);
  const method = DONATE_METHODS.find((item) => item.chain === chain) ?? DONATE_METHODS[0];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Support StreamScapeX" size="md">
        <div className="flex items-start gap-4">
          <CoinCup clipId="coin-cup-popup" className="size-14 shrink-0 md:size-16" />
          <p className="text-base leading-relaxed text-muted-foreground">
            StreamScapeX is free and has no ads. Our hosting provider, unfortunately, is not free. Donating
            doesn’t unlock any extras, but if you use the site a lot and want to help keep it running, we really
            appreciate it.
          </p>
        </div>

        {DONATE_METHODS.length > 1 ? (
          <div role="group" aria-label="Choose a network" className="mt-5 grid grid-cols-2 gap-2 md:mt-6 md:flex md:flex-wrap">
            {DONATE_METHODS.map((item) => {
              const active = item.chain === chain;
              return (
                <Button
                  key={item.chain}
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  onClick={() => setChain(item.chain)}
                >
                  <ChainLogo chain={item.chain} />
                  {item.name}
                </Button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-4 md:mt-6 md:flex-row md:items-start md:gap-6">
          <QrReveal className="order-last md:order-none md:shrink-0">
            <Qr address={method.address} label={`QR code for the ${method.name} address`} className="size-[168px]" />
          </QrReveal>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {method.assets}, {method.network} only.
            </p>
            <div className="mt-3">
              <AddressCopy
                key={method.chain}
                method={method}
                source="prompt"
                onCopied={() => {
                  setCopied(true);
                  onCopied();
                }}
              />
            </div>
            {copied ? (
              <p className="mt-3 text-sm text-foreground">Address copied. Paste it into your wallet to send. Thank you!</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-5">
          <ModalClose asChild>
            <Button variant="ghost">{copied ? "Close" : "Maybe later"}</Button>
          </ModalClose>
          <Button variant="link" size="sm" onClick={onNever} className="text-muted-foreground">
            Don&apos;t show this again
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
