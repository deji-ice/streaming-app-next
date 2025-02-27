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
      <div className="relative flex flex-col md:flex-row gap-8 bg-background/80 rounded-2xl p-6 border border-border">
        {/* Poster Section */}
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
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-foreground">
              {title}
            </h1>

            <div className="flex items-center gap-4 w-fit">
              <div className="flex items-center font-roboto gap-1 px-3 py-1 bg-muted rounded-lg">
                <p className="text-yellow-600 font-medium">IMDB:</p>
                <span className="text-foreground">{rating.toFixed(1)}</span>
              </div>
              <button
                onClick={handleTrailer}
                disabled={isLoadingTrailer}
                className={cn(
                  "bg-muted text-foreground text-base px-3 py-1 rounded-lg",
                  "transition-all duration-200",
                  "hover:bg-muted/80",
                  isLoadingTrailer && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoadingTrailer ? "Loading..." : "Trailer"}
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Calendar,
                text: new Date(releaseDate).toLocaleDateString(),
              },
              { icon: Film, text: genres.join(", ") },
              {
                icon: Users,
                text: cast
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(", "),
              },
              {
                icon: Clock,
                text: `${Math.floor(duration / 60)}h ${duration % 60}m`,
              },
              { icon: Globe, text: country },
            ].map(({ icon: Icon, text }, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-roboto text-foreground truncate">
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-base font-roboto leading-relaxed text-foreground/90">
              {overview}
            </p>
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
