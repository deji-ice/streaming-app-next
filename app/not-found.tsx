"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Film, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/95 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-600/20 rounded-full filter blur-3xl opacity-20"></div>
      </div>

      {/* Content container */}
      <div className="max-w-xl w-full text-center relative z-10">
        {/* Main content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            404
          </h1>

          <h2 className="text-2xl md:text-3xl font-medium mb-2">
            Content Not Found
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The content you&apos;re looking for may have been moved, deleted, or
            never existed. Let&apos;s get you back to watching something
            amazing.
          </p>

          {/* Recommendations */}
          <div className="grid grid-cols-1 gap-3 mb-8">
            <Link href="/" className="block">
              <motion.div
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-accent/30 transition-all"
                whileHover={{ x: 5 }}
              >
                <div className="bg-primary/10 rounded-full p-2">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Return to Home</h3>
                  <p className="text-xs text-muted-foreground">
                    Browse our full catalog of content
                  </p>
                </div>
              </motion.div>
            </Link>

            <Link href="/movie" className="block">
              <motion.div
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-accent/30 transition-all"
                whileHover={{ x: 5 }}
              >
                <div className="bg-primary/10 rounded-full p-2">
                  <Film className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Explore Movies</h3>
                  <p className="text-xs text-muted-foreground">
                    Discover the latest blockbusters and classics
                  </p>
                </div>
              </motion.div>
            </Link>

            <Link href="/series" className="block">
              <motion.div
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-accent/30 transition-all"
                whileHover={{ x: 5 }}
              >
                <div className="bg-primary/10 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Watch Series</h3>
                  <p className="text-xs text-muted-foreground">
                    Binge-worthy TV shows and series
                  </p>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Action button */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
