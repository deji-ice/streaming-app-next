"use client";
import Image from "next/image";
import { Calendar, Clock, Globe, Users, Film } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tmdb } from "@/lib/tmdb";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MediaInfoProps {
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: string;
  rating: number;
  posterPath: string;
  genres: string[];
  duration: number; // in minutes
  cast: Array<{ id: number; name: string }>;
  country: string;
}

export default function MediaInfo({
  tmdbId,
  title,
  overview,
  releaseDate,
  rating,
  posterPath,
  genres,
  duration,
  cast,
  country,
}: MediaInfoProps) {
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "/placeholder-poster.jpg";

  const handleTrailer = async () => {
    setIsLoadingTrailer(true);
    try {
      const trailerUrl = await tmdb.getTrailers(tmdbId, "movie");

      if (!trailerUrl) {
        toast.error("No trailer available");
        return;
      }

      setTrailerUrl(trailerUrl);
      setShowTrailer(true);
    } catch (error) {
      console.error("Error loading trailer:", error);
      toast.error("Failed to load trailer");
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col md:flex-row gap-8 bg-black/5 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        {/* Poster Section with Gradient Overlay */}
        <div className="w-1/2 md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] relative rounded-xl overflow-hidden group">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 relative">
          {/* Title and Rating */}
          <div className="space-y-4">
            <h1
              className="text-4xl md:text-5xl font-montserrat font-bold 
                       bg-clip-text text-transparent bg-gradient-to-r 
                       from-primary to-primary/50"
            >
              {title}
            </h1>

            <div className="flex items-center gap-4 w-fit">
              <div
                className="flex items-center font-roboto gap-1 px-3 py-1 bg-black/10 dark:bg-white/5 
                         backdrop-blur rounded-lg "
              >
                <p className=" text-yellow-600 font-medium ">IMDB:</p>

                <span className=" text-base">{rating.toFixed(1)}</span>
              </div>
              <button
                onClick={handleTrailer}
                disabled={isLoadingTrailer}
                className={cn(
                  "bg-black/10 dark:bg-white/5 text-base px-3 py-1 rounded-lg",
                  "transition-all duration-200",
                  "hover:bg-black/20 dark:hover:bg-white/10",
                  isLoadingTrailer && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoadingTrailer ? "Loading..." : "Trailer"}
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-roboto">
                {new Date(releaseDate).toLocaleDateString()}
              </span>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Film className="w-5 h-5 text-primary" />
              <span className="font-roboto truncate">{genres.join(", ")}</span>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Users className="w-5 h-5 text-primary" />
              <span className="font-roboto truncate text-base">
                {cast
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(", ")}
              </span>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-roboto">
                {Math.floor(duration / 60)}h {duration % 60}m
              </span>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-roboto">{country}</span>
            </div>
          </div>

          {/* Overview with Gradient Border */}
          <div
            className="mt-8 p-4 rounded-lg bg-black/5 dark:bg-white/5 
                       backdrop-blur-sm border border-primary/20
                       relative before:absolute before:inset-0 
                       before:rounded-lg before:p-[1px]
                        before:-z-10"
          >
            <p className="text-base  font-roboto leading-relaxed">{overview}</p>
          </div>
        </div>
      </div>

     {/* Trailer Modal */}
<Dialog open={showTrailer} onOpenChange={setShowTrailer}>
  <DialogContent className="max-h-[90vh] max-w-[90vw] p-0 md:h-[80vh] md:w-[80vw]">
    <DialogTitle className="sr-only">
      {title} - Official Trailer
    </DialogTitle>
    <div className="relative w-full h-0 pb-[56.25%]">
      {trailerUrl && (
        <iframe
          src={trailerUrl}
          title={`${title} - Official Trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      )}
    </div>
  </DialogContent>
</Dialog>
    </>
  );
}
