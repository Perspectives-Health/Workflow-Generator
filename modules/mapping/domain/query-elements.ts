import { EhrPlatform } from "@/modules/shared/types";


export const queryFormElement = async (mode: EhrPlatform | null) => {
    let formEl: HTMLElement | null = null;
    switch (mode) {
        case EhrPlatform.KIPU:
            formEl = document.querySelector('#evaluation')
            break;
        case EhrPlatform.RELIATRAX:
            formEl = document.querySelector(".notePanel[aria-hidden='false']");
            break;
        case EhrPlatform.BESTNOTES:
            formEl = document.querySelector(".formContent");
            break;
        case EhrPlatform.SIMPLEPRACTICE:
            formEl = document.querySelector('.progress-individual-note-container');
            break;
        case EhrPlatform.ENSORA:
            formEl = document.querySelector("#content_ph");
            break;
        case EhrPlatform.ALLEVA:
            formEl = document.querySelector("#divMainContainer");
            break;
    }

    if (formEl) return formEl;
    // If no form element found, manual query
    return manualQueryMode();
}

const manualQueryMode = (): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
        const HOVER_CLASS = 'workflow-generator-hover-highlight';
        let currentHighlighted: HTMLElement | null = null;

        // Inject CSS for hover effect
        const style = document.createElement('style');
        style.textContent = `
            .${HOVER_CLASS} {
                outline: 2px solid #3b82f6 !important;
                background-color: rgba(59, 130, 246, 0.1) !important;
                cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);

        // Hover handler - add translucent background
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Remove highlight from previously highlighted element
            if (currentHighlighted && currentHighlighted !== target) {
                currentHighlighted.classList.remove(HOVER_CLASS);
            }
            
            // Add highlight to current element
            target.classList.add(HOVER_CLASS);
            currentHighlighted = target;
        };

        // Mouse out handler - remove highlight
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            target.classList.remove(HOVER_CLASS);
        };

        // Click handler - select the element
        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            const target = e.target as HTMLElement;
            
            // Cleanup
            cleanup();
            
            // Resolve with the selected element
            resolve(target);
        };

        // Escape key handler - cancel manual selection
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(null);
            }
        };

        // Cleanup function to remove all event listeners and styles
        const cleanup = () => {
            document.removeEventListener('mouseover', handleMouseOver, true);
            document.removeEventListener('mouseout', handleMouseOut, true);
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleKeyDown, true);
            
            // Remove highlight from current element
            if (currentHighlighted) {
                currentHighlighted.classList.remove(HOVER_CLASS);
            }
            
            // Remove injected style
            style.remove();
        };

        // Attach event listeners
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);
        document.addEventListener('keydown', handleKeyDown, true);

        // Optional: Show a notification to the user
        console.log('Manual query mode activated. Hover over elements to highlight, click to select. Press ESC to cancel.');
    });
};

export const queryAllInputElements = (formEl: HTMLElement) => {
    const inputSelector = 'input, textarea, select, [contenteditable="true"]';
    const inputElements = formEl.querySelectorAll(inputSelector);
    return Array.from(inputElements);
}

export const isIgnoredInputElement = (element: Element) => {
    if (element.id === 'problem_list_text_field' || element.id === 'token-input-diagnosis_code') {
        return true;
    }

    if (element.classList.contains('tw-hidden')) {  
        return true;
    }

    if (element.closest('#problem_list')) {
        return true;
    }

    if (element.getAttribute('aria-label')?.toLowerCase() === 'hide on lock' || element.getAttribute('aria-label')?.toLowerCase() === 'hide on lock') {
        return true;
    }

    if (element.hasAttribute('readonly')) {
        return true;
    }

    return false;
}

export const hasZeroDimensions = (element: Element, mode: EhrPlatform | null): boolean => {
    
    if (!((element as HTMLElement).offsetWidth || (element as HTMLElement).offsetHeight || (element as HTMLElement).getClientRects().length)) {
        if (mode === EhrPlatform.ALLEVA && 
            ((element as HTMLInputElement).type === 'checkbox' || (element as HTMLInputElement).type === 'radio') && 
            element.hasAttribute('ng-model')) {
            return false;
        } else {
            return true;
        }
    }
    return false;
}