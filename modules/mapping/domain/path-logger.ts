import { EhrPlatform } from '@/modules/shared/types';
import { getElementPrimaryPath, getElementAbsoluteXPath } from './get-path';
// import { getElementLabel } from './utils/get-attributes.utils';
// import { DumbMappingMetadata } from './mapping.storage';
import { useRef, useCallback, useState, useEffect } from 'react';
import { getMode } from '../mapping.utils';

export class PathLogger {
    private listener: (event: MouseEvent) => void;
    private onXPathLogged?: (newPath: string) => void;
    private currMode: EhrPlatform | null;
    
    constructor(onXPathLogged?: (newPath: string) => void) {
        this.listener = this.handleClick.bind(this);
        this.onXPathLogged = onXPathLogged;
        this.currMode = getMode();
    }

    start() {
        window.addEventListener('click', this.listener, true);
        console.log("XPathLogger started. Click on elements to see their XPath.");
    }

    stop() {
        window.removeEventListener('click', this.listener, true);
        console.log("XPathLogger stopped.");
    }

    handleClick(event: MouseEvent): void {
        // Don't prevent default behavior or stop propagation
        // Just log the XPath without interfering with original handlers
        this.currMode = getMode();
        const element = event.target as Element;
        if (!element) return;

        // Check if the click is within the extension app UI
        if (this.isClickWithinApp(element)) {
            return; // Ignore clicks within the app
        }

        // Simple XPath for the element
        const elementXPath = getElementPrimaryPath(element, this.currMode) || getElementAbsoluteXPath(element);
        // const elementLabel = getElementLabel(element);

        console.log("Clicked element XPath:", elementXPath, element);
        
        // Call the callback if provided
        if (this.onXPathLogged) {
            this.onXPathLogged(elementXPath);
        }
    }

    private isClickWithinApp(element: Element): boolean {
        // Check if the element or any of its parents is within the perspectives-workflow-generator custom element
        let currentElement: Element | null = element;
        while (currentElement) {
            if (currentElement.tagName.toLowerCase() === 'perspectives-workflow-generator') {
                return true;
            }
            currentElement = currentElement.parentElement;
        }
        return false;
    }
}

export function usePathLogger(onXPathLogged?: (newPath: string) => void) {
    const loggerRef = useRef<PathLogger | null>(null);
    const callbackRef = useRef(onXPathLogged);
    const [isLogging, setIsLogging] = useState(false);

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = onXPathLogged;
    }, [onXPathLogged]);

    const start = useCallback(() => {
        if (!loggerRef.current) {
            // Pass a stable wrapper that always calls the latest callback
            loggerRef.current = new PathLogger((path) => callbackRef.current?.(path));
        }
        loggerRef.current.start();
        setIsLogging(true);
    }, []);

    const stop = useCallback(() => {
        if (loggerRef.current) {
            loggerRef.current.stop();
            setIsLogging(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            loggerRef.current?.stop();
        };
    }, []);

    return {
        start,
        stop,
        isLogging
    };
}
