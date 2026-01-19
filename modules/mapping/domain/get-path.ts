import { EhrPlatform } from "@/modules/shared/types";


/**
 * Escape an attribute value to be used in a CSS selector
 * @param val - The value to escape
 * @returns The escaped value
 */
const escapeAttr = (val: string) => val.replace(/"/g, '&quot;');


const getEmrSpecificIdAttr = (mode: EhrPlatform): string[] | null => {
    switch (mode) {
        case EhrPlatform.BESTNOTES:
            return ['data-linkid', 'data-linkid-index'];
        default:
            return null;
    }
}


/**
 * Check if the path is injective (no two elements with the same path)
 * @param path - The path to check
 * @param formElement - The form element to check the path in
 * @returns True if the path is injective, false otherwise
 */
export const isPathInjective = (path: string): boolean => {
    try {
        const elements = document.querySelectorAll(path);
        return elements.length === 1;
    } catch (error) {
        return false;
    }
}


const buildRelativePath = (
    from: Element,
    to: Element
): string => {
    let path = '';
    let current: Element | null = to;

    while (current && current !== from) {
        const parent: Element | null = current.parentElement;
        if (!parent) break;

        const siblings = Array.from(parent.children).filter(
            (child) => child.tagName === current!.tagName
        );
        const index = siblings.length > 1 ? `[${siblings.indexOf(current) + 1}]` : '';

        let attrFilter = '';

        path = `/${current.tagName.toLowerCase()}${index}${attrFilter}${path}`;
        current = parent;
    }

    return path;
};


const getUniqueElementId = (element: Element): string | null => {
    const id = element.getAttribute('id');
    if (!id) return null;

    // Check if there are multiple elements with the same id (invalid HTML but happens in some EMRs)
    const elementsWithSameId = document.querySelectorAll(`[id="${id}"]`);

    if (elementsWithSameId.length > 1) {
        // Find the index of the current element among elements with the same id
        const index = Array.from(elementsWithSameId).indexOf(element) + 1;
        return `//*[@id="${id}"][${index}]`;
    }

    return `//*[@id="${id}"]`;
}


const getUniqueElementName = (element: Element): string | null => {
    if (!element) return null;

    const name = element.getAttribute('name');
    if (!name) return null;

    // Check if there are multiple elements with the same name
    const elementsWithSameName = document.querySelectorAll(`[name="${name}"]`);

    if (elementsWithSameName.length > 1) {
        // Find the index of the current element among elements with the same name
        const index = Array.from(elementsWithSameName).indexOf(element) + 1;
        return `//*[@name="${name}"][${index}]`;
    }

    return `//*[@name="${name}"]`;
}


export const getEmrSpecificPath = (element: Element, mode: EhrPlatform | null): string | null => {
    if (!element || !mode) return null;
    const emrSpecificIdAttrs = getEmrSpecificIdAttr(mode);
    if (!emrSpecificIdAttrs) return null;

    for (const emrSpecificIdAttr of emrSpecificIdAttrs) {
        // Traverse up to find the nearest unique data-linkid anchor
        let anchor: Element | null = element;
        while (anchor && anchor !== document.body) {
            if (anchor.hasAttribute(emrSpecificIdAttr)) {
                const emrSpecificId = anchor.getAttribute(emrSpecificIdAttr);
                // console.log('dataLinkId', dataLinkId);
                // console.log('document.querySelectorAll(`[${emrSpecificIdAttr}="${emrSpecificId}"]`)', document.querySelectorAll(`[${emrSpecificIdAttr}="${emrSpecificId}"]`));
                if (
                    emrSpecificId &&
                    document.querySelectorAll(`[${emrSpecificIdAttr}="${emrSpecificId}"]`).length === 1
                ) {
                    const anchorXPath = `//*[@${emrSpecificIdAttr}="${emrSpecificId}"]`;
                    // console.log('anchorXPath', anchorXPath);
                    const relativePath = buildRelativePath(anchor, element);
                    console.log('anchorXPath', anchorXPath);
                    console.log('relativePath', relativePath);
                    return anchorXPath + relativePath;
                }
            }
            anchor = anchor.parentElement;
        }
    }

    return null;
};


export const getElementPrimaryPath = (element: Element, mode: EhrPlatform | null): string => {
    if (mode === EhrPlatform.RELIATRAX) {
        return getElementAbsoluteXPath(element);
    }
    // 1. Check if element has an emr specific ID attribute. Skip if mode is null.
    const emrSpecificPath = mode ? getEmrSpecificPath(element, mode) : null;
    if (emrSpecificPath) {
        return emrSpecificPath;
    }

    // 2. Check if element's ID is unique
    const elementId = getUniqueElementId(element);
    if (elementId) {
        return elementId;
    }

    // 3. Check if element's name attribute is unique
    const elementName = getUniqueElementName(element);
    if (elementName) {
        return elementName;
    }


    // 5. Traverse up to find ancestor with unique ID
    let current: Element | null = element.parentElement;
    while (current) {
        const uniqueElementId = getUniqueElementId(current);
        if (uniqueElementId) {
            const relativePath = buildRelativePath(current, element);
            return `${uniqueElementId}${relativePath}`;
        }
        current = current.parentElement;
    }

    // 6. Traverse up to find ancestor with unique name attribute
    current = element.parentElement;
    while (current) {
        const uniqueElementName = getUniqueElementName(current);
        if (uniqueElementName) {
            const relativePath = buildRelativePath(current, element);
            return `${uniqueElementName}${relativePath}`;
        }
        current = current.parentElement;
    }

    // 5. Fallback: build path from document root
    return buildRelativePath(document.documentElement, element);
}


export const getElementAbsoluteXPath = (element: Element): string => {
    if (!element) return '';
    if (element === document.body) return '/html/body';
    let comp = element;
    let xpath = '';
    let siblings;
    while (comp && comp.nodeType === Node.ELEMENT_NODE && comp !== document.body) {
        let index = 1;
        if (comp.parentNode && (comp.parentNode as Element).children) {
            siblings = Array.from((comp.parentNode as Element).children).filter(
                sibling => sibling.tagName === comp.tagName
            );
            if (siblings.length > 1) {
                index = siblings.indexOf(comp) + 1;
                xpath = `/${comp.tagName.toLowerCase()}[${index}]${xpath}`;
            } else {
                xpath = `/${comp.tagName.toLowerCase()}${xpath}`;
            }
            comp = comp.parentNode as Element;
        } else {
            break;
        }
    }
    return `/html/body${xpath}`;
};

// const getEmrSpecificPath = (element) => {
//     if (!element) return null;
//     const emrSpecificIdAttr = 'data-linkid';

//     // Traverse up to find the nearest unique data-linkid anchor
//     let anchor = element;
//     while (anchor && anchor !== document.body) {
//         if (anchor.hasAttribute(emrSpecificIdAttr)) {
//             const emrSpecificId = anchor.getAttribute(emrSpecificIdAttr);
//             if (
//                 emrSpecificId &&
//                 document.querySelectorAll(`[${emrSpecificIdAttr}="${emrSpecificId}"]`).length === 1
//             ) {
//                 const anchorXPath = `//*[@${emrSpecificIdAttr}="${emrSpecificId}"]`;
//                 const relativePath = buildRelativePath(anchor, element);
//                 return anchorXPath + relativePath;
//             }
//         }
//         anchor = anchor.parentElement;
//     }

//     return null;
// };

// const buildRelativePath = (from, to) => {
//     let path = '';
//     let current = to;

//     while (current && current !== from) {
//         const parent = current.parentElement;
//         if (!parent) break;

//         const siblings = Array.from(parent.children).filter(
//             (child) => child.tagName === current.tagName
//         );
//         const index = siblings.length > 1 ? `[${siblings.indexOf(current) + 1}]` : '';

//         path = `/${current.tagName.toLowerCase()}${index}${path}`;
//         current = parent;
//     }

//     return path;
// };

