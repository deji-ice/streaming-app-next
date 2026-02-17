"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import { type Movie, type Series } from "@/types";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function generateSlug(title: string, id: number): string {
  return `${title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")}-${id}`;
}

interface Props {
  items: (Movie | Series)[];
}

export default function HeroSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length, isHovered]);

  const currentItem = items[current];
  const isMovie = "title" in currentItem;

  const navigateSlide = (newIndex: number) => {
    setDirection(newIndex > current ? 1 : -1);
    setCurrent(newIndex);
  };

  // GSAP cleanup on unmount
  useEffect(() => {
    return () => {
      if (slideRef.current) gsap.killTweensOf(slideRef.current);
      if (imageRef.current) gsap.killTweensOf(imageRef.current);
      if (contentRef.current) gsap.killTweensOf(contentRef.current);
      if (titleRef.current) gsap.killTweensOf(titleRef.current);
      if (descRef.current) gsap.killTweensOf(descRef.current);
      if (buttonRef.current) gsap.killTweensOf(buttonRef.current);
    };
  }, []);

  // GSAP slide animation — compositor-only (transform + opacity)
  useGSAP(() => {
    if (!slideRef.current || !imageRef.current || !contentRef.current) return;

    // Reduced motion: instant state swap
    if (prefersReducedMotion) {
      gsap.set(slideRef.current, { x: 0, opacity: 1, scale: 1 });
      gsap.set(imageRef.current, { scale: 1 });
      gsap.set([titleRef.current, descRef.current, buttonRef.current], {
        opacity: 1,
        y: 0,
      });
      return;
    }

    const tl = gsap.timeline();
    const enterX = direction > 0 ? "100%" : "-100%";

    // Slide entrance animation (compositor: transform + opacity)
    tl.fromTo(
      slideRef.current,
      { x: enterX, opacity: 0.5, scale: 1.05 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );

    // Image zoom animation (compositor: transform)
    gsap.fromTo(
      imageRef.current,
      { scale: 1.1 },
      { scale: 1, duration: 0.7, ease: "power2.out", clearProps: "transform" },
    );

    // Content stagger animation (compositor: opacity + translateY)
    gsap.fromTo(
      [titleRef.current, descRef.current, buttonRef.current],
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.2,
        clearProps: "transform,opacity",
      },
    );
  }, [current, direction, prefersReducedMotion]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left, go to next slide
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }

    if (touchStart - touchEnd < -100) {
      // Swipe right, go to previous slide
      setDirection(-1);
      setCurrent((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  return (
    <div
      className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Visual indicator for swipe on mobile */}
      <div className="absolute z-30 left-0 top-1/2 -translate-y-1/2 md:hidden">
        <div className="bg-white/10 backdrop-blur-sm p-1 rounded-r-lg">
          <ChevronLeft className="w-6 h-6 text-white/70" />
        </div>
      </div>
      <div className="absolute z-30 right-0 top-1/2 -translate-y-1/2 md:hidden">
        <div className="bg-white/10 backdrop-blur-sm p-1 rounded-l-lg">
          <ChevronRight className="w-6 h-6 text-white/70" />
        </div>
      </div>

      <div ref={slideRef} key={currentItem.id} className="absolute inset-0">
        <div ref={imageRef} className="absolute inset-0">
          <Image
            src={`https://image.tmdb.org/t/p/w780${currentItem.backdrop_path}`}
            alt={isMovie ? currentItem.title : currentItem.name}
            fill
            sizes="100vw"
            className="object-cover object-center w-full h-full"
            fetchPriority="high"
          />
        </div>

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040712]/80 via-[#040712]/60 to-transparent" />

        <div className="absolute inset-0">
          <div
            ref={contentRef}
            className="absolute bottom-[15%] left-[5%] w-[90%] md:max-w-2xl"
          >
            <h2
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-6xl font-bold font-montserrat mb-2 md:mb-4 text-white drop-shadow-lg"
            >
              {isMovie ? currentItem.title : currentItem.name}
            </h2>

            <p
              ref={descRef}
              className="text-white/90 mb-4 md:mb-6 line-clamp-2 text-base md:text-lg drop-shadow-md"
            >
              {currentItem.overview}
            </p>

            <div ref={buttonRef}>
              <Link
                href={`/${isMovie ? "movie" : "series"}/${generateSlug(
                  isMovie ? currentItem.title : currentItem.name,
                  currentItem.id,
                )}`}
              >
                <Button
                  size="default"
                  className="gap-2 md:size-lg text-slate-900 bg-white hover:scale-105 hover:bg-white transition-transform"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5" />
                  Watch Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => navigateSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none ${
              current === index
                ? "bg-primary w-6 md:w-8"
                : "bg-white/50 hover:bg-white/80 hover:scale-110 w-2 motion-reduce:hover:scale-100"
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => {
          setDirection(-1);
          setCurrent((prev) => (prev - 1 + items.length) % items.length);
        }}
        className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white transition-transform duration-200 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => {
          setDirection(1);
          setCurrent((prev) => (prev + 1) % items.length);
        }}
        className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white transition-transform duration-200 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
