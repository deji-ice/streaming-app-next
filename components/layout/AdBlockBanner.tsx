"use client";

import { AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Create a dismissible banner component
const AdBlockBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem("adblock-banner-dismissed");
    if (dismissed) setIsVisible(false);
  }, []);

  return (
    isVisible && (
      <div className="bg-amber-400 text-black py-2 lg:py-1.5 text-xs px-2 fixed w-full top-0 z-[100] flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">For the best experience, please install</span>
        <Link
          href="https://getadblock.com/en/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline hover:text-slate-900 transition-colors"
        >
          AdBlock
        </Link>
        <span className="text-xs">or use</span>
        <Link
          href="https://brave.com/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline hover:text-slate-900 transition-colors"
        >
          Brave Browser
        </Link>

        <X
          className="w-4 h-4  hover:text-slate-900 cursor-pointer"
          onClick={() => {
            setIsVisible(false);
            localStorage.setItem("adblock-banner-dismissed", "true");
          }}
        />
      </div>
    )
  );
};
export default AdBlockBanner;
