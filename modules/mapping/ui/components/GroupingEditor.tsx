import { useEffect, useState } from "react";
import { useWorkflowsQueries } from "@/modules/workflows/components/use-workflows-queries";
import { WorkflowMapping } from "@/modules/shared/types";
import { cn } from "@/lib/utils";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { sharedStorage } from "@/modules/shared/shared.storage";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/modules/shared/ui/components/button";

type GroupingState = {
    [key: string]: number[];
};

// Get the start and end of a range from an array of numbers
function getRangeBounds(numbers: number[]): { start: number; end: number } {
    if (numbers.length === 0) return { start: 0, end: 0 };
    const sorted = [...numbers].sort((a, b) => a - b);
    return { start: sorted[0], end: sorted[sorted.length - 1] };
}

// Generate an array of consecutive numbers from start to end
function generateRange(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
}

interface GroupingEditorProps {
    workflowMapping: WorkflowMapping | undefined;
    setIsOpen: (isOpen: boolean) => void;
    onScrollToItem?: (key: number) => void;
}

export function GroupingEditor({ workflowMapping, setIsOpen, onScrollToItem }: GroupingEditorProps) {
    const { useUpdateWorkflow } = useWorkflowsQueries();
    const { mutateAsync: updateWorkflow, isPending } = useUpdateWorkflow();
    const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter);

    const [groupingState, setGroupingState] = useState<GroupingState>({});
    const [isRangeValid, setIsRangeValid] = useState(true);
    const [missingIndices, setMissingIndices] = useState<number[]>([]);
    const [overlappingIndices, setOverlappingIndices] = useState<number[]>([]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    

    // Sync state with fetched workflowDetails
    useEffect(() => {
        if (workflowMapping?.grouped_questions) {
            const groupedQuestions = workflowMapping.grouped_questions as GroupingState;
            setGroupingState(groupedQuestions);
        } else {
            setGroupingState({});
        }
    }, [workflowMapping?.grouped_questions]);

    const handleRangeChange = (groupKey: string, type: 'start' | 'end', newValue: number) => {
        setGroupingState(prev => {
            const currentNumbers = prev[groupKey];
            const { start, end } = getRangeBounds(currentNumbers);

            const newStart = type === 'start' ? newValue : start;
            const newEnd = type === 'end' ? newValue : end;

            // Ensure start <= end
            const validStart = Math.min(newStart, newEnd);
            const validEnd = Math.max(newStart, newEnd);

            return {
                ...prev,
                [groupKey]: generateRange(validStart, validEnd)
            };
        });
    };

    useEffect(() => {
        const allNumbers = Object.values(groupingState).flat();
        if (allNumbers.length === 0) {
            setIsRangeValid(true);
            setMissingIndices([]);
            setOverlappingIndices([]);
            return;
        }

        const max = Math.max(Object.keys(workflowMapping?.mapping_metadata ?? {}).length);
        const uniqueNumbers = new Set(allNumbers);

        // Find missing indices
        const missing: number[] = [];
        for (let i = 1; i <= max; i++) {
            if (!uniqueNumbers.has(i)) {
                missing.push(i);
            }
        }

        // Find overlapping indices (appear more than once across all groups)
        const seen = new Set<number>();
        const overlapping = new Set<number>();
        for (const num of allNumbers) {
            if (seen.has(num) || num > max) {
                overlapping.add(num);
            }
            seen.add(num);
        }

        setMissingIndices(missing);
        setOverlappingIndices([...overlapping].sort((a, b) => a - b));
        setIsRangeValid(missing.length === 0 && overlapping.size === 0);
    }, [groupingState]);

    // Reset save status after 3 seconds
    useEffect(() => {
        if (saveStatus !== 'idle') {
            const timer = setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    const groupingEntries = Object.entries(groupingState);

    const handleConfirmGrouping = async () => {
        if (!isRangeValid || !workflowMapping?.workflow_id || !selectedCenter) return;
        try {
            const requestBody = {
                workflowId: workflowMapping?.workflow_id,
                centerId: selectedCenter.center_id,
                grouping: groupingState
            }
            console.log('requestBody', requestBody);
            await updateWorkflow(requestBody);
            setSaveStatus('success');
        } catch (error) {
            console.error("handleConfirmGrouping error", error);
            setSaveStatus('error');
        }
    }

    const handleResetGrouping = () => {
        setGroupingState({});
        setIsOpen(false);
    }

    const handleAddGroup = () => {
        setGroupingState(prev => {
            const newKey = Object.keys(prev).length + 1;
            return {
                ...prev,
                [newKey]: []
            };
        });
    }

    const handleRemoveGroup = (groupKey: string) => {
        setGroupingState(prev => {
            const removedKey = parseInt(groupKey);
            const newState: GroupingState = {};
            
            for (const [key, value] of Object.entries(prev)) {
                const numKey = parseInt(key);
                if (numKey < removedKey) {
                    newState[key] = value;
                } else if (numKey > removedKey) {
                    newState[numKey - 1] = value;
                }
                // Skip the removed key
            }
            
            return newState;
        });
    }

    const handleInputDoubleClick = (value: number) => {
        if (onScrollToItem) {
            onScrollToItem(value);
        }
    }


    return (
        <div className="w-full flex flex-col justify-center items-start gap-1">
            <span className="text-xs text-muted-foreground">Grouping Editor</span>
            {groupingEntries.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">No groupings found</span>
            ) : (
                <div className="w-full bg-white rounded-md shadow-md flex flex-col">
                    <div className="w-full max-h-48 overflow-y-auto grid grid-cols-2 gap-2 p-2">
                        {groupingEntries.map(([key, numbers]) => {
                            const { start, end } = getRangeBounds(numbers);
                            return (
                                <div key={key} className="flex flex-row items-center gap-2 text-sm px-2 py-1">
                                    <span className="font-medium text-muted-foreground whitespace-nowrap">Group {key}:</span>
                                    <div className="flex flex-row items-center gap-1">
                                        <input
                                            type="number"
                                            value={start}
                                            onChange={(e) => handleRangeChange(key, 'start', parseInt(e.target.value) || 0)}
                                            className="w-12 px-1 py-0.5 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onDoubleClick={() => handleInputDoubleClick(start)}
                                        />
                                        <span className="text-muted-foreground">-</span>
                                        <input
                                            type="number"
                                            value={end}
                                            onChange={(e) => handleRangeChange(key, 'end', parseInt(e.target.value) || 0)}
                                            className="w-12 px-1 py-0.5 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onDoubleClick={() => handleInputDoubleClick(end)}
                                        />
                                    </div>
                                    <button className="flex flex-row items-center gap-1 text-muted-foreground hover:text-muted-foreground/80 transition-all duration-200 cursor-pointer" onClick={() => handleRemoveGroup(key)}>
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                        <button className="flex flex-row items-center gap-1 text-muted-foreground hover:text-muted-foreground/80 transition-all duration-200 cursor-pointer" onClick={handleAddGroup}>
                            <PlusIcon className="h-4 w-4" />
                            <span className="text-xs">Add Group</span>
                        </button>
                    </div>
                    <div className="w-full flex flex-row justify-between items-center gap-2 px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-md">
                        <span className={cn("text-xs", isRangeValid ? 'text-green-500' : 'text-red-500')}>
                            {isRangeValid ? 'Range is valid' : (
                                <>
                                    {missingIndices.length > 0 && `Missing: ${missingIndices.join(', ')}`}
                                    {missingIndices.length > 0 && overlappingIndices.length > 0 && ' | '}
                                    {overlappingIndices.length > 0 && `Overlap: ${overlappingIndices.join(', ')}`}
                                </>
                            )}
                        </span>
                        <div className="flex flex-row justify-center items-center gap-2">
                            {saveStatus === 'success' ? (
                                <span className="text-xs text-green-500 font-medium">Saved!</span>
                            ) : saveStatus === 'error' ? (
                                <span className="text-xs text-red-500 font-medium">Error saving</span>
                            ) : (
                                <>
                                    <button
                                        className="text-red-500 hover:text-red-600 transition-all duration-200 cursor-pointer"
                                        disabled={isPending}
                                        onClick={handleResetGrouping}
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                    <Button variant="default" size="sm"
                                        className="px-3 py-2 text-xs bg-primary text-white hover:bg-primary/90"
                                        disabled={isPending || !isRangeValid}
                                        onClick={handleConfirmGrouping}
                                    >
                                        {isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
