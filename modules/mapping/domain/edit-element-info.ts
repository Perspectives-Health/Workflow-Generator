import { ReceiptTurkishLiraIcon } from "lucide-react";
import { ElementInfo } from "../mapping.types";
import { VISUAL_MARKER_CLASS } from "./capture-dom";

export const removeElement = (elementInfo: ElementInfo, idxToDelete: number) => {
    const targetVisualMarkers = Array.from(document.querySelectorAll(`.${VISUAL_MARKER_CLASS}`))
        .filter((marker) => marker.textContent === `${idxToDelete}`);
    if (targetVisualMarkers.length !== 1) return;

    const targetVisualMarker = targetVisualMarkers[0];
    targetVisualMarker.remove();

    // Delete the target element first
    delete elementInfo[idxToDelete];
    // Rebuild elementInfo with reindexed keys for elements after the deleted one
    const newElementInfo: ElementInfo = Object.entries(elementInfo).reduce((acc, info) => {
        const elementInfoKey = Number(info[0]);
        if (elementInfoKey < idxToDelete) {
            acc[elementInfoKey] = info[1];
        } else {
            acc[elementInfoKey - 1] = info[1];
        }
        return acc;
    }, {} as ElementInfo);
    
    return newElementInfo;
}
