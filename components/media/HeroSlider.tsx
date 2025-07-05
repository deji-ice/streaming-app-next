"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Movie, type Series } from "@/types";
import { Button } from "@/components/ui/button";

function generateSlug(title: string, id: number): string {
  return `${title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")}-${id}`;
}

// Define sophisticated animation variants
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.5, // Start with some opacity instead of 0
    scale: 1.05,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.6 }, // Slightly longer opacity transition
      scale: { duration: 0.4 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0.5, // End with some opacity instead of 0
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
    },
  }),
};

const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface Props {
  items: (Movie | Series)[];
}

export default function HeroSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length, isHovered]);

  const currentItem = items[current];
  const isMovie = "title" in currentItem;

  const navigateSlide = (newIndex: number) => {
    setDirection(newIndex > current ? 1 : -1);
    setCurrent(newIndex);
  };

  // Swipe handlers for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left, go to next slide
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }

    if (touchStart - touchEnd < -100) {
      // Swipe right, go to previous slide
      setDirection(-1);
      setCurrent((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  return (
    <div
      className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Visual indicator for swipe on mobile */}
      <div className="absolute z-30 left-0 top-1/2 -translate-y-1/2 md:hidden">
        <div className="bg-white/10 backdrop-blur-sm p-1 rounded-r-lg">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </div>
      </div>
      <div className="absolute z-30 right-0 top-1/2 -translate-y-1/2 md:hidden">
        <div className="bg-white/10 backdrop-blur-sm p-1 rounded-l-lg">
          <ChevronRight className="w-6 h-6 text-white/70" />
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={currentItem.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Backdrop image with subtle zoom effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
          >
            <Image
              src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
              alt={isMovie ? currentItem.title : currentItem.name}
              fill
              sizes="100vw"
              className="object-cover object-center w-full h-full"
              loading={"lazy"}
            />
          </motion.div>

          {/* Enhanced gradient overlay with animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Coordinated text content animation */}
            <motion.div
              className="absolute bottom-[15%] left-[5%] w-[90%] md:max-w-2xl"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl lg:text-6xl font-bold font-montserrat mb-2 md:mb-4 text-white drop-shadow-md"
              >
                {isMovie ? currentItem.title : currentItem.name}
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-white/90 mb-4 md:mb-6 line-clamp-2 text-base md:text-lg drop-shadow"
              >
                {currentItem.overview}
              </motion.p>

              <motion.div variants={itemVariants}>
                <Link
                  href={`/${isMovie ? "movie" : "series"}/${generateSlug(
                    isMovie ? currentItem.title : currentItem.name,
                    currentItem.id
                  )}`}
                >
                  <Button
                    size="default"
                    className="gap-2 md:size-lg text-slate-900 bg-white hover:scale-105 hover:bg-white transition-transform"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5" />
                    Watch Now
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Navigation Dots */}
      <div className="absolute bottom-8 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => navigateSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-primary w-6 md:w-8"
                : "bg-white/50 hover:bg-white/80 w-2"
            }`}
          />
        ))}
      </div>

      {/* Animated Navigation Arrows */}
      <motion.button
        onClick={() => {
          setDirection(-1);
          setCurrent((prev) => (prev - 1 + items.length) % items.length);
        }}
        className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      <motion.button
        onClick={() => {
          setDirection(1);
          setCurrent((prev) => (prev + 1) % items.length);
        }}
        className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
