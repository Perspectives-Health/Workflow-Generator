import * as React from 'react';
import { useState, useEffect, useRef } from 'react'; // Import hooks
import { MoreVertical, MoreHorizontal } from 'lucide-react'; // Import both icons

import { Button, type ButtonProps } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/modules/shared/ui/components/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Defines the visual style of the OverflowMenu trigger icon.
 * - `meatball`: Vertical dots (⋮) - Commonly used for item-specific actions in lists/cards.
 * - `kebab`: Horizontal dots (...) - Often used in headers or toolbars.
 */
type OverflowMenuType = 'meatball' | 'kebab';

/**
 * Props for the OverflowMenu component.
 * Extends standard div attributes.
 */
interface OverflowMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The content to be rendered inside the dropdown menu, typically DropdownMenuItems. */
    children: React.ReactNode;
    /**
     * The visual style of the trigger icon. Defaults to 'meatball'.
     * - `meatball`: Vertical dots (⋮)
     * - `kebab`: Horizontal dots (...)
     */
    type?: OverflowMenuType;
    /** Props to be passed directly to the DropdownMenuContent component, excluding 'children'. */
    contentProps?: Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuContent>, 'children'>;
    /** Props to be passed directly to the trigger Button component. */
    triggerProps?: Omit<ButtonProps, 'children' | 'variant' | 'size'>;
    /** Class name for the root DropdownMenu element. */
    className?: string;
    /** Callback function when the menu's open state changes. */
    onOpenChange?: (open: boolean) => void;
}

// Iterative helper function to find the nearest scrollable ancestor (element or window)
export const getScrollableAncestor = (element: HTMLElement | null): HTMLElement | Window | null => {
    if (!element) {
        return null;
    }

    let parent: HTMLElement | null = element.parentElement;

    while (parent) {
        // If we reach the html element, check the window
        if (parent === document.documentElement) {
            // A basic check if the documentElement is larger than the viewport
            if (parent.scrollHeight > window.innerHeight || parent.scrollWidth > window.innerWidth) {
                return window;
            }
            // Otherwise, no scrollable container found up the chain
            return null;
        }

        // Fallback check for generic scrollable elements 
        // for some reason, it doesn't work in the cmdk menu with `style.overflow === 'auto'`. Ideally should support scrollable elements generally
        const style = window.getComputedStyle(parent);
        if (style.overflow === 'scroll' ||
            style.overflowY === 'scroll' ||
            style.overflowX === 'scroll') {
            return parent; // Found generic scrollable element
        }

        // Move up the DOM tree, crossing Shadow DOM boundaries if necessary
        parent = parent.parentElement || (parent.getRootNode() instanceof ShadowRoot ? (parent.getRootNode() as ShadowRoot).host as HTMLElement : null);
    }

    // Should theoretically be caught by the documentElement check, but return null if loop finishes
    return null;
};


/**
 * A generic OverflowMenu component using a ghost Button with an icon (⋮ or ...)
 * to trigger a DropdownMenu. The menu items are passed as children.
 *
 * Provides access to additional actions that don't fit or aren't primary.
 *
 * @example
 * // Meatball style (default)
 * <OverflowMenu>
 *   <DropdownMenuItem>Edit</DropdownMenuItem>
 *   <DropdownMenuItem>Delete</DropdownMenuItem>
 * </OverflowMenu>
 *
 * // Kebab style
 * <OverflowMenu type="kebab">
 *   <DropdownMenuItem>Settings</DropdownMenuItem>
 *   <DropdownMenuItem>Logout</DropdownMenuItem>
 * </OverflowMenu>
 */
const OverflowMenu = React.forwardRef<HTMLButtonElement, OverflowMenuProps>( // Changed ref type to ButtonElement
    ({ children, className, type = 'meatball', contentProps, triggerProps, onOpenChange, ...props }, ref) => { // Added onOpenChange

        const [isOpen, setIsOpen] = useState(false);
        const triggerRef = useRef<HTMLButtonElement>(null); // Ref for the trigger button

        const Icon = type === 'kebab' ? MoreHorizontal : MoreVertical;
        const defaultLabel = type === 'kebab' ? 'Open options' : 'Open menu';

        // Effect to handle closing on scroll
        useEffect(() => {
            if (!isOpen) {
                return; // No listener needed if closed
            }

            const triggerElement = triggerRef.current;
            if (!triggerElement) return;

            // Use the iterative helper function
            const scrollableAncestor = getScrollableAncestor(triggerElement);
            console.log('Scrollable ancestor:', scrollableAncestor); // Debugging
            if (!scrollableAncestor) return; // No scrollable ancestor found

            const handleScroll = () => {
                console.log('Scroll detected, closing menu'); // Debugging
                setIsOpen(false);
                onOpenChange?.(false); // Notify parent if needed
            };

            // Add listener directly to the scrollable ancestor
            // passive: true because we don't preventDefault
            scrollableAncestor.addEventListener('scroll', handleScroll, { passive: true });
            console.log('Scroll listener added to:', scrollableAncestor); // Keep debugging log

            // Cleanup function
            return () => {
                console.log('Removing scroll listener from:', scrollableAncestor); // Keep debugging log
                scrollableAncestor.removeEventListener('scroll', handleScroll); // Remove listener without capture flag
            };

        }, [isOpen, onOpenChange]); // Rerun effect if isOpen changes

        // Handle internal state and notify parent
        const handleOpenChange = (open: boolean) => {
            setIsOpen(open);
            onOpenChange?.(open);
        };

        return (
            <DropdownMenu open={isOpen} onOpenChange={handleOpenChange} modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        ref={triggerRef} // Attach ref to the actual button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8 data-[state=open]:bg-muted', triggerProps?.className)}
                        aria-label={defaultLabel}
                        {...triggerProps}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    hasPortal={false} // Keep portal disabled for Shadow DOM
                    align="end" // Keep original alignment
                    {...contentProps}
                    className={cn(contentProps?.className)}
                    onFocus={(e) => e.stopPropagation()}
                // Prevent focus scope from breaking due to Shadow DOM / no portal
                // This might be needed depending on Radix version and exact setup
                // onOpenAutoFocus={(e) => e.preventDefault()}
                // onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    {children}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
);
OverflowMenu.displayName = 'OverflowMenu';

export { OverflowMenu, type OverflowMenuProps, type OverflowMenuType };
