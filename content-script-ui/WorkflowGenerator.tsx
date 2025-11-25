import { sharedStorage } from "@/modules/shared/shared.storage";
import { DraggableContainer } from "@/modules/shared/ui/components/draggable-container";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { ViewCenterMenu } from "./menus/ViewCenterMenu";
import { memo, useEffect } from "react";
import { ArrowLeftIcon, MinusIcon } from "lucide-react";
import { goBack } from "@/modules/shared/shared.utils";
import { ViewWorkflowsMenu } from "./menus/ViewWorkflowsMenu";
import { CreateWorkflowMenu } from "./menus/CreateWorkflowMenu";
import { useMapping } from "@/modules/mapping/ui/use-mapping";
import { getMode } from "@/modules/mapping/mapping.utils";


export function WorkflowGenerator() {
    const currMode = getMode();
    
    const { value: visibility } = useStorageValue(sharedStorage.visibility);
    const { value: position } = useStorageValue(sharedStorage.position);
    const { value: currMenuItem } = useStorageValue(sharedStorage.currMenuItem);
    const { currStage, startMapping, endDelete, endGrouping } = useMapping(currMode);
    
    const menuComponents = {
        "view-centers": <ViewCenterMenu />,
        "view-workflows": <ViewWorkflowsMenu startMapping={startMapping} />,
        "create-workflow": <CreateWorkflowMenu currStage={currStage} endDelete={endDelete} endGrouping={endGrouping} />,
    };
    
    const currMenuComponent = currMenuItem ? menuComponents[currMenuItem] : null;
    const handleDragEnd = (position: { x: number, y: number }) => {
        sharedStorage.position.setValue(position);
    }


    return (
        visibility && <DraggableContainer
            initialPosition={position}
            onDragEnd={handleDragEnd}
            targetClassName=".workflow-generator"
        >
            <div className="flex flex-col w-[350px] border rounded-lg p-2 bg-gray-100">
                <TopBar />
                {currMenuComponent}
            </div>
        </DraggableContainer>
    );
}


const TopBar = memo(function TopBar() {
    const { value: backStack } = useStorageValue(sharedStorage.backStack);
    const canGoBack = backStack && backStack.length > 0;
    const logoUrl = browser.runtime.getURL('/wxt.svg');

    const handleToggleVisibility = async () => {
        const visibility = await sharedStorage.visibility.getValue();
        await sharedStorage.visibility.setValue(!visibility);
    }

    return (
        <div className="workflow-generator flex flex-row justify-between items-center border-b border-gray-200 pb-1 w-full">
            <div className="flex flex-row justify-center items-center gap-0.5">
            <button
                onClick={() => goBack()}
                disabled={!canGoBack}
                className="text-muted-foreground hover:bg-gray-300 p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" >
                <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <button
                onClick={handleToggleVisibility}
                className="text-muted-foreground hover:bg-gray-300 p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" >
                <MinusIcon className="w-4 h-4" />
            </button>
            </div>
            <img src={logoUrl} alt="WXT Logo" className="w-6 h-6" />
        </div>
    );
});