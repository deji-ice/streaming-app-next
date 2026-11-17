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
 * Older copy path for browsers and in-app webviews that refuse the Clipboard API. Copies from
 * a hidden textarea holding the raw address, so the grouping shown on screen never ends up in
 * the clipboard. Inside a dialog the textarea goes into the dialog, so its focus trap allows it.
 */
function legacyCopy(text: string): boolean {
  const host = document.activeElement?.closest('[role="dialog"]') ?? document.body;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  host.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return legacyCopy(text);
  }
}

/** "AKsJwX9L..." -> ["AKsJ", "wX9L", ...]: groups of 4, easier to read and to compare. */
function groups(address: string): string[] {
  return address.match(/.{1,4}/g) ?? [address];
}

/**
 * A wallet address shown in groups of four, the first and last groups highlighted (the ones
 * people are told to check). Tapping it copies the raw address, and so does the button under
 * it. Both share one state: after a copy, the box and the button turn green for a moment and
 * screen readers hear "copied". Copying is not donating: the event only measures interest.
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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parts = groups(method.address);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    if (!(await copyText(method.address))) {
      toast.error("Could not copy on this browser. Copy the address by hand.");
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
        aria-label={`${method.name} address ${method.address}. Copy`}
        className={cn(
          "block w-full rounded-media border px-3.5 py-3 text-left transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          copied ? "border-success/40 bg-success/10" : "border-border bg-muted hover:border-muted-foreground/40",
        )}
      >
        <span className="flex flex-wrap gap-x-[0.5em] gap-y-1 font-mono text-[15px] leading-snug tracking-wide md:text-sm">
          {parts.map((part, index) => (
            <span
              key={index}
              className={
                index === 0 || index === parts.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"
              }
            >
              {part}
            </span>
          ))}
        </span>
        <span
          className={cn(
            "mt-2 flex items-center gap-1.5 text-xs font-medium",
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
        onClick={copy}
        className={cn(
          "mt-3 w-full",
          copied && "border border-success/40 bg-success/10 text-success hover:bg-success/10",
        )}
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
