import { useCallback, useRef, useState } from "react";
import { EhrPlatform, MappingStage, ElementInfo, CategoryType, ProgressNoteType } from "@/modules/shared/types";
import { hasZeroDimensions, isIgnoredInputElement, queryAllInputElements, queryFormElement } from "../domain/query-elements";
import { getElementLabel, getElementType, getElementOptions, getElementPlaceholder, getElementSimplifiedType } from "../domain/get-attr";
import { getElementAbsoluteXPath, getElementPrimaryPath } from "../domain/get-path";
import { ABSOLUTE_XPATH_ATTRIBUTE, addVisualMarker, appendCloneToBody, captureScreenshot, cleanupClonedElements, cloneHtmlElementWithStyles, highlightVisualMarker, openInNewWindow, PRIMARY_PATH_ATTRIBUTE, unhighlightVisualMarker, updateVisualMarkerIdx } from "../domain/capture-dom";
import { removeElement } from "../domain/edit-element-info";
import { useWorkflowsQueries } from "@/modules/workflows/components/use-workflows-queries";
import { goBack, navigate } from "@/modules/shared/shared.utils";

export interface WorkflowFormData {
    workflowName: string;
    workflowCategory: CategoryType | null;
    workflowProgressNoteType: ProgressNoteType | null;
    centerId?: string;
    enterpriseId?: string;
}

export const useMapping = (currMode: EhrPlatform | null) => {
    const [currStage, setCurrStage] = useState<MappingStage>(MappingStage.IDLE);
    const { useMapWorkflow } = useWorkflowsQueries();
    const { mutateAsync: mapWorkflow } = useMapWorkflow();

    const deleteResolverRef = useRef<(() => void) | null>(null);
    const screenshotRef = useRef<string>('');
    const elementInfoRef = useRef<ElementInfo>({});
    const visualMarkersRef = useRef<Map<number, HTMLElement>>(new Map());
    const formDataRef = useRef<WorkflowFormData | null>(null);
    
    const endDelete = useCallback(() => {
        if (deleteResolverRef.current) {
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

    const startMapping = useCallback(async (formData: WorkflowFormData) => {
        if (!currMode) return;
        if (currStage !== MappingStage.IDLE) return;

        // Store form data at the start when values are current
        formDataRef.current = formData;

        setCurrStage(MappingStage.GETTING_FORM);

        try {
            const formEl = await queryFormElement(currMode);
            if (!formEl) {
                throw new Error('Form element not found');
            }
                
            setCurrStage(MappingStage.CLONING_FORM);
            const clonedFormEl = cloneHtmlElementWithStyles(formEl, currMode);
            appendCloneToBody(clonedFormEl);
            
            setCurrStage(MappingStage.FINDING_INPUTS);
            const allInputElements = queryAllInputElements(clonedFormEl);
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
                const elementPrimaryPath = el.getAttribute(PRIMARY_PATH_ATTRIBUTE) || '';
                const elementAbsoluteXPath = el.getAttribute(ABSOLUTE_XPATH_ATTRIBUTE) || '';
                const elementLabel = getElementLabel(el);
                const elementPlaceholder = getElementPlaceholder(el);
                const elementOptions = getElementOptions(el, currMode);
                
                const marker = addVisualMarker(el, currIdx, elementType, elementPrimaryPath || elementAbsoluteXPath, currMode, clonedFormEl);
                newVisualMarkers.set(currIdx, marker);
                
                newElementInfo[currIdx] = { 
                    elementType: getElementSimplifiedType(elementType), 
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
            
            const setupMarkerHandlers = () => {
                visualMarkersRef.current.forEach((marker, idx) => {
                    marker.style.pointerEvents = 'auto';
                    marker.style.cursor = 'pointer';
                    marker.onclick = () => {
                        const newElementInfo = removeElement(elementInfoRef.current, idx);
                        if (newElementInfo) {
                            elementInfoRef.current = newElementInfo;
                            
                            const updatedMarkers = new Map<number, HTMLElement>();
                            visualMarkersRef.current.forEach((m, oldIdx) => {
                                if (oldIdx === idx) {
                                    return;
                                } else if (oldIdx > idx) {
                                    const newIdx = oldIdx - 1;
                                    updateVisualMarkerIdx(m, newIdx);
                                    updatedMarkers.set(newIdx, m);
                                } else {
                                    updatedMarkers.set(oldIdx, m);
                                }
                            });
                            
                            visualMarkersRef.current = updatedMarkers;
                            setupMarkerHandlers();
                        }
                    };
                    marker.onmouseenter = () => highlightVisualMarker(marker);
                    marker.onmouseleave = () => unhighlightVisualMarker(marker);
                });
            };
            
            setupMarkerHandlers();

            await new Promise<void>((resolve) => {
                deleteResolverRef.current = resolve;
            });

            setCurrStage(MappingStage.CAPTURING_SCREENSHOT);
            const base64Image = await captureScreenshot(clonedFormEl);
            screenshotRef.current = base64Image;

            setCurrStage(MappingStage.SENDING);
            const metadataArray = Object.entries(elementInfoRef.current).map(([key, value]) => ({
                index: parseInt(key),
                xpath: value.elementPrimaryPath || value.elementAbsoluteXPath,
                type: value.elementType,
                label: value.elementType === 'select' ? value.elementOptions : value.elementLabel,
                placeholder: value.elementPlaceholder,
            }));

            const newMetadataArray = metadataArray.map((metadata) => {
                // Handle select types with empty options - convert to free_response
                if ((metadata.type === 'select') && Array.isArray(metadata.label) && metadata.label.length === 0) {
                    return {
                        ...metadata,
                        label: "",
                        type: "free_response"
                    }
                }
                return metadata;
            });
            
            const { workflowName, workflowCategory, workflowProgressNoteType, centerId, enterpriseId } = formDataRef.current!;
            
            console.log(newMetadataArray);
            console.log(base64Image)
            const response = await mapWorkflow({
                workflowName,
                metadata: newMetadataArray,
                centerId,
                enterpriseId,
                screenshot: base64Image,
                categoryInstructions: {
                    selected_category: workflowCategory,
                    progress_note_type: workflowProgressNoteType,
                }
            });
            console.log('response', response);

            setCurrStage(MappingStage.COMPLETED);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            goBack();
            // return elementInfoRef.current;/
        } catch (error) {
            console.error('Error mapping', error);
            setCurrStage(MappingStage.ERROR);
            return null;
        } finally {
            cleanupClonedElements();
        }

    }, [currMode]);

    return {
        currStage,
        elementInfo: elementInfoRef.current,
        startMapping,
        endDelete,
    }
}
