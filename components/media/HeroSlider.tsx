"use client"
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Movie, type Series } from "@/types";

interface Props {
  items: (Movie | Series)[];
}

export default function HeroSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const currentItem = items[current];
  const isMovie = "title" in currentItem;

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
            alt={isMovie ? currentItem.title : currentItem.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-20 left-10 max-w-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">
                {isMovie ? currentItem.title : currentItem.name}
              </h2>
              <p className="text-white/80 mb-6 line-clamp-2">
                {currentItem.overview}
              </p>
              <Link
                href={`/${isMovie ? "movie" : "series"}/${currentItem.id}`}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md"
              >
                Watch Now
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() =>
          setCurrent((prev) => (prev - 1 + items.length) % items.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
