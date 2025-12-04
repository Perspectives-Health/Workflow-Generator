import { useRef, useState, useCallback, forwardRef, useImperativeHandle, RefObject } from "react";
import { cn } from "@/lib/utils";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    maxHeight?: number;
    ignoreBlurRefs?: RefObject<HTMLElement | null>[];
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, maxHeight = 200, ignoreBlurRefs, onChange, onFocus, onBlur, value, ...props }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const [isFocused, setIsFocused] = useState(false);

        useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

        const autoResize = useCallback(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set height to scrollHeight, but cap at maxHeight
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
            // Add overflow-y auto when content exceeds maxHeight
            textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }, [maxHeight]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange?.(e);
            // Only auto-resize when focused
            if (isFocused) {
                autoResize();
            }
        };

        const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            e.stopPropagation();
            setIsFocused(true);
            onFocus?.(e);
            autoResize();
        };

        const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setIsFocused(false);
            onBlur?.(e);

            // Skip height reset if blur was caused by clicking an ignored element
            if (ignoreBlurRefs?.some(ref => ref.current?.contains(e.relatedTarget as Node))) {
                return;
            }

            // Reset to default height on blur
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = 'auto';
            }
        };

        return (
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn(
                    "w-full resize-none transition-all duration-200",
                    className
                )}
                {...props}
            />
        );
    }
);

TextArea.displayName = "TextArea";

