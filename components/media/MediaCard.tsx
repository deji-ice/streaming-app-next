"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { type Movie, type Series } from "@/types";

// Utility to sluggify titles (add this to your lib/utils.ts if not already present)
const sluggify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export interface MediaCardProps {
  item: Movie | Series;
  type: "movies" | "series";
}

export default function MediaCard({ item, type }: MediaCardProps) {
  const title = "title" in item ? item.title : item.name;
  const slug = `${sluggify(title)}-${item.id}`;
  const imageUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder-poster.jpg";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg"
    >
      <Link href={`/${type}/${slug}`}>
        <div className="aspect-[2/3] relative">
          <Image
            src={imageUrl}
            alt={`${title} poster`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-center h-full">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-montserrat font-bold truncate">{title}</h3>
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="ml-1 text-sm font-roboto">
              {item.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
