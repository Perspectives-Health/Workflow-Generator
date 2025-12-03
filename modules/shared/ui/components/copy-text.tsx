import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export function CopyText({ text, showText = true, className }: { text: string, showText?: boolean, className?: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    return (
        <div className={cn("flex flex-row justify-center items-center gap-1 text-muted-foreground text-xs", className)}>
            {showText && <p>{text}</p>}
            <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label="Copy to clipboard"
            >
                {isCopied ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                    <CopyIcon className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
        </div>
    );
}