import { MappingStage } from "@/modules/mapping/mapping.types";
import { CheckCircle, Loader } from "lucide-react";

interface CreateWorkflowMenuProps {
    currStage: MappingStage;
    endDelete: () => void;
    endGrouping: () => void;
}

export function CreateWorkflowMenu({ currStage, endDelete, endGrouping }: CreateWorkflowMenuProps) {


    return (
        <div className="w-full flex flex-col gap-2 p-2">
            <span className="text-xs text-muted-foreground">Create New Workflow</span>
            <div className="w-full overflow-y-auto overflow-x-hidden flex flex-col gap-2 bg-white rounded-md p-2 shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        1. Getting Form Element
                    </span>
                    {currStage === MappingStage.GETTING_FORM ? (
                        <Loader className="w-4 h-4" />
                    ) : currStage > MappingStage.GETTING_FORM && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        2. Finding Input Elements
                    </span>
                    {currStage === MappingStage.FINDING_INPUTS ? (
                        <Loader className="w-4 h-4" />
                    ) : currStage > MappingStage.FINDING_INPUTS && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        3. Extracting Element Info
                    </span>
                    {currStage === MappingStage.EXTRACTING_ELEMENT_INFO ? (
                        <Loader className="w-4 h-4" />
                    ) : currStage > MappingStage.EXTRACTING_ELEMENT_INFO && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        4. Deleting Input Elements
                    </span>
                    {currStage === MappingStage.DELETE_INPUTS ? (
                        <button 
                            className="text-sm text-blue-500 hover:text-blue-600"
                            onClick={endDelete}
                        >
                            Next
                        </button>
                    ) : currStage > MappingStage.DELETE_INPUTS && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                </div>
                {currStage === MappingStage.DELETE_INPUTS && (
                    <span className="w-full text-center p-3 text-muted-foreground text-sm">
                        Click on visual markers to delete input elements from the mapping. <br />
                        Click "Next" once you are done.
                    </span>
                )}
                <div className="w-full flex flex-row justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        5. Grouping Input Elements
                    </span>
                    {currStage === MappingStage.GROUP_INPUTS ? (
                        <button 
                        className="text-sm text-blue-500 hover:text-blue-600"
                        onClick={endGrouping}
                    >
                        Next
                    </button>
                    ) : currStage > MappingStage.GROUP_INPUTS && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        6. Completed
                    </span>
                    {currStage === MappingStage.COMPLETED ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : currStage > MappingStage.COMPLETED && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                </div>
            </div>
        </div>
    );
}