"use client";

import { AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Create a dismissible banner component with actual ad-block detection
const AdBlockBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("adblock-banner-visibility", {
        detail: { visible: isVisible && adBlockDetected },
      }),
    );
  }, [isVisible, adBlockDetected]);

  useEffect(() => {
    let timeoutId: number | null = null;
    let bait: HTMLDivElement | null = null;

    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem("adblock-banner-dismissed");
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    // Create a bait element to detect ad blockers
    const detectAdBlock = () => {
      bait = document.createElement("div");
      bait.className =
        "ad ads advertisement pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links";
      bait.style.cssText =
        "width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;";
      document.body.appendChild(bait);

      // Check after a short delay to allow ad blockers to process
      timeoutId = window.setTimeout(() => {
        if (!bait) return;

        const isBlocked =
          bait.offsetParent === null ||
          bait.offsetHeight === 0 ||
          bait.offsetLeft === 0 ||
          bait.offsetTop === 0 ||
          bait.offsetWidth === 0 ||
          bait.clientHeight === 0 ||
          bait.clientWidth === 0 ||
          window.getComputedStyle(bait).display === "none" ||
          window.getComputedStyle(bait).visibility === "hidden";

        if (bait.parentNode) {
          bait.parentNode.removeChild(bait);
        }
        bait = null;

        if (isBlocked) {
          setAdBlockDetected(true);
          setIsVisible(true);
        }
      }, 100);
    };

    detectAdBlock();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (bait?.parentNode) {
        bait.parentNode.removeChild(bait);
      }
    };
  }, []);

  return (
    isVisible &&
    adBlockDetected && (
      <div
        id="adblock-banner"
        className="bg-amber-400 text-black py-1.5 sm:py-2 lg:py-2.5 px-2 sm:px-4 fixed w-full top-0 z-[100] flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2"
      >
        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-[10px] xs:text-xs sm:text-sm">
          Ad blocker detected! For the best experience, please add us to your
          allowlist or use
        </span>
        <Link
          href="https://brave.com/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline hover:text-slate-900 transition-colors text-[10px] xs:text-xs sm:text-sm"
        >
          Brave Browser
        </Link>

        <button
          onClick={() => {
            setIsVisible(false);
            localStorage.setItem("adblock-banner-dismissed", "true");
          }}
          className="ml-1 sm:ml-2 hover:text-slate-900 cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    )
  );
};
export default AdBlockBanner;
