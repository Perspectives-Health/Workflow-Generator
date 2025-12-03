import { EhrPlatform } from "@/modules/shared/types";


export const getMode = (): EhrPlatform | null => {
    return window.location.href.includes('reliatrax') ? EhrPlatform.RELIATRAX :
        window.location.href.includes('kipuworks') ? EhrPlatform.KIPU :
            window.location.href.includes('simplepractice') ? EhrPlatform.SIMPLEPRACTICE :
                window.location.href.includes('bestnotes') ? EhrPlatform.BESTNOTES :
                    window.location.href.includes('emedpractice') ? EhrPlatform.EMED :
                        window.location.href.includes('alleva') ? EhrPlatform.ALLEVA :
                            window.location.href.includes('ecwcloud') ? EhrPlatform.ECW :
                                window.location.href.includes('theranest') ? EhrPlatform.ENSORA : null;
}


export const isInputElement = (element: Element): boolean => {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || 
           tagName === 'textarea' || 
           tagName === 'select' || 
           element.getAttribute('contenteditable') === 'true';
}