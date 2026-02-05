"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Star, Play } from "lucide-react";

interface MediaListCardProps {
  title: string;
  posterPath: string | null;
  year?: number;
  rating?: number;
  season?: number | null;
  episode?: number | null;
  lastWatchedDate?: string;
  href: string;
  onAction?: () => void;
  actionIcon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  showPlayIcon?: boolean;
}

export function MediaListCard({
  title,
  posterPath,
  year,
  rating,
  season,
  episode,
  lastWatchedDate,
  href,
  onAction,
  actionIcon: ActionIcon,
  actionLabel,
  showPlayIcon = false,
}: MediaListCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}`
    : "/placeholder-poster.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-fit  "
    >
      <Link href={href} className="h-full flex flex-col">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-3 shadow-md">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play icon on hover */}
          {showPlayIcon && isHovered && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-primary/90 p-3 rounded-full shadow-lg">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
            </motion.div>
          )}

          {/* Action button */}
          {onAction && ActionIcon && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                isHovered
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.8, opacity: 0 }
              }
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction();
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition-colors shadow-lg"
              title={actionLabel}
            >
              <ActionIcon className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </Link>

      {/* Card content */}
      <div className="flex flex-col flex-">
        <Link href={href} className="flex-1">
          <h3 className="font-montserrat font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Metadata */}
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            {year && <span>{year}</span>}
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {season && episode && (
            <p className="text-muted-foreground">
              S{season} · E{episode}
            </p>
          )}

          {lastWatchedDate && (
            <p className="text-muted-foreground">
              {new Date(lastWatchedDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
