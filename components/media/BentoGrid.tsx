// components/media/BentoGrid.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, TrendingUp } from "lucide-react";
import type { Movie, Series } from "@/types";

interface BentoGridProps {
  featured: Movie | Series;
  trending: (Movie | Series)[];
  popular: Movie[];
}

export default function BentoGrid({ featured, trending, popular }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Featured Large Tile */}
      <div className="lg:col-span-2 lg:row-span-2 relative rounded-3xl overflow-hidden group">
        <Link href={`/movies/${featured.id}`}>
          <div className="aspect-square lg:aspect-auto lg:h-full relative">
            <Image
              src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{featured.title}</h1>
              <p className="text-white/80 line-clamp-2 mb-4">{featured.overview}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Now
              </motion.button>
            </div>
          </div>
        </Link>
      </div>

      {/* Trending Tiles */}
      {trending.map((item) => (
        <Link
          key={item.id}
          href={`/movies/${item.id}`}
          className="relative rounded-3xl overflow-hidden group aspect-square"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 p-4">
            <div className="flex items-center gap-2 text-white/80 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Trending</span>
            </div>
            <h2 className="text-xl font-bold text-white">{item.title}</h2>
          </div>
        </Link>
      ))}

      {/* Popular Movies Row */}
      {popular.map((movie) => (
        <Link
          key={movie.id}
          href={`/movies/${movie.id}`}
          className="relative rounded-3xl overflow-hidden group aspect-[4/3]"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 p-4">
            <h2 className="text-lg font-bold text-white mb-2">{movie.title}</h2>
            <div className="flex items-center gap-2 text-white/80">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}