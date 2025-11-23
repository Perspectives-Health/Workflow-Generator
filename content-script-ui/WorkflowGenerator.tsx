import { sharedStorage } from "@/modules/shared/shared.storage";
import { DraggableContainer } from "@/modules/shared/ui/components/draggable-container";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { ViewCenterMenu } from "./menus/ViewCenterMenu";
import { memo, useEffect } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { goBack } from "@/modules/shared/shared.utils";


const menuComponents = {
    "view-centers": <ViewCenterMenu />,
    "view-workflows": <div>View Workflows</div>,
}


export function WorkflowGenerator() {

    const { value: position } = useStorageValue(sharedStorage.position);
    const { value: currMenuItem } = useStorageValue(sharedStorage.currMenuItem);
    const currMenuComponent = currMenuItem ? menuComponents[currMenuItem] : null;
    const handleDragEnd = (position: { x: number, y: number }) => {
        sharedStorage.position.setValue(position);
    }

    useEffect(() => {
        console.log("currMenuItem", currMenuItem);
        console.log("position", position);
    }, [currMenuItem, position]);


    return (
        <DraggableContainer
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

    return (
        <div className="workflow-generator flex flex-row justify-between items-center border-b border-gray-200 pb-1">
            <button
                onClick={() => goBack()}
                disabled={!canGoBack}
                className="text-muted-foreground hover:bg-gray-300 p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent" >
                <ArrowLeftIcon className="w-4 h-4" />
            </button>
        </div>
    );
});