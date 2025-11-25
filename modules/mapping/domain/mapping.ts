import { getMode } from "../mapping.utils";
import { hasZeroDimensions, isIgnoredInputElement, queryAllInputElements, queryFormElement } from "./query-elements";
import { addVisualMarker, cloneHtmlElementWithStyles, openInNewWindow } from "./capture-dom";
import { getElementLabel, getElementOptions, getElementPlaceholder, getElementType } from "./get-attr";
import { getElementAbsoluteXPath, getElementPrimaryPath } from "./get-path";


const currMode = getMode();

export const smartMap = async (

) => {
    try {
        // 1. Get form element
        const formEl = await queryFormElement(currMode);
        console.log('formEl', formEl);
        if (!formEl) {
            throw new Error('Form element not found');
        }
        formEl.style.position = 'relative';
        // 2. Find all input elements
        const allInputElements = queryAllInputElements(formEl);
        const inputElements = allInputElements.filter((el) => {
            return !isIgnoredInputElement(el) && !hasZeroDimensions(el, currMode) && getElementType(el) !== '';
        })

        let currIdx = 0;
        const elementInfo = inputElements.reduce((acc, el) => {
            const elementType = getElementType(el);
            if (!elementType) return acc;

            currIdx++;
            console.log(el, isIgnoredInputElement(el), hasZeroDimensions(el, currMode), getElementType(el));
            const elementPrimaryPath = getElementPrimaryPath(el, currMode);
            const elementAbsoluteXPath = getElementAbsoluteXPath(el);
            const elementLabel = getElementLabel(el);
            const elementPlaceholder = getElementPlaceholder(el);
            const elementOptions = getElementOptions(el, currMode);
            addVisualMarker(el, currIdx, elementType, elementPrimaryPath, currMode, formEl);
            return { ...acc, [currIdx]: { elementType, elementPrimaryPath, elementAbsoluteXPath, elementLabel, elementPlaceholder, elementOptions } };
        }, {});

        console.log('elementInfo', elementInfo);

        // const clonedFormElement = cloneHtmlElementWithStyles(formEl);
        // openInNewWindow(clonedFormElement);
        // 3. Expand from
        // 4. Filter out input elements
        // 5. Extract xpaths

    } catch (error) {
        console.error('Error smart mapping', error);
    }
}