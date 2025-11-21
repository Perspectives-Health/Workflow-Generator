import { useEffect, useState } from "react";

export function useStorageValue<TValue, TMetadata extends Record<string, unknown>>(storageItem: WxtStorageItem<TValue, TMetadata>) {
    const [value, setValue] = useState<TValue | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchInitial() {
            try {
                const initial = await storageItem.getValue();
                if (isMounted) {
                    setValue(initial ?? null);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch initial storage value:", error);
                if (isMounted) {
                    setValue(null);
                    setIsLoading(false);
                }
            }
        }

        fetchInitial();

        const unwatch = storageItem.watch((newValue) => {
            if (isMounted) {
                setValue(newValue ?? null);
            }
        });

        return () => {
            isMounted = false;
            unwatch();
        };
    }, [storageItem]);

    return { value, isLoading };
}