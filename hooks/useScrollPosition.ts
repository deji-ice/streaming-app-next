"use client"

import { useState, useEffect } from "react"

/**
 * A custom hook that tracks scroll position and returns whether the page has scrolled beyond a threshold
 * 
 * @param threshold - The threshold in pixels after which scrolled becomes true (default: 20)
 * @returns A boolean indicating whether the page has scrolled beyond the threshold
 * 
 * @example
 * ```tsx
 * const isScrolled = useScrollPosition(50);
 * ```
 */
export function useScrollPosition(threshold: number = 20): boolean {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > threshold)
        }

        // Set initial state
        handleScroll()

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [threshold])

    return scrolled
}