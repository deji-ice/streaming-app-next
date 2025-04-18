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
      <div className="bg-amber-400 text-black py-1.5 sm:py-2 lg:py-2.5 px-2 sm:px-4 fixed w-full top-0 z-[100] flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2">
        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-[10px] xs:text-xs sm:text-sm">
          For the best experience, please install
        </span>
        <Link
          href="https://getadblock.com/en/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline hover:text-slate-900 transition-colors text-[10px] xs:text-xs sm:text-sm"
        >
          AdBlock
        </Link>
        <span className="text-[10px] xs:text-xs sm:text-sm">or use</span>
        <Link
          href="https://brave.com/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline hover:text-slate-900 transition-colors text-[10px] xs:text-xs sm:text-sm"
        >
          Brave Browser
        </Link>

        <X
          className="w-3 h-3 sm:w-4 sm:h-4 hover:text-slate-900 cursor-pointer ml-1 sm:ml-2"
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
