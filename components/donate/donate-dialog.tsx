"use client";

import { memo, useState } from "react";

import { Modal, ModalClose, ModalContent } from "@/components/ds/modal";
import { Button } from "@/components/ui/button";
import { DONATE_METHODS, type DonateChain } from "@/lib/donate";

import { AddressCopy } from "./address-copy";
import { ChainLogo } from "./chain-logo";
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
        <p className="text-base leading-relaxed text-muted-foreground">
          StreamScapeX is free and has no ads. Our hosting provider, unfortunately, is not free. Donating
          doesn’t unlock any extras, but if you use the site a lot and want to help keep it running, we really
          appreciate it.
        </p>

        {DONATE_METHODS.length > 1 ? (
          <div role="group" aria-label="Choose a network" className="mt-6 flex flex-wrap gap-2">
            {DONATE_METHODS.map((item) => {
              const active = item.chain === chain;
              return (
                <Button
                  key={item.chain}
                  size="sm"
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

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <Qr
            address={method.address}
            label={`QR code for the ${method.name} address`}
            className="size-[168px] shrink-0 self-center sm:self-start"
          />
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
            <p className="mt-3 min-h-5 text-sm text-foreground">
              {copied ? "Address copied. Paste it into your wallet to send. Thank you!" : null}
            </p>
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
