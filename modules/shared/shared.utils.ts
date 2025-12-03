import { sharedStorage } from "./shared.storage";
import { MenuItem } from "./types";
import { useStorageValue } from "./ui/hooks/use-storage-value";


const MAX_SCROLL_POSITIONS = 15;


export const navigate = async (menuItem: MenuItem) => {
    const currentMenuItem = await sharedStorage.currMenuItem.getValue();
    const backStack = await sharedStorage.backStack.getValue();
    
    // Push current location to backStack before navigating to new location
    sharedStorage.backStack.setValue([...backStack, currentMenuItem]);
    sharedStorage.currMenuItem.setValue(menuItem);
}

export const goBack = async () => {
    const backStack = await sharedStorage.backStack.getValue();
    
    if (backStack && backStack.length > 0) {
        // Pop the last location from backStack
        const newBackStack = [...backStack];
        const previousMenuItem = newBackStack.pop();
        
        // Update backStack and navigate to previous location
        await sharedStorage.backStack.setValue(newBackStack);
        if (previousMenuItem) {
            await sharedStorage.currMenuItem.setValue(previousMenuItem);
        }
    }
}

export const canGoBack = async () => {
    const backStack = await sharedStorage.backStack.getValue();
    return backStack && backStack.length > 0;
}

/**
 * Formats a time string to a readable date format
 * @param timeString - ISO 8601 date string or timestamp
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export const displayDate = (
    timeString: string | number | Date,
    options?: Intl.DateTimeFormatOptions
): string => {
    try {
        const date = new Date(timeString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Invalid date";
        }
        
        // Default formatting options
        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            ...options,
        };
        
        return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid date";
    }
}

export const saveScrollPosition = async (workflowId: string, scrollPosition: number) => {
    const currentPositions = await sharedStorage.manageWorkflowMenuScrollPositions.getValue() || {};

    // If we exceed MAX_SCROLL_POSITIONS, remove the item with the lowest timestamp
    if (Object.keys(currentPositions).length >= MAX_SCROLL_POSITIONS) {
        let oldestKey: string | null = null;
        let oldestTimestamp = Infinity;

        for (const [key, value] of Object.entries(currentPositions)) {
            if (value.timestamp < oldestTimestamp) {
                oldestTimestamp = value.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            delete currentPositions[oldestKey];
        }
    }

    // Set the new item with scrollPosition and current timestamp
    currentPositions[workflowId] = {
        scrollPosition,
        timestamp: Date.now(),
    };

    await sharedStorage.manageWorkflowMenuScrollPositions.setValue(currentPositions);
}