"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Movie, type Series } from "@/types";
import { Button } from "@/components/ui/button";

// Add this helper function at the top of the file
function generateSlug(title: string, id: number): string {
  return `${title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")}-${id}`;
}

interface Props {
  items: (Movie | Series)[];
}

export default function HeroSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, isHovered]);

  const currentItem = items[current];
  const isMovie = "title" in currentItem;

  return (
    <div
      className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${currentItem.backdrop_path}`}
            alt={isMovie ? currentItem.title : currentItem.name}
            fill
            className="object-cover object-top aspect-ratio-16/9"
            layout="fill"
            priority
          />
          {/* Improved gradient overlay for better text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-transparent">
            <div className="absolute bottom-[15%] left-[5%] w-[90%] md:max-w-2xl">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-6xl font-bold font-montserrat mb-2 md:mb-4 text-white"
              >
                {isMovie ? currentItem.title : currentItem.name}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-white/90 mb-4 md:mb-6 line-clamp-2 text-base md:text-lg"
              >
                {currentItem.overview}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link
                  href={`/${isMovie ? "movie" : "series"}/${generateSlug(
                    isMovie ? currentItem.title : currentItem.name,
                    currentItem.id
                  )}`}
                >
                  <Button size="default" className="gap-2 md:size-lg">
                    <Play className="w-4 h-4 md:w-5 md:h-5" />
                    Watch Now
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots - Moved up slightly on mobile */}
      <div className="absolute bottom-8 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-primary w-6 md:w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev - 1 + items.length) % items.length)
        }
        className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white transition-transform hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
        className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white transition-transform hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
