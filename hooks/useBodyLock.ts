"use client"

import { useEffect } from "react"

/**
 * A custom hook that locks/unlocks the body scroll
 * 
 * @param isLocked - Boolean indicating whether the body scroll should be locked
 * 
 * @example
 * ```tsx
 * useBodyLock(modalIsOpen);
 * ```
 */
export function useBodyLock(isLocked: boolean): void {
    useEffect(() => {
        if (isLocked) {
            // Store original values
            const originalStyle = window.getComputedStyle(document.body);
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Lock scroll
            document.body.style.overflow = "hidden";

            // Prevent layout shift by adding padding when scrollbar disappears
            if (scrollBarWidth > 0) {
                document.body.style.paddingRight = `${scrollBarWidth}px`;
            }

            return () => {
                // Restore original values
                document.body.style.overflow = "";
                document.body.style.paddingRight = "";
            };
        }
    }, [isLocked]);
}