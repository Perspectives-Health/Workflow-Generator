import { EhrPlatform } from "../mapping.types";


/**
 * Escape an attribute value to be used in a CSS selector
 * @param val - The value to escape
 * @returns The escaped value
 */
const escapeAttr = (val: string) => val.replace(/"/g, '&quot;');


const getEmrSpecificIdAttr = (mode: EhrPlatform): string | null => {
    switch (mode) {
        case EhrPlatform.BESTNOTES:
            return 'data-linkid';
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
    const elements = document.querySelectorAll(path);
    return elements.length === 1;
}


const buildRelativePath = (
    from: Element,
    to: Element,
    useAttributes: boolean = true
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
        if (useAttributes) {
            const parts: string[] = [];

            const type = current.getAttribute('type');
            if (type) parts.push(`@type="${escapeAttr(type)}"`);

            const name = current.getAttribute('name');
            if (name) parts.push(`@name="${escapeAttr(name)}"`);

            if (parts.length > 0) {
                attrFilter = `[${parts.join(' and ')}]`;
            }
        }

        path = `/${current.tagName.toLowerCase()}${index}${attrFilter}${path}`;
        current = parent;
    }

    return path;
};


const getUniqueElementId = (element: Element): string | null => {
    const elementId = element.id;
    if (elementId && isPathInjective(`#${elementId}`)) {
        return `//*[@id="${elementId}"]`;
    }
    return null;
}


const getUniqueElementName = (element: Element): string | null => {
    const elementName = element.getAttribute('name');
    if (elementName && isPathInjective(`[name="${elementName}"]`)) {
        return `//*[@name="${elementName}"]`;
    }
    return null;
}


const getEmrSpecificUniqueElementId = (element: Element, mode: EhrPlatform): string | null => {
    const emrSpecificIdAttr = getEmrSpecificIdAttr(mode);
    if (emrSpecificIdAttr) {
        const emrSpecificId = element.getAttribute(emrSpecificIdAttr);
        if (emrSpecificId && isPathInjective(`[${emrSpecificIdAttr}="${emrSpecificId}"]`)) {
            return `//*[@${emrSpecificIdAttr}="${emrSpecificId}"]`;
        }
    }
    return null;
}


export const getElementPrimaryPath = (element: Element, mode: EhrPlatform | null): string => {
    // 1. Check if element has an emr specific ID attribute. Skip if mode is null.
    const emrSpecificUniqueElementId = mode ? getEmrSpecificUniqueElementId(element, mode) : null;
    if (emrSpecificUniqueElementId) {
        return emrSpecificUniqueElementId;
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

    // 4. Traverse up to find ancestor with unique EMR specific ID
    // Skip if mode is null.
    if (mode) {
        let currNode: Element | null = element.parentElement;
        while (currNode) {
            const uniqueEmrSpecificElementId = getEmrSpecificUniqueElementId(currNode, mode);
            if (uniqueEmrSpecificElementId) {
                const relativePath = buildRelativePath(currNode, element, true);
                return `${uniqueEmrSpecificElementId}${relativePath}`;
            }
            currNode = currNode.parentElement;
        }
    }

    // 5. Traverse up to find ancestor with unique ID
    let current: Element | null = element.parentElement;
    while (current) {
        const uniqueElementId = getUniqueElementId(current);
        if (uniqueElementId) {
            const relativePath = buildRelativePath(current, element, true);
            return `${uniqueElementId}${relativePath}`;
        }
        current = current.parentElement;
    }

    // 6. Traverse up to find ancestor with unique name attribute
    current = element.parentElement;
    while (current) {
        const uniqueElementName = getUniqueElementName(current);
        if (uniqueElementName) {
            const relativePath = buildRelativePath(current, element, true);
            return `${uniqueElementName}${relativePath}`;
        }
        current = current.parentElement;
    }

    // 5. Fallback: build path from document root
    return buildRelativePath(document.documentElement, element, true);
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

