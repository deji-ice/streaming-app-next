"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Movie, Series } from "@/types";
import { tmdb } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { sluggify } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Movie | Series)[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      tmdb.searchMulti(debouncedQuery).then((data) => setResults(data.results));
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="container mx-auto max-w-2xl mt-20 p-4 bg-card rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search movies & series..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none"
                autoFocus
              />
              <button onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {results.map((item) => {
                const title = "title" in item ? item.title : item.name;
                const type = "title" in item ? "movie" : "series";
                const slug = `${sluggify(title)}-${item.id}`;

                return (
                  <Link
                    key={item.id}
                    href={`/${type}/${slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-2 hover:bg-accent rounded-md"
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={title}
                      width={46}
                      height={69}
                      className="rounded"
                    />
                    <div>
                      <h3 className="font-montserrat font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
