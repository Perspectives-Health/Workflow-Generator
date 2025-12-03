import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook that debounces a value, function call, or any state.
 * This is useful for delaying calls to expensive operations like API requests, search queries, etc.
 * 
 * @param value The value to debounce
 * @param delay The delay time in milliseconds
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * // Simple value debouncing
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // This will only run 300ms after the last change to searchTerm
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set a timeout to update the debounced value after the specified delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timeout if the value changes or the component unmounts
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * A custom hook that returns a debounced function.
 * This is useful when you want to debounce a function call directly,
 * especially when the function is defined inline or changes frequently.
 * 
 * @param fn The function to debounce
 * @param delay The delay time in milliseconds
 * @param deps Optional dependency array for the useCallback hook
 * @returns A debounced version of the provided function
 * 
 * @example
 * ```tsx
 * // Debounced function
 * const debouncedSearch = useDebouncedCallback(
 *   (term: string) => {
 *     performSearch(term);
 *   },
 *   500,
 *   [] // No dependencies other than the function itself
 * );
 * 
 * // Usage
 * const handleChange = (e) => {
 *   setSearchTerm(e.target.value);
 *   debouncedSearch(e.target.value);
 * };
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
    deps: any[] = []
): (...args: Parameters<T>) => void {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const callback = useCallback(fn, deps);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            const handler = setTimeout(() => {
                callback(...args);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        },
        [callback, delay]
    );

    return useCallback((...args: Parameters<T>) => {
        const cleanup = debouncedCallback(...args);
        return cleanup;
    }, [debouncedCallback]);
}
