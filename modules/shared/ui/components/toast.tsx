'use client';

import { Button } from '@/modules/shared/ui/components/button';
import React, { JSX, ReactNode, useEffect } from 'react';
import { ExternalToast, toast as sonnerToast } from 'sonner';
// Import the shadcn Button component
// import { Button } from "@/shared/ui/button";

// Define the button type separately for reusability
interface ToastButtonProps {
    label: ReactNode | string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

type ToastButtonType = ToastButtonProps | JSX.Element;

const isCustomButton = (button: ToastButtonType): button is ToastButtonProps =>
    button && typeof button === 'object' && 'label' in button && 'onClick' in button;

// Update ToastProps to include an optional cancelButton and dismissOnTabChange
interface ToastProps {
    id: string | number;
    title: string;
    description: string;
    button?: ToastButtonType;
    cancelButton?: ToastButtonType;
    dismissOnTabChange?: boolean;
}


/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
// Update the function signature to accept the optional cancelButton and dismissOnTabChange
export function toast(toast: Omit<ToastProps, 'id'>, options?: ExternalToast) {
    return sonnerToast.custom((id) => (
        <Toast
            id={id}
            {...toast}
        />
    ), options);
}

// Export sonner's dismiss, success, error, etc. methods
toast.dismiss = sonnerToast.dismiss;
toast.success = sonnerToast.success;
toast.error = sonnerToast.error;
toast.info = sonnerToast.info;
toast.warning = sonnerToast.warning;
toast.loading = sonnerToast.loading;
toast.promise = sonnerToast.promise;


/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
    // Destructure dismissOnTabChange as well
    const { title, description, button, cancelButton, id, dismissOnTabChange } = props;

    // Add effect to dismiss toast on tab change if dismissOnTabChange is true
    useEffect(() => {
        if (!dismissOnTabChange) return;

        const handleVisibilityChange = () => {
            sonnerToast.dismiss(id);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [dismissOnTabChange, id]);

    return (
        // Use flex-col for stacking text and buttons
        <div className="flex flex-col rounded-lg bg-white shadow-lg ring-1 ring-black/5 w-full md:max-w-[400px] p-4">
            {/* Text content */}
            <div className="w-full">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            {/* Container for buttons below text */}
            <div className="mt-4 flex justify-start gap-2">
                {cancelButton && (
                    isCustomButton(cancelButton) ?
                        <Button
                            variant={cancelButton.variant || "secondary"}
                            size="sm"
                            onClick={() => {
                                cancelButton.onClick();
                                sonnerToast.dismiss(id);
                            }}
                        >
                            {cancelButton.label}
                        </Button>
                        : cancelButton
                )}
                {button && isCustomButton(button) ?
                    <Button
                        variant={button.variant || "default"}
                        size="sm"
                        onClick={() => {
                            button.onClick();
                            sonnerToast.dismiss(id);
                        }}
                    >
                        {button.label}
                    </Button>
                    : button
                }
            </div>
        </div>
    );
}

function Headless() {
    return (
        <button
            className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
            onClick={() => {
                toast({
                    title: 'This is a headless toast',
                    description: 'You have full control of styles and jsx, while still having the animations.',
                    button: { // Primary action
                        label: 'Reply',
                        onClick: () => console.log('Reply clicked'),
                    },
                    cancelButton: { // Optional cancel action
                        label: 'Dismiss',
                        onClick: () => console.log('Dismiss clicked'),
                    },
                    dismissOnTabChange: true, // Example of using the new prop
                });
            }}
        >
            Render toast
        </button>
    );
}
