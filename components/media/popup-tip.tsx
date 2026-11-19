"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

/**
 * The embedded video players can open pop-up ads. When the player opens and the viewer
 * has no ad blocker, a toast suggests Brave or AdBlock. It shows at most once per visit,
 * and "Don't show this again" turns it off for good on that browser.
 *
 * VideoPlayer renders this next to the player once it is playing, so the play button and
 * the player itself are untouched.
 */

const OFF_KEY = "sx:popup-tip"; // localStorage, "off" = never show again
const SHOWN_KEY = "sx:popup-tip-shown"; // sessionStorage, once per visit

// A well-known ad script. Every common blocker (extensions, Brave, ad-blocking DNS such
// as AdGuard DNS on Android) makes this request fail. No cookies or referrer are sent.
const AD_PROBE_URL = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

const BRAVE_URL = "https://brave.com/download/";
const ADBLOCK_URL = "https://getadblock.com/";

// Logos from Simple Icons (CC0), drawn in each brand's colour on a white tile.
const BRAVE_PATH =
  "M15.68 0l2.096 2.38s1.84-.512 2.709.358c.868.87 1.584 1.638 1.584 1.638l-.562 1.381.715 2.047s-2.104 7.98-2.35 8.955c-.486 1.919-.818 2.66-2.198 3.633-1.38.972-3.884 2.66-4.293 2.916-.409.256-.92.692-1.38.692-.46 0-.97-.436-1.38-.692a185.796 185.796 0 01-4.293-2.916c-1.38-.973-1.712-1.714-2.197-3.633-.247-.975-2.351-8.955-2.351-8.955l.715-2.047-.562-1.381s.716-.768 1.585-1.638c.868-.87 2.708-.358 2.708-.358L8.321 0h7.36zm-3.679 14.936c-.14 0-1.038.317-1.758.69-.72.373-1.242.637-1.409.742-.167.104-.065.301.087.409.152.107 2.194 1.69 2.393 1.866.198.175.489.464.687.464.198 0 .49-.29.688-.464.198-.175 2.24-1.759 2.392-1.866.152-.108.254-.305.087-.41-.167-.104-.689-.368-1.41-.741-.72-.373-1.617-.69-1.757-.69zm0-11.278s-.409.001-1.022.206-1.278.46-1.584.46c-.307 0-2.581-.434-2.581-.434S4.119 7.152 4.119 7.849c0 .697.339.881.68 1.243l2.02 2.149c.192.203.59.511.356 1.066-.235.555-.58 1.26-.196 1.977.384.716 1.042 1.194 1.464 1.115.421-.08 1.412-.598 1.776-.834.364-.237 1.518-1.19 1.518-1.554 0-.365-1.193-1.02-1.413-1.168-.22-.15-1.226-.725-1.247-.95-.02-.227-.012-.293.284-.851.297-.559.831-1.304.742-1.8-.089-.495-.95-.753-1.565-.986-.615-.232-1.799-.671-1.947-.74-.148-.068-.11-.133.339-.175.448-.043 1.719-.212 2.292-.052.573.16 1.552.403 1.632.532.079.13.149.134.067.579-.081.445-.5 2.581-.541 2.96-.04.38-.12.63.288.724.409.094 1.097.256 1.333.256s.924-.162 1.333-.256c.408-.093.329-.344.288-.723-.04-.38-.46-2.516-.541-2.961-.082-.445-.012-.45.067-.579.08-.129 1.059-.372 1.632-.532.573-.16 1.845.009 2.292.052.449.042.487.107.339.175-.148.069-1.332.508-1.947.74-.615.233-1.476.49-1.565.986-.09.496.445 1.241.742 1.8.297.558.304.624.284.85-.02.226-1.026.802-1.247.95-.22.15-1.413.804-1.413 1.169 0 .364 1.154 1.317 1.518 1.554.364.236 1.355.755 1.776.834.422.079 1.08-.4 1.464-1.115.384-.716.039-1.422-.195-1.977-.235-.555.163-.863.355-1.066l2.02-2.149c.341-.362.68-.546.68-1.243 0-.697-2.695-3.96-2.695-3.96s-2.274.436-2.58.436c-.307 0-.972-.256-1.585-.461-.613-.205-1.022-.206-1.022-.206z";
const ADBLOCK_PATH =
  "M7.775 0a1.8 1.8 0 0 0-1.273.527L.528 6.503A1.8 1.8 0 0 0 0 7.775v8.45c0 .478.19.936.528 1.274l5.974 5.974A1.8 1.8 0 0 0 7.775 24h8.45a1.8 1.8 0 0 0 1.273-.527l5.975-5.974A1.8 1.8 0 0 0 24 16.225v-8.45a1.8 1.8 0 0 0-.527-1.272L17.498.527A1.8 1.8 0 0 0 16.225 0zm4.427 3c1.02 0 .958 1.108.958 1.108v6.784s-.009.218.16.218c.188 0 .175-.226.175-.226l-.002-5.63s-.05-.986.959-.986c1.01 0 .97.983.97.983v7.621s.014.158.141.158c.127 0 .944-2.122.944-2.122s.451-1.497 2.576-1.1c.038.008-.167.688-.167.688l-2.283 6.556S15.69 20.7 11.714 20.7c-5.044 0-4.808-5.407-4.814-5.405V7.562s-.016-.99.897-.99c.858 0 .849.99.849.99l.007 3.583s-.004.172.167.172c.16 0 .141-.172.141-.172l.01-5.926s-.055-1.162.966-1.162c1.04 0 .983 1.142.983 1.142v5.611s-.005.204.152.204c.168 0 .154-.206.154-.206l.01-6.693S11.18 3 12.202 3Z";

function readFlag(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function writeFlag(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    // Private mode or blocked storage: the tip may show again, which is harmless.
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

/** Brave ships with Shields on, which blocks ads and pop-ups. */
async function isBrave(): Promise<boolean> {
  const brave = (navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } }).brave;
  try {
    return Boolean(await brave?.isBrave?.());
  } catch {
    return false;
  }
}

/** Extensions such as uBlock Origin and AdBlock hide elements with these class names. */
function baitIsHidden(): Promise<boolean> {
  return new Promise((resolve) => {
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner textads banner-ads pub_300x250";
    bait.setAttribute("aria-hidden", "true");
    bait.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px;";
    document.body.appendChild(bait);
    window.setTimeout(() => {
      const style = window.getComputedStyle(bait);
      const hidden =
        !bait.isConnected ||
        bait.offsetHeight === 0 ||
        style.display === "none" ||
        style.visibility === "hidden";
      bait.remove();
      resolve(hidden);
    }, 400);
  });
}

/** True when the ad request fails. A slow or offline network also counts, so nobody is nagged by mistake. */
async function adRequestFails(): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(AD_PROBE_URL, {
      method: "HEAD",
      mode: "no-cors",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    return false;
  } catch {
    return true;
  } finally {
    window.clearTimeout(timer);
  }
}

async function hasAdBlocker(): Promise<boolean> {
  if (await isBrave()) return true;
  if (await baitIsHidden()) return true;
  return adRequestFails();
}

export function PopupTip() {
  useEffect(() => {
    if (readFlag(local, OFF_KEY) === "off" || readFlag(session, SHOWN_KEY)) return;

    let cancelled = false;
    hasAdBlocker().then((blocked) => {
      if (cancelled || blocked) return;
      writeFlag(session, SHOWN_KEY, "1");
      toast.custom((id) => <PopupToast id={id} />, { duration: 15000 });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

function PopupToast({ id }: { id: string | number }) {
  return (
    <div className="w-full rounded-panel border border-border bg-popover p-4 font-sans text-popover-foreground">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">Stop the pop-up ads</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The video players can open pop-up ads. Brave or an ad blocker stops them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(id)}
          aria-label="Close"
          className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <BrandLink href={BRAVE_URL} label="Get Brave" color="#FB542B" path={BRAVE_PATH} />
        <BrandLink href={ADBLOCK_URL} label="Get AdBlock" color="#F40D12" path={ADBLOCK_PATH} />
      </div>

      <button
        type="button"
        onClick={() => {
          writeFlag(local, OFF_KEY, "off");
          toast.dismiss(id);
        }}
        className="mt-3 rounded-sm text-xs text-muted-foreground underline-offset-2 transition-colors duration-150 ease-out hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Don&apos;t show this again
      </button>
    </div>
  );
}

function BrandLink({
  href,
  label,
  color,
  path,
}: {
  href: string;
  label: string;
  color: string;
  path: string;
}) {
  return (
    <Button asChild variant="secondary" size="sm" className="pl-1.5 [&_svg]:size-4">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <span className="flex size-6 items-center justify-center rounded-full bg-white">
          <svg viewBox="0 0 24 24" fill={color} aria-hidden="true">
            <path d={path} />
          </svg>
        </span>
        {label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </Button>
  );
}
