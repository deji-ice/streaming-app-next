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
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-2 lg:py-0.5 text-xs px-2 fixed w-full top-0 z-[100] flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">For the best experience, please install</span>
        <Link
          href="https://getadblock.com/en/"
          target="_blank"
          rel="noopener noreferrer"

          className="font-medium underline hover:text-white/90 transition-colors"
        >
          AdBlock
        </Link>
        <X
          className="w-4 h-4"
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
