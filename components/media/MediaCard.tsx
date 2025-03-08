"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Star, Clock, Calendar, Bookmark } from "lucide-react";
import { type Movie, type Series, type MediaType } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


interface MediaCardProps {
  item: Movie | Series;
  type: MediaType;
}

export default function MediaCard({ item, type }: MediaCardProps) {
  const router = useRouter()
  const title = "title" in item ? item.title : item.name;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item.id}`;
  const imageUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : "/placeholder-poster.jpg";
  const year = new Date(
    "release_date" in item ? item.release_date : item.first_air_date
  ).getFullYear();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default to avoid double navigation
    router.push(`/${type}/${slug}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success("Added to Watchlist", {
      description: `${title} has been added to your watchlist`,
      duration: 3000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card rounded-xl overflow-hidden w-fit"
    >
      <Link href={`/${type}/${slug}`} className=" ">
        <div className=" w-fit aspect-[2/3] relative">
          <Image
            src={imageUrl}
            alt={title}
            height={300}
            width={200}
            className="object-cover transition-all duration-500 
                     group-hover:scale-105 md:group-hover:brightness-75"
          />

          {/* Always visible gradient for better text readability */}
          <div
            className="absolute inset-0 bg-gradient-to-t 
                        from-black/80 via-black/20 to-transparent"
          />

          {/* Mobile-friendly playback button */}
          <Button
            size="icon"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                 md:opacity-0 md:group-hover:opacity-100 
                 transition-opacity duration-500 bg-primary/90"
                 onClick={handlePlay}
          >
            <Play className="w-4 h-4" />
          </Button>

          {/* Bookmark button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute z-30 top-2 left-2 text-white hover:text-primary 
                     transition-colors duration-300"
            onClick={handleBookmark}
          >
            <Bookmark className="w-4 h-4" />
          </Button>

          {/* Always visible info section on mobile, hover on desktop */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 
                       bg-gradient-to-t from-black/90 to-transparent"
          >
            <h3
              className="font-montserrat font-bold text-white 
                        truncate mb-2"
            >
              {title}
            </h3>
            <div className="flex items-center justify-between gap-3 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{year}</span>
              </div>
              {type === "movie" &&
                "runtime" in item &&
                typeof item.runtime === "number" && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
