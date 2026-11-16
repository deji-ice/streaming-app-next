"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { hasDonations } from "@/lib/donate";

import {
  DONATE_PROMPT,
  afterChoice,
  isDue,
  isPromptPath,
  readState,
  writeState,
  type PromptChoice,
} from "./prompt-policy";

// The dialog and the QR encoder download only when the popup is about to open.
const DonateDialog = dynamic(() => import("./donate-dialog"), { ssr: false });

function PromptController() {
  const pathname = usePathname();
  const [requested, setRequested] = useState(false);
  const [open, setOpen] = useState(false);
  // What the person did while it was open; decides how long it stays quiet afterwards.
  const choice = useRef<PromptChoice>("later");

  // Count the page view, then see whether this page may show the popup after a short stay.
  useEffect(() => {
    const state = readState();
    const next = { ...state, views: state.views + 1 };
    writeState(next);
    if (!isPromptPath(pathname) || !isDue(next, Date.now())) return;

    const timer = setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      // Never stack on another dialog (sign-in, trailer) or on the install banner.
      if (document.querySelector('[role="dialog"], [aria-label="Install app"]')) return;
      // Another tab may have shown it or been answered in the meantime.
      if (!isDue(readState(), Date.now())) return;
      choice.current = "later";
      setRequested(true);
      setOpen(true);
      trackEvent("donate_prompt_shown");
    }, DONATE_PROMPT.delayMs);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Every way of closing it (X, Esc, outside click, buttons) ends up here.
  const onOpenChange = useCallback((next: boolean) => {
    if (next) return;
    setOpen(false);
    writeState(afterChoice(readState(), choice.current, Date.now()));
    trackEvent("donate_prompt_dismissed", { choice: choice.current });
  }, []);

  const onCopied = useCallback(() => {
    choice.current = "copied";
  }, []);

  const onNever = useCallback(() => {
    choice.current = "never";
    onOpenChange(false);
  }, [onOpenChange]);

  if (!requested) return null;
  return <DonateDialog open={open} onOpenChange={onOpenChange} onCopied={onCopied} onNever={onNever} />;
}

/**
 * Donation popup, mounted once in the root layout. Opens now and then, not on every visit
 * (rules and numbers in prompt-policy.ts). Renders nothing when no donation address is
 * configured for the build.
 */
export function DonatePrompt() {
  return hasDonations ? <PromptController /> : null;
}
