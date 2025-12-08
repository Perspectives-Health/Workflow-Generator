export interface EMRPopulateInterface {
    populateCheckbox(inputNode: HTMLInputElement, aiResponse: string | boolean): Promise<void>;
    populateRadio(inputNode: HTMLInputElement, aiResponse: string | boolean): Promise<void>;
    populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void>;
    populateFreeResponse(inputNode: HTMLInputElement, aiResponse: string): Promise<void>;
    populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number, clickBeforeXpaths?: string[]): Promise<boolean>;
    clickTrigger?(triggerNode: HTMLElement): Promise<void>;
    openSection(workflowName: string): Promise<void>;
    submitForm(): Promise<void>;
    shouldIgnoreElement(elementId: string): boolean;
}