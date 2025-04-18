"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook to check if a media query matches
 * 
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns A boolean indicating whether the media query matches
 * 
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        // Create a media query list
        const mediaQueryList = window.matchMedia(query)

        // Set initial state
        setMatches(mediaQueryList.matches)

        // Define event handler
        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches)
        }

        // Add event listener
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener("change", handleChange)
        } else {
            // For older browsers
            mediaQueryList.addListener(handleChange)
        }

        // Clean up
        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener("change", handleChange)
            } else {
                // For older browsers
                mediaQueryList.removeListener(handleChange)
            }
        }
    }, [query])

    return matches
}