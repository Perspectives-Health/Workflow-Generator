import { EhrPlatform } from "@/modules/shared/types";


export const findElementByXPath = (xPath: string, doc?: Document): HTMLElement | null => {
    doc = doc || document;

    let element = doc.evaluate(
        xPath,
        doc,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue as HTMLElement | null;

    if (!element && xPath.startsWith('//*[@id=')) {
        const idMatch = xPath.match(/\[@id=(["'])(.*?)\1\]/);
        if (idMatch && idMatch[2]) {
            // Check if there's an index in the XPath
            const indexMatch = xPath.match(/\[@id=(["'])(.*?)\1\]\[(\d+)\]/);
            if (indexMatch && indexMatch[3]) {
                // Handle indexed id XPath for duplicate IDs
                const elements = doc.querySelectorAll(`[id="${idMatch[2]}"]`);
                const index = parseInt(indexMatch[3]) - 1; // Convert to 0-based index
                element = elements[index] as HTMLElement | null;
            } else {
                // Handle non-indexed id XPath
                element = doc.getElementById(idMatch[2]) as HTMLElement | null;
            }
        }
    }

    if (!element && xPath.startsWith('//*[@name=')) {
        const nameMatch = xPath.match(/\[@name=(["'])(.*?)\1\]/);
        if (nameMatch && nameMatch[2]) {
            // Check if there's an index in the XPath
            const indexMatch = xPath.match(/\[@name=(["'])(.*?)\1\]\[(\d+)\]/);
            if (indexMatch && indexMatch[3]) {
                // Handle indexed name XPath
                const elements = doc.querySelectorAll(`[name="${nameMatch[2]}"]`);
                const index = parseInt(indexMatch[3]) - 1; // Convert to 0-based index
                element = elements[index] as HTMLElement | null;
            } else {
                // Handle non-indexed name XPath
                element = doc.querySelector(`[name="${nameMatch[2]}"]`) as HTMLElement | null;
            }
        }
    }

    return element;
}

export const findElementAcrossIframes = (nestedXPath: string): HTMLElement | null => {
    const segments = nestedXPath.split('::');
    let currentDoc: Document = document;

    for (let i = 0; i < segments.length; i++) {
        const xPath = segments[i];

        if (!xPath) {
            console.error(`No xPath found for segment ${i + 1}`);
            return null;
        }

        const element = findElementByXPath(xPath, currentDoc);

        if (!element) {
            console.error(`Element not found at segment ${i + 1}: ${xPath}`);
            return null;
        }

        // If it's the last segment, return the element (we’re done)
        if (i === segments.length - 1) {
            return element;
        }

        // Otherwise, the element should be an iframe
        if (element.tagName !== 'IFRAME') {
            console.error(`Expected <iframe> at segment ${i + 1}, got: ${element.tagName}`);
            return null;
        }

        try {
            currentDoc = (element as HTMLIFrameElement).contentDocument as Document;
        } catch (err) {
            console.error(`Cannot access iframe at segment ${i + 1}. Possibly cross-origin.`, err);
            return null;
        }
    }

    return null;
}

/**
 * Converts a string into HTML with paragraph elements separated by newline characters.
 * Each sequence of text between newlines becomes a separate <p> element.
 * 
 * @param inputString - The input string to convert
 * @returns HTML string with paragraph elements
 */
export const convertStringToParagraphs = (inputString: string): string => {
    if (!inputString || typeof inputString !== 'string') {
        return '';
    }
    
    // Split by newline characters and filter out empty strings
    const paragraphs = inputString
        .split(/\r?\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);
    
    // If no paragraphs found, return empty string
    if (paragraphs.length === 0) {
        return '';
    }
    
    // Convert each paragraph to a <p> element
    const paragraphElements = paragraphs.map(paragraph => `<p>${paragraph}</p>`);
    
    // Join all paragraph elements
    return paragraphElements.join('');
};

export const ensureElementVisible = async (element: HTMLElement): Promise<void> => {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const isVisible = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth
    );

    if (!isVisible) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

/**
 * Retry wrapper for findElementAcrossIframes that retries after 1 second if the element is not found
 * @param nestedXPath - The XPath to search for
 * @param maxRetries - Maximum number of retries (default: 1)
 * @param retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns Promise<HTMLElement | null>
 */
export const findElementAcrossIframesWithRetry = async (
    nestedXPath: string, 
    maxRetries: number = 1, 
    retryDelay: number = 1000
): Promise<HTMLElement | null> => {
    let element = findElementAcrossIframes(nestedXPath);
    
    if (element) {
        return element;
    }
    
    // Retry up to maxRetries times
    for (let i = 0; i < maxRetries; i++) {
        console.log(`Element not found, retrying in ${retryDelay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        element = findElementAcrossIframes(nestedXPath);
        if (element) {
            console.log(`Element found on retry attempt ${i + 1}`);
            return element;
        }
    }
    
    console.error(`Element not found after ${maxRetries} retry attempts`);
    return null;
}


export const findClosestComboboxOptions = (element: HTMLElement): HTMLElement | null => {
    const candidates = document.querySelectorAll('.v-combobox__content');
    const targetY = element.getBoundingClientRect().y;

    let closestCandidate: HTMLElement | null = null;
    let minDistance = Infinity;

    candidates.forEach((candidate) => {
        const candidateY = candidate.getBoundingClientRect().y;
        const distance = Math.abs(candidateY - targetY);

        if (distance < minDistance) {
            minDistance = distance;
            closestCandidate = candidate as HTMLElement;
        }    
    });

    return closestCandidate;
}


export function synthClick(el: HTMLElement) {
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  }

  export const getMode = (): EhrPlatform | null => {
    return window.location.href.includes('reliatrax') ? EhrPlatform.RELIATRAX :
        window.location.href.includes('kipu') ? EhrPlatform.KIPU :
            window.location.href.includes('simplepractice') ? EhrPlatform.SIMPLEPRACTICE :
                window.location.href.includes('bestnotes') ? EhrPlatform.BESTNOTES :
                    window.location.href.includes('emedpractice') ? EhrPlatform.EMED :
                        window.location.href.includes('alleva') ? EhrPlatform.ALLEVA :
                            window.location.href.includes('ecwcloud') ? EhrPlatform.ECW :
                                window.location.href.includes('theranest') ? EhrPlatform.ENSORA : null;

}