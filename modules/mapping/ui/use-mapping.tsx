import { useCallback, useRef, useState } from "react";
import { EhrPlatform, MappingStage, ElementInfo } from "../mapping.types";
import { hasZeroDimensions, isIgnoredInputElement, queryAllInputElements, queryFormElement } from "../domain/query-elements";
import { getElementLabel, getElementType, getElementOptions, getElementPlaceholder } from "../domain/get-attr";
import { getElementAbsoluteXPath, getElementPrimaryPath } from "../domain/get-path";
import { addVisualMarker, highlightVisualMarker, unhighlightVisualMarker, updateVisualMarkerIdx } from "../domain/capture-dom";
import { removeElement } from "../domain/edit-element-info";





export const useMapping = (currMode: EhrPlatform | null) => {
    const [currStage, setCurrStage] = useState<MappingStage>(MappingStage.IDLE);
    const deleteResolverRef = useRef<(() => void) | null>(null);
    const groupingResolverRef = useRef<(() => void) | null>(null);
    
    // Use refs instead of state since these don't need to trigger re-renders
    const elementInfoRef = useRef<ElementInfo>({});
    const visualMarkersRef = useRef<Map<number, HTMLElement>>(new Map());
    
    const endDelete = useCallback(() => {
        if (deleteResolverRef.current) {
            // Disable click handlers before proceeding
            visualMarkersRef.current.forEach((marker) => {
                marker.style.pointerEvents = 'none';
                marker.style.cursor = 'default';
                marker.onclick = null;
                marker.onmouseenter = null;
                marker.onmouseleave = null;
            });
            
            deleteResolverRef.current();
            deleteResolverRef.current = null;
        }
    }, []);

    const endGrouping = useCallback(() => {
        if (groupingResolverRef.current) {
            groupingResolverRef.current();
            groupingResolverRef.current = null;
        }
    }, []);

    const startMapping = useCallback(async () => {
        if (!currMode) return;
        
        if (currStage !== MappingStage.IDLE) return;

        setCurrStage(MappingStage.GETTING_FORM);

        try {
            const formEl = await queryFormElement(currMode);
            if (!formEl) {
                throw new Error('Form element not found');
            }

            formEl.style.position = 'relative';
            
            setCurrStage(MappingStage.FINDING_INPUTS);
            const allInputElements = queryAllInputElements(formEl);
            const inputElements = allInputElements.filter((el) => {
                return !isIgnoredInputElement(el) && !hasZeroDimensions(el, currMode) && getElementType(el) !== '';
            });

            setCurrStage(MappingStage.EXTRACTING_ELEMENT_INFO);

            let currIdx = 0;
            const newElementInfo: ElementInfo = {};
            const newVisualMarkers = new Map<number, HTMLElement>();

            inputElements.forEach((el) => {
                const elementType = getElementType(el);
                if (!elementType) return;

                currIdx++;
                const elementPrimaryPath = getElementPrimaryPath(el, currMode);
                const elementAbsoluteXPath = getElementAbsoluteXPath(el);
                const elementLabel = getElementLabel(el);
                const elementPlaceholder = getElementPlaceholder(el);
                const elementOptions = getElementOptions(el, currMode);
                
                const marker = addVisualMarker(el, currIdx, elementType, elementPrimaryPath, currMode, formEl);
                newVisualMarkers.set(currIdx, marker);
                
                newElementInfo[currIdx] = { 
                    elementType, 
                    elementPrimaryPath, 
                    elementAbsoluteXPath, 
                    elementLabel, 
                    elementPlaceholder, 
                    elementOptions 
                };
            });

            elementInfoRef.current = newElementInfo;
            visualMarkersRef.current = newVisualMarkers;
            
            setCurrStage(MappingStage.DELETE_INPUTS);
            
            // Function to recreate click handlers with current indices
            const setupMarkerHandlers = () => {
                visualMarkersRef.current.forEach((marker, idx) => {
                    marker.style.pointerEvents = 'auto';
                    marker.style.cursor = 'pointer';
                    marker.onclick = () => {
                        const newElementInfo = removeElement(elementInfoRef.current, idx);
                        if (newElementInfo) {
                            elementInfoRef.current = newElementInfo;
                            
                            // Update visual markers and their indices
                            const updatedMarkers = new Map<number, HTMLElement>();
                            visualMarkersRef.current.forEach((m, oldIdx) => {
                                if (oldIdx === idx) {
                                    // Skip the removed marker (already removed by removeElement)
                                    return;
                                } else if (oldIdx > idx) {
                                    // Reindex markers that come after the removed one
                                    const newIdx = oldIdx - 1;
                                    updateVisualMarkerIdx(m, newIdx);
                                    updatedMarkers.set(newIdx, m);
                                } else {
                                    // Keep markers that come before unchanged
                                    updatedMarkers.set(oldIdx, m);
                                }
                            });
                            
                            visualMarkersRef.current = updatedMarkers;
                            // Recreate all handlers with updated indices
                            setupMarkerHandlers();
                        }
                    };
                    marker.onmouseenter = () => highlightVisualMarker(marker);
                    marker.onmouseleave = () => unhighlightVisualMarker(marker);
                });
            };
            
            // Initial setup
            setupMarkerHandlers();

            // Wait for user to click "Next" button
            await new Promise<void>((resolve) => {
                deleteResolverRef.current = resolve;
            });

            setCurrStage(MappingStage.GROUP_INPUTS);

            await new Promise<void>((resolve) => {
                groupingResolverRef.current = resolve;
            });

            setCurrStage(MappingStage.COMPLETED);
            return elementInfoRef.current;
        } catch (error) {
            console.error('Error mapping', error);
            setCurrStage(MappingStage.ERROR);
            return null;
        }

    }, [currMode]);

    return {
        currStage,
        elementInfo: elementInfoRef.current,
        startMapping,
        endDelete,
        endGrouping,
    }
}