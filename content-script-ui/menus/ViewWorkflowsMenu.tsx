import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sharedStorage } from "@/modules/shared/shared.storage";
import { displayDate, navigate } from "@/modules/shared/shared.utils";
import { CategoryType, ProgressNoteType } from "@/modules/shared/types";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { useWorkflowsQueries } from "@/modules/workflows/components/use-workflows-queries";

export function ViewWorkflowsMenu( { startMapping }: { startMapping: () => Promise<any> }) {
    const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter);
    const { useGetWorkflows } = useWorkflowsQueries();
    const { data: workflows, isLoading } = useGetWorkflows(selectedCenter?.center_id ?? '');
    const [newWorkflowName, setNewWorkflowName] = useState('');
    const [newWorkflowType, setNewWorkflowType] = useState<CategoryType | null>(null);
    const [newWorkflowProgressNoteType, setNewWorkflowProgressNoteType] = useState<ProgressNoteType | null>(null);

    const handleCreateNewWorkflow = async () => {
        if (!newWorkflowName || !newWorkflowType || (newWorkflowType === 'progress_notes' && !newWorkflowProgressNoteType)) {
            return;
        }
        startMapping();
        navigate("create-workflow");
    }

    return (
        <div className="w-full flex flex-col gap-2 p-2">
            <span className="text-xs text-muted-foreground">Workflows for {selectedCenter?.center_name}</span>
            {isLoading ? (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : (!workflows || workflows.length === 0 ? (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground text-sm">No workflows found</div>
            ) : (
                <div className="w-full max-h-52 overflow-y-auto overflow-x-hidden flex flex-col gap-2 bg-white rounded-md p-2 shadow-md">
                    {workflows.map((workflow) => (
                        <div key={workflow.id} className="w-full flex flex-col justify-center items-start border-b border-gray-200 pb-2 last:border-b-0">
                            <span className="text-sm font-medium">{workflow.name}</span>
                            <span className="text-xs text-muted-foreground">{displayDate(workflow.created_at)}</span>
                        </div>
                    ))}
                </div>
            ))}
            <div className="flex flex-col justify-center items-center gap-2 w-full mt-4">
                <span className="text-xs font-medium text-muted-foreground w-full text-left" >
                    Create New Workflow
                </span>
                <input
                    type="text"
                    placeholder="Enter workflow name"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md text-sm"
                />
                <div className="flex flex-row justify-between items-center gap-2 w-full">
                    <select
                        value={newWorkflowType ?? ''}
                        onChange={(e) => setNewWorkflowType(e.target.value as CategoryType)}
                        className="flex-1 p-2 border border-gray-200 rounded-md text-xs"
                    >
                        <option value="">Select Category</option>
                        <option value="intake_assessment">Intake Assessment</option>
                        <option value="progress_notes">Progress Notes</option>
                        <option value="treatment_plan">Treatment Plan</option>
                        <option value="other">Other</option>
                    </select>
                    <select
                        value={newWorkflowProgressNoteType ?? ''}
                        onChange={(e) => setNewWorkflowProgressNoteType(e.target.value as ProgressNoteType)}
                        className="w-36 p-2 border border-gray-200 rounded-md text-xs"
                        disabled={newWorkflowType !== 'progress_notes'}
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
                 disabled={!newWorkflowName || !newWorkflowType || (newWorkflowType === 'progress_notes' && !newWorkflowProgressNoteType)}
                 >
                    Next
                </Button>
            </div>
        </div>
    )
}