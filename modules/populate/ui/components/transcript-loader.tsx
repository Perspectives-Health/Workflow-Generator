import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/modules/shared/ui/components/dialog";
import { Button } from "@/modules/shared/ui/components/button";
import { Loader2Icon } from "lucide-react";
import { usePopulateQueries } from "@/modules/populate/use-populate-queries";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { sharedStorage } from "@/modules/shared/shared.storage";


interface TranscriptLoaderProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    transcript: string;
    setTranscript: (transcript: string) => void;
    handleTestPopulate: () => Promise<void>;
    isTestPopulatePending: boolean;
}

export function TranscriptLoader({ open, setOpen, transcript, setTranscript, handleTestPopulate, isTestPopulatePending }: TranscriptLoaderProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-32 py-2 text-xs bg-primary text-white hover:bg-primary/90"
                    disabled={isTestPopulatePending}>
                    {isTestPopulatePending ? <Loader2Icon className="h-4 w-4 text-white animate-spin" /> : 'Generate Answers'}
                </Button>
            </DialogTrigger>
            <DialogContent hasPortal={false} className="w-[500px] h-[400px] flex flex-col justify-between">
                <DialogHeader>
                    <DialogTitle>Transcript Loader</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col flex-1 min-h-0">
                    <textarea
                        className="w-full h-full border border-gray-200 rounded-md shadow-md bg-gray-50 p-2 text-sm resize-none overflow-y-auto"
                        value={transcript}
                        onFocus={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                        onChange={(e) => setTranscript(e.target.value)}
                    />
                </div>
                <Button className="px-3 py-2 text-xs bg-primary text-white hover:bg-primary/90"
                    onClick={handleTestPopulate}
                    disabled={isTestPopulatePending}>
                    {isTestPopulatePending ? <Loader2Icon className="h-4 w-4 text-white animate-spin" /> : 'Generate Note with this Transcript'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}