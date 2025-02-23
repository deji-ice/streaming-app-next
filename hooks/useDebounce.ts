"use client"

/**
 * A custom hook that returns a debounced value after a specified delay.
 * 
 * @template T - The type of the value to be debounced
 * @param value - The value to be debounced
 * @param delay - The delay in milliseconds before the value updates (default: 500ms)
 * @returns The debounced value of type T
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * ```
 */
// Import necessary hooks from React
import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}