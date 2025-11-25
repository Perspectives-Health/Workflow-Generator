import { EhrPlatform } from "../mapping.types";

const CLONED_FORM_ELEMENT_CLASS = 'sire-mapping-form';
export const VISUAL_MARKER_CLASS = 'visual-marker';


export function cloneHtmlElementWithStyles(element: HTMLElement): HTMLElement {
    function copyComputedStyle(source: HTMLElement, target: HTMLElement) {
        const computedStyle = getComputedStyle(source);
        for (const key of computedStyle) {
            target.style.setProperty(
                key,
                computedStyle.getPropertyValue(key),
                computedStyle.getPropertyPriority(key)
            );
        }
    }

    function deepCloneWithStyles(sourceNode: Node): Node {
        let clonedNode: Node;

        if (sourceNode.nodeType === Node.TEXT_NODE) {
            // Clone text node (preserves text content)
            clonedNode = document.createTextNode(sourceNode.nodeValue || "");
        } else if (sourceNode.nodeType === Node.ELEMENT_NODE) {
            const sourceEl = sourceNode as HTMLElement;
            const clonedEl = sourceEl.cloneNode(false) as HTMLElement;

            // Copy styles
            copyComputedStyle(sourceEl, clonedEl);

            for (const child of Array.from(sourceEl.childNodes)) {
                const clonedChild = deepCloneWithStyles(child);
                clonedEl.appendChild(clonedChild);
            }

            clonedNode = clonedEl;
        } else {
            // Skip comments or processing instructions
            clonedNode = document.createDocumentFragment();
        }

        return clonedNode;
    }
    const clonedFormElement = deepCloneWithStyles(element) as HTMLElement;
    clonedFormElement.style.position = 'relative';
    clonedFormElement.style.overflow = 'visible'; // Remove scrolling
    clonedFormElement.style.height = element.scrollHeight + 'px'; // Full vertical content
    clonedFormElement.style.width = element.scrollWidth + 'px';   // Full horizontal content if needed

    clonedFormElement.classList.add(CLONED_FORM_ELEMENT_CLASS);

    return clonedFormElement;
}

export function openInNewWindow(element: HTMLElement) {
    const newWindow = window.open('', '_blank');

    if (!newWindow) {
        console.error('Failed to open new window. Pop-ups may be blocked.');
        return;
    }

    // Set up the new window document with proper HTML structure
    newWindow.document.open();
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Captured Element</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .${CLONED_FORM_ELEMENT_CLASS} {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
            </style>
        </head>
        <body>
        </body>
        </html>
    `);
    newWindow.document.close();

    // Copy stylesheets from the parent window
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach((stylesheet) => {
        try {
            if (stylesheet.href) {
                // External stylesheet
                const link = newWindow.document.createElement('link');
                link.rel = 'stylesheet';
                link.href = stylesheet.href;
                newWindow.document.head.appendChild(link);
            } else if (stylesheet.cssRules) {
                // Inline stylesheet
                const style = newWindow.document.createElement('style');
                const cssRules = Array.from(stylesheet.cssRules);
                style.textContent = cssRules.map(rule => rule.cssText).join('\n');
                newWindow.document.head.appendChild(style);
            }
        } catch (e) {
            // CORS or other security restrictions might prevent access to some stylesheets
            console.warn('Could not copy stylesheet:', e);
        }
    });

    // Append the cloned element to the new window's body
    newWindow.document.body.appendChild(element);
}


export const addVisualMarker = (
    inputElement: Element,
    idx: number,
    elementType: string,
    xPath: string,
    mode: EhrPlatform | null,
    formElement: Element
) => {
    const visualMarker = document.createElement('div');
    visualMarker.classList.add(VISUAL_MARKER_CLASS);
    const bgColor = 'rgba(255, 165, 0, 0.8)'

    visualMarker.textContent = `${idx}`;
    // visualMarker.setAttribute('data-xpath', xPath);

    visualMarker.style.cssText = `
      position: absolute;
      background-color: ${bgColor};
      color: white;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 10px;
      z-index: 10000;
      pointer-events: none;
      font-weight: bold;
      `;

    // Check if input element has zero dimensions
    let relativeRect = inputElement.getBoundingClientRect();

    if (['textarea', 'text', 'contenteditable'].includes(elementType)) {
        if (mode === EhrPlatform.ALLEVA) {
            visualMarker.style.transform = `translate(${relativeRect.width / 2 - 10}px, ${relativeRect.height / 2 - 15}px)`;
        } else {
            visualMarker.style.transform = `translate(${relativeRect.width / 2 - 10}px, ${relativeRect.height / 2 - 5}px)`;
        }
    } else {
        visualMarker.style.transform = 'translate(0px, -10px)';
    }

    const formRect = formElement.getBoundingClientRect();

    const left = relativeRect.left - formRect.left;
    const top = relativeRect.top - formRect.top;

    visualMarker.style.left = `${left}px`;
    visualMarker.style.top = `${top}px`;

    formElement.appendChild(visualMarker);

    return visualMarker;
};


export const updateVisualMarkerIdx = (marker: HTMLElement, newIdx: number) => {
    marker.textContent = `${newIdx}`;
}


export const highlightVisualMarker = (marker: HTMLElement) => {
    marker.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
}

export const unhighlightVisualMarker = (marker: HTMLElement) => {
    marker.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
}