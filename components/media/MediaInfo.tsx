"use client";
import Image from "next/image";
import { Calendar, Clock, Globe, Users, Film } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tmdb } from "@/lib/tmdb";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MediaInfoProps {
  type: "movie" | "series";
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
  type,
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
  const [isLoadingTrailer, setIsLoadingTrailer] = useState<boolean>(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/original${posterPath}`
    : "/placeholder-poster.jpg";

  const handleTrailer = async () => {
    setIsLoadingTrailer(true);
    try {
      const trailerType = type == "series" ? "tv"  : "movie"
      const trailerUrl = await tmdb.getTrailers(tmdbId, trailerType);

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
      {/* Mobile-optimized layout */}
      <div className="relative bg-background/80 rounded-2xl p-4 md:p-6 border border-border">
        <div className="md:hidden">
          <h1 className="text-xl  sm:text-2xl font-montserrat font-bold text-foreground mb-3 ">
            {title}
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center font-roboto gap-1 px-2 py-1 bg-muted rounded-lg">
              <p className="text-yellow-600 font-medium text-sm">IMDB:</p>
              <span className="text-foreground text-sm">
                {rating.toFixed(1)}
              </span>
            </div>
            <button
              onClick={handleTrailer}
              disabled={isLoadingTrailer}
              className={cn(
                "bg-muted text-foreground text-sm px-2 py-1 rounded-lg",
                "hover:bg-muted/80",
                isLoadingTrailer && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoadingTrailer ? "Loading..." : "Watch Trailer"}
            </button>
          </div>

          {/* Smaller poster on mobile */}
          <div className="w-[70%] mx-auto mb-5">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Info items in 2 columns */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {
                icon: Calendar,
                label: "Released",
                text: new Date(releaseDate).toLocaleDateString(),
              },
              {
                icon: Clock,
                label: "Duration",
                text: `${Math.floor(duration / 60)}h ${duration % 60}m`,
              },
              { icon: Film, label: "Genre", text: genres.join(", ") },
              { icon: Globe, label: "Country", text: country },
              {
                icon: Users,
                label: "Cast",
                text: cast
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(", "),
              },
            ].map(({ icon: Icon, label, text }, index) => (
              <div key={index} className="flex items-start gap-2 py-2">
                <Icon className="w-4 h-4 mt-0.5 text-primary/70 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {label}
                  </p>
                  <p className="font-roboto text-xs text-foreground">
                    {text || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Overview at bottom on mobile */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-1">
              Overview
            </h3>
            <p className="text-xs leading-relaxed text-foreground/90">
              {overview}
            </p>
          </div>
        </div>

        {/* Desktop layout (side by side) */}
        <div className="hidden md:flex md:flex-row gap-8">
          {/* Poster Section */}
          <div className="w-1/3 lg:w-1/4">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-lg group">
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-montserrat font-bold text-foreground">
                {title}
              </h1>

              <div className="flex items-center gap-4 w-fit">
                <div className="flex items-center font-roboto gap-1 px-3 py-1 bg-muted rounded-lg">
                  <p className="text-yellow-600 font-medium text-base">IMDB:</p>
                  <span className="text-foreground text-base">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <button
                  onClick={handleTrailer}
                  disabled={isLoadingTrailer}
                  className={cn(
                    "bg-muted text-foreground text-base px-3 py-1 rounded-lg",
                    "transition-all duration-200 hover:bg-muted/80",
                    isLoadingTrailer && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoadingTrailer ? "Loading..." : "Watch Trailer"}
                </button>
              </div>
            </div>

            {/* Info Grid */}
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                {[
                  {
                    icon: Calendar,
                    label: "Released",
                    text: new Date(releaseDate).toLocaleDateString(),
                  },
                  { icon: Film, label: "Genre", text: genres.join(", ") },
                  {
                    icon: Users,
                    label: "Cast",
                    text: cast
                      .slice(0, 3)
                      .map((c) => c.name)
                      .join(", "),
                  },
                  {
                    icon: Clock,
                    label: "Duration",
                    text: `${Math.floor(duration / 60)}h ${duration % 60}m`,
                  },
                  { icon: Globe, label: "Country", text: country },
                ].map(({ icon: Icon, label, text }, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary/70 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {label}
                      </p>

                      <p className="font-roboto text-sm text-foreground">
                        {text || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overview */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Overview
                </h3>
                <p className="text-base font-roboto leading-relaxed text-foreground/90">
                  {overview}
                </p>
              </div>
            </div>
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
