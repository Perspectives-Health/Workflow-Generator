import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/modules/shared/ui/components/button";
import { sharedStorage } from "@/modules/shared/shared.storage";
import { displayDate, navigate } from "@/modules/shared/shared.utils";
import { CategoryType, ProgressNoteType } from "@/modules/shared/types";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { useWorkflowsQueries } from "@/modules/workflows/components/use-workflows-queries";
import { OverflowMenu } from "@/modules/shared/ui/components/overflow-menu";
import { DropdownMenuItem } from "@/modules/shared/ui/components/dropdown-menu";
import { TextInput } from "@/modules/shared/ui/components/text-input";
import { WorkflowFormData } from "@/modules/mapping/ui/use-mapping";
import { Loader } from "lucide-react";
import { useCentersQueries } from "@/modules/centers/ui/use-centers-queries";
import { TextArea } from "@/modules/shared/ui/components/textarea";


interface ViewWorkflowsMenuProps {
    startMapping: (formData: WorkflowFormData) => Promise<any>;
}


export function ViewWorkflowsMenu({ startMapping }: ViewWorkflowsMenuProps) {
    const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter);
    const { useGetCenterDetails, useUpdateCenterPromptConfig } = useCentersQueries();
    const { useGetWorkflows, useDeleteWorkflow, useUpdateWorkflow } = useWorkflowsQueries();
    const { data: workflows, isLoading } = useGetWorkflows(selectedCenter?.center_id ?? '');
    const { mutateAsync: deleteWorkflow, isPending: isDeletingWorkflow } = useDeleteWorkflow();
    const { mutateAsync: updateWorkflow } = useUpdateWorkflow();
    const { data: centerDetails, isLoading: isCenterDetailsLoading } = useGetCenterDetails(selectedCenter?.center_id ?? '');
    const { mutateAsync: updateCenterPrompt } = useUpdateCenterPromptConfig(selectedCenter?.center_id ?? '');

    const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
    const [newWorkflowName, setNewWorkflowName] = useState<string>('');
    const [centerPromptState, setCenterPromptState] = useState<string | null>(null);
    const [centerPromptSaveStatus, setCenterPromptSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const resetButtonRef = useRef<HTMLButtonElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    // Form state managed locally
    const [workflowName, setWorkflowName] = useState('');
    const [workflowCategory, setWorkflowCategory] = useState<CategoryType | null>(null);
    const [workflowProgressNoteType, setWorkflowProgressNoteType] = useState<ProgressNoteType | null>(null);

    // Sort workflows with in_progress first
    const sortedWorkflows = useMemo(() => {
        if (!workflows) return [];
        return [...workflows].sort((a, b) => {
            if (a.mapping_status === 'in_progress' && b.mapping_status !== 'in_progress') return -1;
            if (a.mapping_status !== 'in_progress' && b.mapping_status === 'in_progress') return 1;
            return 0;
        });
    }, [workflows]);

    const centerPrompt = useMemo(() => {
        const centerInstructions = centerDetails?.prompt_config?.center_instructions as { prompt?: string } | undefined;
        return centerInstructions?.prompt;
    }, [centerDetails]);

    useEffect(() => {
        setCenterPromptState(centerPrompt || '');
        console.log('centerPrompt', centerPrompt);
    }, [centerPrompt]);

    useEffect(() => {
        if (centerPromptSaveStatus !== 'idle') {
            const timer = setTimeout(() => {
                setCenterPromptSaveStatus('idle');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [centerPromptSaveStatus]);

    const handleCreateNewWorkflow = async () => {
        if (!workflowName || !workflowCategory || (workflowCategory === 'progress_notes' && !workflowProgressNoteType)) {
            return;
        }
        startMapping({
            workflowName,
            workflowCategory,
            workflowProgressNoteType,
            centerId: selectedCenter?.center_id ?? '',
        });
        navigate("create-workflow");
    }

    const handleSelectWorkflow = async (workflowId: string) => {
        await sharedStorage.selectedWorkflowId.setValue(workflowId);
        navigate("manage-workflow");
    }

    useEffect(() => {
        if (editingWorkflowId) {
            setNewWorkflowName(workflows?.find((workflow) => workflow.workflow_id === editingWorkflowId)?.workflow_name ?? '');
        }
    }, [editingWorkflowId]);

    const handleEdit = async (e: Event, workflowId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingWorkflowId(workflowId);
    }

    const handleDelete = async (e: Event, workflowId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedCenter || isDeletingWorkflow) {
            return;
        }
        await deleteWorkflow({ centerId: selectedCenter.center_id, workflowId });
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, workflowId: string) => {
        if (e.key === 'Enter') {
            if (!selectedCenter) return;
            try {
                await updateWorkflow({ workflowId, name: newWorkflowName, centerId: selectedCenter.center_id });
                setEditingWorkflowId(null);
            } catch (error) {
                console.error("handleKeyDown error", error);
            }
        }
        else if (e.key === 'Escape') {
            setEditingWorkflowId(null);
        }
    }

    const handleUpdateCenterPrompt = async () => {
        if (!selectedCenter) return;
        try {
            await updateCenterPrompt({
                prompt_config: {
                    center_instructions: {
                        prompt: centerPromptState
                    }
                }
            });
            setCenterPromptSaveStatus('success');
        } catch (error) {
            console.error("handleUpdateCenterPrompt error", error);
            setCenterPromptSaveStatus('error');
        }
    }

    // Reset save status after 2 seconds
    useEffect(() => {
        if (centerPromptSaveStatus !== 'idle') {
            const timer = setTimeout(() => {
                setCenterPromptSaveStatus('idle');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [centerPromptSaveStatus]);

    return (
        <div className="w-full flex flex-col gap-2 p-2">
            <span className="text-xs text-muted-foreground">System Prompt for {selectedCenter?.center_name}</span>
            <TextArea
                value={centerPromptState || ''}
                onChange={(e) => setCenterPromptState(e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm"
                maxHeight={400}
                ignoreBlurRefs={[resetButtonRef, saveButtonRef]}
            />
            <div className="flex flex-row justify-end items-center gap-2 w-full">
                {centerPromptSaveStatus === 'success' ? (
                    <span className="text-xs text-green-500 font-medium">Saved!</span>
                ) : centerPromptSaveStatus === 'error' ? (
                    <span className="text-xs text-red-500 font-medium">Error saving</span>
                ) : (
                    <>
                        <Button ref={resetButtonRef} variant="outline" size="sm" onClick={() => setCenterPromptState(centerPrompt || '')}
                            className="px-2 py-1 text-xs"
                        >
                            Reset
                        </Button>
                        <Button ref={saveButtonRef} variant="default" size="sm"
                            className="px-2 py-1 text-xs bg-primary text-white hover:bg-primary/90"
                            onClick={handleUpdateCenterPrompt}>
                            Save
                        </Button>
                    </>
                )}
            </div>
            <span className="text-xs text-muted-foreground">Workflows for {selectedCenter?.center_name}</span>
            {isLoading ? (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : (!workflows || workflows.length === 0 ? (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground text-sm">No workflows found</div>
            ) : (
                <div className="w-full max-h-52 overflow-y-auto overflow-x-hidden flex flex-col bg-white rounded-md shadow-md">
                    {sortedWorkflows.map((workflow) => (
                        <div key={workflow.workflow_id} className={`w-full flex flex-row justify-between items-center border-b border-gray-200 
                        last:border-b-0 cursor-pointer hover:bg-gray-100 duration-300 ease-in-out py-2 px-3 ${workflow.mapping_status === 'in_progress' ? 'pointer-events-none' : ''} relative`}
                            onClick={() => handleSelectWorkflow(workflow.workflow_id)}>
                            {workflow.mapping_status === 'in_progress' && (
                                <div className="absolute top-0 left-0 w-full h-full bg-gray-100/50 flex items-center justify-center">
                                    <Loader className="w-4 h-4 animate-spin" />
                                </div>
                            )}
                            <div className="flex flex-col justify-center items-start flex-1">
                                {editingWorkflowId === workflow.workflow_id ? (
                                    <TextInput
                                        type="text"
                                        value={newWorkflowName}
                                        onChange={(e) => setNewWorkflowName(e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => handleKeyDown(e, workflow.workflow_id)}
                                    />
                                ) : (
                                    <span className="text-sm font-medium">{workflow.workflow_name}</span>
                                )}
                                <span className="text-xs text-muted-foreground">{displayDate(workflow.created_at ?? '')}</span>
                            </div>
                            <div onClick={(e) => e.stopPropagation()} >
                                <OverflowMenu
                                    contentProps={{ sideOffset: 5, align: 'end' }}
                                    triggerProps={{ 'aria-label': `Actions for ${workflow.workflow_name}`, className: "[&_svg]:w-5 [&_svg]:h-5" }}
                                >
                                    <DropdownMenuItem
                                        onSelect={(e) => handleEdit(e, workflow.workflow_id)}
                                    >
                                        Edit Workflow Name
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => handleDelete(e, workflow.workflow_id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        Delete Workflow
                                    </DropdownMenuItem>
                                </OverflowMenu>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            <div className="flex flex-col justify-center items-center gap-2 w-full mt-4">
                <span className="text-xs font-medium text-muted-foreground w-full text-left" >
                    Create New Workflow
                </span>
                <TextInput
                    type="text"
                    placeholder="Enter workflow name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md text-sm"
                />
                <div className="flex flex-row justify-between items-center gap-2 w-full">
                    <select
                        value={workflowCategory ?? ''}
                        onChange={(e) => setWorkflowCategory(e.target.value as CategoryType)}
                        className="flex-1 p-2 border border-gray-200 rounded-md text-xs"
                    >
                        <option value="">Select Category</option>
                        <option value="intake_assessment">Intake Assessment</option>
                        <option value="progress_notes">Progress Notes</option>
                        <option value="treatment_plan">Treatment Plan</option>
                        <option value="other">Other</option>
                    </select>
                    <select
                        value={workflowProgressNoteType ?? ''}
                        onChange={(e) => setWorkflowProgressNoteType(e.target.value as ProgressNoteType)}
                        className="w-36 p-2 border border-gray-200 rounded-md text-xs"
                        disabled={workflowCategory !== 'progress_notes'}
                    >
                        <option value="">Select Progress Note Type</option>
                        <option value="soap">SOAP</option>
                        <option value="dap">DAP</option>
                        <option value="dsap">DSAP</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-row justify-end w-full">
                <Button variant="default"
                    size="sm"
                    onClick={handleCreateNewWorkflow}
                    className="px-3 py-2 text-xs bg-primary text-white hover:bg-primary/90"
                    disabled={!workflowName || !workflowCategory || (workflowCategory === 'progress_notes' && !workflowProgressNoteType)}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
