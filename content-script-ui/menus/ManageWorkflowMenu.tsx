import { useEffect, useState, useRef, useMemo, useLayoutEffect } from "react";
import { sharedStorage } from "@/modules/shared/shared.storage";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { useWorkflowsQueries } from "@/modules/workflows/components/use-workflows-queries";
import { MappingMetadata } from "@/modules/shared/types";
import { useDebouncedCallback } from "@/modules/shared/ui/hooks/use-debounce";
import { usePathLogger } from "@/modules/mapping/domain/path-logger";
import { Check, Pencil, XIcon, RefreshCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/modules/shared/ui/components/tooltip";
import { saveScrollPosition } from "@/modules/shared/shared.utils";
import { findElementByXPath, queryFormElement } from "@/modules/mapping/domain/query-elements";
import { getMode } from "@/modules/mapping/mapping.utils";


export function ManageWorkflowMenu() {

    const { value: selectedWorkflowId } = useStorageValue(sharedStorage.selectedWorkflowId);
    const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter);
    const { value: savedScrollPositions, isLoading: isScrollPositionLoading } = useStorageValue(sharedStorage.manageWorkflowMenuScrollPositions);
    const { useGetWorkflowDetails, useUpdateWorkflow } = useWorkflowsQueries();
    const { data: workflowDetails, isLoading: isWorkflowLoading } = useGetWorkflowDetails(selectedWorkflowId ?? '');
    const { mutateAsync: updateWorkflow, isPending } = useUpdateWorkflow();
    const [isRestoringScroll, setIsRestoringScroll] = useState(true);

    const manageWorkflowListRef = useRef<HTMLDivElement>(null);

    const mapping: MappingMetadata[] = useMemo(() =>
        Object.entries(workflowDetails?.mapping_metadata ?? {}).map(([index, metadata]) => ({
            index: Number(index),
            ...(metadata as Omit<MappingMetadata, 'index'>)
        })),
        [workflowDetails?.mapping_metadata]
    );

    const scrollPosition = selectedWorkflowId && savedScrollPositions ? savedScrollPositions[selectedWorkflowId]?.scrollPosition : undefined;

    useEffect(() => {
        setIsRestoringScroll(true);
    }, [selectedWorkflowId]);


    const handleUpdateProcessedQuestionText = async (index: number, processedQuestionText: string) => {
        await updateWorkflow({
            workflowId: selectedWorkflowId ?? '',
            processedQuestions: {
                [index]: processedQuestionText
            },
            centerId: selectedCenter?.center_id ?? ''
        });
    }

    const handleScroll = useDebouncedCallback(async () => {
        if (manageWorkflowListRef.current && selectedWorkflowId) {
            const currentScrollTop = manageWorkflowListRef.current.scrollTop;
            await saveScrollPosition(selectedWorkflowId, currentScrollTop);
        }
    }, 150, [selectedWorkflowId]);

    // Restore scroll position on mount and when data is loaded
    useLayoutEffect(() => {
        // Wait for both mapping data and scroll positions to load
        if (!mapping || isWorkflowLoading || isScrollPositionLoading) {
            return;
        }
        if (manageWorkflowListRef.current && scrollPosition !== null && scrollPosition !== undefined) {
            // Add a short delay to ensure child components are mounted
            const timeoutId = setTimeout(() => {
                if (manageWorkflowListRef.current) {
                    manageWorkflowListRef.current.scrollTop = scrollPosition;
                }
                setIsRestoringScroll(false);
            }, 1000);

            return () => clearTimeout(timeoutId);
        } else {
            setIsRestoringScroll(false);
        }
    }, [scrollPosition, mapping, isWorkflowLoading, isScrollPositionLoading]);


    return (
        <div className="w-full flex flex-col gap-2 p-2">
            <div className="w-full flex flex-col justify-center items-start gap-1" >
                <span className="text-xs text-muted-foreground">Manage Workflow: {workflowDetails?.workflow_name}</span>
                <a href={workflowDetails?.s3_link ?? ''} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 duration-300 ease-in-out">
                    View Screenshot
                </a>
            </div>
            {/* {isWorkflowLoading || isRestoringScroll ? (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : (!mapping || mapping.length === 0 ? (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground text-sm">Mapping empty</div>
            ) : ( */}
            <div className="w-full max-h-72 overflow-y-auto overflow-x-hidden flex flex-col bg-white rounded-md shadow-md"
                ref={manageWorkflowListRef} onScroll={handleScroll} style={{ opacity: isRestoringScroll ? 0 : 1 }}>
                {mapping.map((metadata, index) => (
                    <ManageWorkflowMenuItem
                        key={index}
                        metadata={metadata}
                        onUpdateProcessedQuestion={handleUpdateProcessedQuestionText}
                    />
                ))}
            </div>
            {/* ))} */}
            {/* <div className="w-full flex flex-row justify-end items-center">
                <button className="px-3 py-2 text-xs bg-primary text-white hover:bg-primary/90" onClick={handleSave}>
                    Save
                </button>
            </div> */}
        </div>
    );
}

export function ManageWorkflowMenuItem({
    metadata,
    onUpdateProcessedQuestion
}: {
    metadata: MappingMetadata;
    onUpdateProcessedQuestion: (index: number, text: string) => Promise<void>;
}) {
    const { value: selectedWorkflowId } = useStorageValue(sharedStorage.selectedWorkflowId);

    const [processedQuestionText, setProcessedQuestionText] = useState(metadata.processed_question_text);
    const [isFocused, setIsFocused] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [clickBeforePaths, setClickBeforePaths] = useState<string[]>([]);
    const [newClickBeforePath, setNewClickBeforePath] = useState<string | null>(null);
    const [viewOnPageStatus, setViewOnPageStatus] = useState<'found' | 'not_found' | null>(null);
    const [regenerateStatus, setRegenerateStatus] = useState<'idle' | 'completed' | 'error'>('idle');

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightedElementRef = useRef<HTMLElement | null>(null);

    const { start: startPathLogger, stop: stopPathLogger, isLogging: isPathLogging } = usePathLogger((newPath) => {
        setNewClickBeforePath(newPath);
    });
    const { useSaveWorkflowPaths, useRegenerateProcessedQuestion } = useWorkflowsQueries();
    const { mutateAsync: saveWorkflowPaths, isPending } = useSaveWorkflowPaths();
    const { mutateAsync: regenerateProcessedQuestion, isPending: isRegeneratingProcessedQuestion } = useRegenerateProcessedQuestion();

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Update local state when metadata changes (e.g., from server)
        setProcessedQuestionText(metadata.processed_question_text);
    }, [metadata.processed_question_text]);

    useEffect(() => {
        if (isSaved) {
            const timer = setTimeout(() => {
                setIsSaved(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSaved]);

    useEffect(() => {
        if (viewOnPageStatus) {
            const timer = setTimeout(() => {
                // Remove highlight from element when status resets
                if (highlightedElementRef.current) {
                    highlightedElementRef.current.style.outline = '';
                    highlightedElementRef.current = null;
                }
                setViewOnPageStatus(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [viewOnPageStatus]);

    useEffect(() => {
        if (regenerateStatus !== 'idle') {
            const timer = setTimeout(() => {
                setRegenerateStatus('idle');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [regenerateStatus]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setProcessedQuestionText(newText);

        // Auto-resize when focused
        if (isFocused && textareaRef.current) {
            autoResize();
        }

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout to trigger update after 500ms
        debounceTimeoutRef.current = setTimeout(async () => {
            await onUpdateProcessedQuestion(metadata.index, newText);
            setIsSaved(true);
        }, 600);
    };

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Auto-resize on focus to show all content
        setTimeout(() => autoResize(), 0);
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Reset to default height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleConfirmClickBeforePath = () => {
        if (!newClickBeforePath) return;
        setClickBeforePaths(prev => [...prev, newClickBeforePath]);
        setNewClickBeforePath(null);
    }

    const handleCancelClickBeforePath = () => {
        setNewClickBeforePath(null);
    }


    const handleCancelPathSave = () => {
        setClickBeforePaths([]);
        setNewClickBeforePath(null);
        stopPathLogger();
    }

    const handleConfirmPathSave = async () => {
        if (!selectedWorkflowId) return;
        try {
            stopPathLogger();
            const requestBody = {
                workflowId: selectedWorkflowId,
                index: metadata.index.toString(),
                xpath: undefined,
                clickBeforeXpaths: clickBeforePaths
            }
            await saveWorkflowPaths(requestBody);
            setClickBeforePaths([]);
            setNewClickBeforePath(null);
        } catch (error) {
            console.error("handleConfirmPathSave error", error);
        }
    }

    const handleViewOnCurrentPage = (path: string) => {
        // Clear previous highlight if exists
        if (highlightedElementRef.current) {
            highlightedElementRef.current.style.outline = '';
            highlightedElementRef.current = null;
        }

        if (!path) {
            setViewOnPageStatus('not_found');
            return;
        }
        const element = findElementByXPath(path, document);
        if (!element) {
            setViewOnPageStatus('not_found');
            return;
        }
        
        // Add green border highlight
        element.style.outline = '2px solid #22c55e';
        highlightedElementRef.current = element;
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setViewOnPageStatus('found');
    }

    const handleRegenerateProcessedQuestion = async (index: number) => {
        if (!selectedWorkflowId) return;
        try {
            await regenerateProcessedQuestion({
                workflowId: selectedWorkflowId,
                questionIndex: index.toString()
            });
            setRegenerateStatus('completed');
        } catch (error) {
            console.error("handleRegenerateProcessedQuestion error", error);
            setRegenerateStatus('error');
        }
    }

    return (
        <div className="w-full flex flex-col justify-center items-start border-b border-gray-200 pb-2 last:border-b-0 py-2 px-3 gap-1">
            <span className="text-sm font-semibold">{metadata.index} - {metadata.question_text}</span>
            <div className="relative w-full">
                <textarea
                    ref={textareaRef}
                    value={processedQuestionText}
                    onChange={handleTextChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={isRegeneratingProcessedQuestion}
                    className={`w-full text-sm text-muted-foreground mt-1 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:border-transparent transition-all duration-200
                        ${isSaved ? 'ring-2 ring-green-500' : 'focus:ring-2 focus:ring-blue-500 '}
                    `}
                    rows={2}
                />
                {isRegeneratingProcessedQuestion && (
                    <div className="absolute inset-0 mt-1 flex items-center justify-center bg-white/60 rounded-md">
                        <RefreshCcw className="h-4 w-4 text-muted-foreground animate-spin" />
                    </div>
                )}
            </div>
            <div className="w-full flex flex-row justify-between items-center">
                {viewOnPageStatus === 'not_found' ? (
                    <span className="text-xs text-red-500">
                        Could not locate element
                    </span>
                ) : (
                    <button className="text-xs text-blue-500 hover:text-blue-600 duration-300 ease-in-out"
                        onClick={() => handleViewOnCurrentPage(metadata.xpath)}
                    >
                        View on Current Page
                    </button>
                )}
                {isRegeneratingProcessedQuestion ? (
                    <span className="text-xs text-muted-foreground">Regenerating...</span>
                ) : regenerateStatus === 'completed' ? (
                    <span className="text-xs text-green-500">Completed</span>
                ) : regenerateStatus === 'error' ? (
                    <span className="text-xs text-red-500">Error</span>
                ) : (
                    <button className="text-xs text-blue-500 hover:text-blue-600 duration-300 ease-in-out"
                        onClick={() => handleRegenerateProcessedQuestion(metadata.index)}
                    >
                        Regenerate
                    </button>
                )}
            </div>
            <div className="w-full flex flex-row justify-between items-center gap-1">
                {!!newClickBeforePath ? (
                    <div className="flex flex-row justify-center items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                                        Add new pre-fill click?
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    hasPortal={false}
                                    className="bg-black/50 text-white opacity-100 rounded-md p-2 text-xs">
                                    {newClickBeforePath}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <button onClick={handleCancelClickBeforePath} >
                            <XIcon className="h-4 w-4 text-red-500" />
                        </button>
                        <button onClick={handleConfirmClickBeforePath} >
                            <Check className="h-4 w-4 text-green-500" />
                        </button>
                    </div>
                ) : (
                    isPathLogging ? (
                        <div className="flex flex-row text-muted-foreground text-xs whitespace-nowrap">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="whitespace-nowrap">
                                            Add <strong>{clickBeforePaths.length || 0}</strong> pre-fill clicks
                                        </span>
                                    </TooltipTrigger>
                                    {clickBeforePaths.length > 0 && (
                                        <TooltipContent
                                            hasPortal={false}
                                            className="bg-black/50 text-white opacity-100 rounded-md p-2 text-xs">
                                            {clickBeforePaths.map((path, index) => (
                                                <div key={index}>
                                                    {path}
                                                </div>
                                            ))}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                            <button onClick={handleCancelPathSave} >
                                <XIcon className="h-4 w-4 text-red-500" />
                            </button>
                            <button onClick={handleConfirmPathSave} >
                                <Check className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-row text-muted-foreground text-xs whitespace-nowrap gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="whitespace-nowrap">
                                            <strong>{metadata.click_before_xpaths?.length || 0}</strong> pre-fill clicks
                                        </span>
                                    </TooltipTrigger>
                                    {!!metadata.click_before_xpaths && metadata.click_before_xpaths.length > 0 && (
                                        <TooltipContent
                                            hasPortal={false}
                                            className="bg-black/50 text-white opacity-100 rounded-md p-2 text-xs">
                                            {metadata.click_before_xpaths?.map((path, index) => (
                                                <div key={index}>
                                                    {path}
                                                </div>
                                            ))}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                            <button onClick={startPathLogger} >
                                <Pencil className="h-4 w-4" />
                            </button>
                        </div>
                    )
                )}
                <span className="text-xs text-muted-foreground font-semibold w-full text-right">{metadata.type}</span>
            </div>
        </div >
    );
}