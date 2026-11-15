"use client";

import { CheckCircleIcon, CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { DonateMethod } from "@/lib/donate";
import { cn } from "@/lib/utils";

/** How long the copied state stays on screen. */
const SUCCESS_MS = 2500;

/**
 * Clipboard API first. Some browsers and embedded webviews refuse it, so the fallback
 * selects the address on screen and uses the older copy command; if that fails too, the
 * address stays selected for a manual copy.
 */
async function copyText(text: string, node: HTMLElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (!node) return false;
    const selection = window.getSelection();
    selection?.selectAllChildren(node);
    try {
      const copied = document.execCommand("copy");
      if (copied) selection?.removeAllRanges();
      return copied;
    } catch {
      return false;
    }
  }
}

/**
 * A wallet address that copies when tapped, with a copy button under it. Both share one
 * state: after a copy from either, the address box and the button turn green with a check
 * for a moment, and screen readers hear "copied". Copying is not donating: the analytics
 * event only measures interest.
 *
 * Give it a `key` per address where the address can change (the popup's network switch),
 * so a success state never carries over to another address.
 */
export function AddressCopy({
  method,
  source,
  onCopied,
}: {
  method: Pick<DonateMethod, "chain" | "name" | "address">;
  /** Where it is shown, for the analytics event. */
  source: "page" | "prompt";
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const addressRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    const ok = await copyText(method.address, addressRef.current);
    if (!ok) {
      toast.error("Could not copy. The address is selected, so copy it by hand.");
      return;
    }
    trackEvent("donate_copy", { chain: method.chain, source });
    onCopied?.();
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), SUCCESS_MS);
  };

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "block w-full rounded-media border px-3 py-2.5 text-left transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          copied ? "border-success/40 bg-success/10" : "border-border bg-muted hover:border-muted-foreground/40",
        )}
      >
        <code ref={addressRef} className="block break-all font-mono text-[13px] leading-relaxed text-foreground">
          {method.address}
        </code>
        <span
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs font-medium",
            copied ? "text-success" : "text-subtle-foreground",
          )}
        >
          {copied ? (
            <CheckCircleIcon weight="fill" size={14} aria-hidden="true" />
          ) : (
            <CopyIcon size={14} aria-hidden="true" />
          )}
          {copied ? (
            "Copied to clipboard"
          ) : (
            <>
              <span className="md:hidden">Tap to copy</span>
              <span className="hidden md:inline">Click to copy</span>
            </>
          )}
        </span>
      </button>

      <Button
        type="button"
        variant="secondary"
        onClick={copy}
        className={cn("mt-3 w-full", copied && "border-success/40 bg-success/10 text-success hover:bg-success/10")}
      >
        {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
        {copied ? "Address copied" : `Copy ${method.name} address`}
      </Button>

      <span role="status" className="sr-only">
        {copied ? `${method.name} address copied` : ""}
      </span>
    </div>
  );
}
