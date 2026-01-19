import { useState, useRef, useEffect } from "react";
import { Button } from "@/modules/shared/ui/components/button";
import { TextArea } from "@/modules/shared/ui/components/textarea";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { sharedStorage } from "@/modules/shared/shared.storage";
import { useWorkflowsQueries } from "@/modules/workflows/components/use-workflows-queries";
import { CategoryType, ProgressNoteType } from "@/modules/shared/types";


export function WorkflowPrompt() {
    const { value: selectedWorkflowId } = useStorageValue(sharedStorage.selectedWorkflowId);
    const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter);
    const { useGetWorkflow, useUpdateWorkflow } = useWorkflowsQueries();
    const { data: workflowSummary, isLoading: isWorkflowSummaryLoading } = useGetWorkflow(selectedWorkflowId ?? '');
    const { mutateAsync: updateWorkflow, isPending } = useUpdateWorkflow();

    const [workflowPromptState, setWorkflowPromptState] = useState<string>('');
    const [categoryType, setCategoryType] = useState<CategoryType | null>(null);
    const [progressNoteType, setProgressNoteType] = useState<ProgressNoteType | null>(null);
    const resetButtonRef = useRef<HTMLButtonElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setWorkflowPromptState(workflowSummary?.prompt ?? '');
        setCategoryType(workflowSummary?.category_type ?? null);
        setProgressNoteType(workflowSummary?.progress_note_type ?? null);
    }, [workflowSummary]);

    const handleSaveWorkflowPrompt = async () => {
        if (!selectedWorkflowId || !selectedCenter) return;
        try {
            const requestBody = {
                workflowId: selectedWorkflowId,
                centerId: selectedCenter.center_id,
                promptConfig: {
                    category_instructions: {
                        prompt: workflowPromptState,
                        selected_category: categoryType,
                        progress_note_type: categoryType === 'progress_notes' ? progressNoteType : undefined,
                    }
                }
            }
            console.log('requestBody', requestBody);
            await updateWorkflow(requestBody);
        } catch (error) {
            console.error("handleSaveWorkflowPrompt error", error);
        }
    }


    return (
        <div className="w-full flex flex-col gap-2">
            <TextArea
                value={workflowPromptState}
                onChange={(e) => setWorkflowPromptState(e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm"
                maxHeight={300}
                ignoreBlurRefs={[resetButtonRef, saveButtonRef]}
            />
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-row justify-center items-center gap-2">
                    <select
                        value={categoryType ?? ''}
                        onChange={(e) => setCategoryType(e.target.value as CategoryType)}
                        className="w-36 p-2 border border-gray-200 rounded-md text-xs"
                    >
                        <option value="">Select Category</option>
                        <option value="intake_assessment">Intake Assessment</option>
                        <option value="progress_notes">Progress Notes</option>
                        <option value="treatment_plan">Treatment Plan</option>
                        <option value="other">Other</option>
                    </select>
                    <select
                        value={progressNoteType ?? ''}
                        onChange={(e) => setProgressNoteType(e.target.value as ProgressNoteType)}
                        className="w-36 p-2 border border-gray-200 rounded-md text-xs"
                        disabled={categoryType !== 'progress_notes'}
                    >
                        <option value="">Select Progress Note Type</option>
                        <option value="soap">SOAP</option>
                        <option value="dap">DAP</option>
                        <option value="dsap">DSAP</option>
                    </select>
                </div>
                <div className="flex flex-row justify-center items-center gap-2">
                    <Button ref={resetButtonRef} variant="outline" size="sm" onClick={() => setWorkflowPromptState(workflowSummary?.prompt || '')}
                        className="px-2 py-1 text-xs"
                    >
                        Reset
                    </Button>
                    <Button ref={saveButtonRef} variant="default" size="sm"
                        className="px-2 py-1 text-xs bg-primary text-white hover:bg-primary/90"
                        onClick={handleSaveWorkflowPrompt}
                        disabled={isPending}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}