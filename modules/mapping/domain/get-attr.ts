import { EhrPlatform } from "@/modules/shared/types";


export const getElementType = (element: Element): string => {
    let elementType = element.tagName.toLowerCase();
    if (elementType === 'input') {
        elementType = (element as HTMLInputElement).type || 'input';
        if (elementType === 'hidden' || elementType === 'submit' || elementType === 'button') return '';
    }
    if (element.hasAttribute('contenteditable')) {
        elementType = 'contenteditable';
    }
    if (element.getAttribute('role') === 'combobox') {
        elementType = 'combobox';
    }

    return elementType;
}


export const getElementSimplifiedType = (elementType: string): string => {
    if (['contenteditable', 'textarea', 'text'].includes(elementType)) {
        return 'free_response';
    }

    else if (elementType === 'combobox') return 'select';

    return elementType;
}


export const getElementLabel = (element: Element): string => {
    const labelableElement = element as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);

    if (labelableElement.labels && labelableElement.labels.length > 0) {
        // If found, combine the text content of all associated labels.
        const labelTexts = Array.from(labelableElement.labels)
            .map(label => label.textContent?.trim() || '')
            .filter(text => text.length > 0);

        if (labelTexts.length > 0) {
            return labelTexts.join(' ');
        }
    }

    // --- 2. Check for Explicit Association using 'for' attribute ---
    if (element.id) {
        const selector = `label[for="${element.id}"]`;
        const labelElement = document.querySelector<HTMLLabelElement>(selector);

        if (labelElement) {
            // Use textContent and trim for clean result
            return labelElement.textContent?.trim() ?? '';
        }
    }

    // --- 3. Check for ARIA Label (Accessibility Fallback) ---
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
        return ariaLabel.trim();
    }

    // --- 4. No Label Found ---
    return '';
};


export const getElementPlaceholder = (element: Element): string => {
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) {
        return placeholder.trim();
    }
    return '';
}


export const getElementOptions = (element: Element, mode: EhrPlatform | null): string[] => {
    if (element instanceof HTMLSelectElement) {
        const options = Array.from((element as HTMLSelectElement).options);
        return options.map(option => option.label || option.text || '');
    }

    if (element.getAttribute('role') === 'combobox' && mode === EhrPlatform.BESTNOTES) {
        return getComboboxOptions(element);
    }

    return [];
}


export const getComboboxOptions = (element: Element): string[] => {
    let current: Element | null = element;
    
    // Traverse up the DOM tree to find ancestor with data-options attribute
    while (current) {
        if (current.hasAttribute('data-options')) {
            const dataOptions = current.getAttribute('data-options');
            if (dataOptions) {
                try {
                    // Decode HTML entities (e.g., &quot; -> ")
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(`<!DOCTYPE html><body>${dataOptions}`, 'text/html');
                    const decodedOptions = doc.body.textContent || '';
                    
                    // Parse the JSON array
                    const options = JSON.parse(decodedOptions);
                    
                    // Extract the text values from the array
                    return options.map((option: any) => option.text || option.title || option.value || '');
                } catch (error) {
                    console.error('Failed to parse combobox options:', error);
                    return [];
                }
            }
        }
        current = current.parentElement;
    }
    
    return [];
}