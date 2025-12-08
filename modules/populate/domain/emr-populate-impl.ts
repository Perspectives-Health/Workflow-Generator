import { EMRPopulateInterface } from "./emr-populate-interface";
import { convertStringToParagraphs, ensureElementVisible, findClosestComboboxOptions, findElementAcrossIframes, findElementAcrossIframesWithRetry, synthClick } from "../populate-utils";

export class KIPUImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Check if this checkbox is within a checkbox_wrap that might have mutual exclusivity
        let currentElement: Element | null = inputNode.parentElement;
        let checkboxWrap: Element | null = null;

        // Traverse up to find element with class "checkbox_wrap"
        while (currentElement && !checkboxWrap) {
            if (currentElement.classList.contains('checkbox_wrap')) {
                checkboxWrap = currentElement;
                break;
            }
            currentElement = currentElement.parentElement;
        }

        // If checkbox_wrap is found, check the current state before proceeding
        if (checkboxWrap) {
            const allCheckboxes = checkboxWrap.querySelectorAll('input[type="checkbox"]');
            const checkedBefore = Array.from(allCheckboxes).filter(checkbox => (checkbox as HTMLInputElement).checked);
            const checkedCountBefore = checkedBefore.length;

            // Proceed with checking the checkbox
            if (inputNode.classList.contains('conditional_question')) {
                // Triggers expansion of conditional questions
                if (inputNode.checked === false) {
                    inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                // Standard checkbox behavior
                inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
                if (inputNode.checked === false) {
                    inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
                inputNode.dispatchEvent(new Event('input', { bubbles: true }));
                inputNode.dispatchEvent(new Event('change', { bubbles: true }));
                inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
            }

            // Check if the count increased by 1
            const checkedAfter = Array.from(allCheckboxes).filter(checkbox => (checkbox as HTMLInputElement).checked);
            const checkedCountAfter = checkedAfter.length;

            // If the count didn't increase by 1, rollback to original state
            if (checkedCountAfter !== checkedCountBefore + 1) {
                // Rollback to original state
                allCheckboxes.forEach(checkbox => {
                    (checkbox as HTMLInputElement).checked = checkedBefore.includes(checkbox as HTMLInputElement);
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                });
                return;
            }
        } else {
            // No checkbox_wrap found, proceed normally
            if (inputNode.classList.contains('conditional_question')) {
                // Triggers expansion of conditional questions
                if (inputNode.checked === false) {
                    inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                // Standard checkbox behavior
                inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
                if (inputNode.checked === false) {
                    inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
                inputNode.dispatchEvent(new Event('input', { bubbles: true }));
                inputNode.dispatchEvent(new Event('change', { bubbles: true }));
                inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
            }
        }
    }

    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Check if this checkbox is within a checkbox_wrap that might have mutual exclusivity
        let currentElement: Element | null = inputNode.parentElement;
        let checkboxWrap: Element | null = null;

        // Traverse up to find element with class "checkbox_wrap"
        while (currentElement && !checkboxWrap) {
            if (currentElement.classList.contains('checkbox_wrap')) {
                checkboxWrap = currentElement;
                break;
            }
            currentElement = currentElement.parentElement;
        }

        if (checkboxWrap) {
            const allRadios = checkboxWrap.querySelectorAll('input[type="radio"]');
            const checkedBefore = Array.from(allRadios).filter(radio => (radio as HTMLInputElement).checked);
            const checkedCountBefore = checkedBefore.length;

            if (checkedCountBefore > 0) {
                return;
            }
        }

        if (inputNode.classList.contains('conditional_question')) {
            // Triggers expansion of conditional questions
            if (inputNode.checked === false) {
                inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            // Standard checkbox behavior
            inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            if (inputNode.checked === false) {
                inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
            inputNode.dispatchEvent(new Event('input', { bubbles: true }));
            inputNode.dispatchEvent(new Event('change', { bubbles: true }));
            inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        }
    }

    async populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void> {
        await ensureElementVisible(selectNode);

        if (selectNode.selectedIndex > 0) {
            return;
        }

        selectNode.selectedIndex = aiResponse;

        selectNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        selectNode.dispatchEvent(new Event('input', { bubbles: true }));
        selectNode.dispatchEvent(new Event('change', { bubbles: true }));
        selectNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        // input, select, textarea, [contenteditable="true"]
        await ensureElementVisible(inputNode);

        if (inputNode.tagName.toLowerCase() === 'div' && inputNode.contentEditable) {
            if (!!inputNode.innerText.trim()) {
                return;
            }
            inputNode.textContent = aiResponse;
        } else {
            if (!!(inputNode as HTMLInputElement).value) {
                return;
            }
            (inputNode as HTMLInputElement).value = aiResponse;
        }

        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    shouldIgnoreElement(elementId: string): boolean {
        return ['eval-start-time', 'duration', 'duration_units', 'eval-end-time'].includes(elementId);
    }

    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number): Promise<boolean> {
        const inputNode = findElementAcrossIframes(xPath);
        if (!inputNode) {
            return false;
        }

        if (this.shouldIgnoreElement(inputNode.id)) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                await this.populateCheckbox(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'radio':
                await this.populateRadio(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'select':
                await this.populateSelect(inputNode as HTMLSelectElement, aiResponse as number);
                return true;
            case 'free_response':
                await this.populateFreeResponse(inputNode as HTMLElement, aiResponse as string);
                return true;
            default:
                return false;
        }
    }

    async openSection(workflowName: string): Promise<void> {
        // KIPU doesn't need section opening
    }

    async submitForm(): Promise<void> {
        const submitButton = document.querySelector('#form_submit');
        submitButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

}

export class ReliatraxImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Standard checkbox behavior
        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Standard checkbox behavior
        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void> {
        await ensureElementVisible(selectNode);

        selectNode.selectedIndex = aiResponse;

        selectNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        selectNode.dispatchEvent(new Event('input', { bubbles: true }));
        selectNode.dispatchEvent(new Event('change', { bubbles: true }));
        selectNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        // input, select, textarea
        await ensureElementVisible(inputNode);

        if (!!(inputNode as HTMLInputElement).value.trim()) {
            return;
        }

        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        (inputNode as HTMLInputElement).value = aiResponse;
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async clickTrigger(triggerNode: HTMLElement): Promise<void> {
        triggerNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    shouldIgnoreElement(elementId: string): boolean {
        return false
    }

    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number): Promise<boolean> {
        const inputNode = findElementAcrossIframes(xPath);
        if (!inputNode) {
            return false;
        }

        if (this.shouldIgnoreElement(inputNode.id)) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                await this.populateCheckbox(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'radio':
                await this.populateRadio(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'select':
                await this.populateSelect(inputNode as HTMLSelectElement, aiResponse as number);
                return true;
            case 'free_response':
                await this.populateFreeResponse(inputNode as HTMLElement, aiResponse as string);
                return true;
            case 'trigger':
                await this.clickTrigger(inputNode as HTMLElement);
                return true;
            default:
                return false;
        }
    }

    async openSection(workflowName: string): Promise<void> {
        const openTrigger = Array.from(document.querySelectorAll('a')).find(a =>
            a.innerText.toLowerCase().trim().includes(workflowName.toLowerCase().trim())
        );
        if (!openTrigger) return;

        const formAccordion = openTrigger.parentElement;
        if (formAccordion?.classList.contains('ui-accordion-header-collapsed')) {
            openTrigger.click();
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    async submitForm(): Promise<void> {
        // Reliatrax doesn't need form submission
    }
}

export class BestNotesImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Standard checkbox behavior
        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async populateSelect(selectNode: HTMLSelectElement | HTMLElement, aiResponse: number): Promise<void> {
        await ensureElementVisible(selectNode);
        if (selectNode.tagName.toLowerCase() === 'select') {
            (selectNode as HTMLSelectElement).selectedIndex = aiResponse;
            selectNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            selectNode.dispatchEvent(new Event('input', { bubbles: true }));
            selectNode.dispatchEvent(new Event('change', { bubbles: true }));
            selectNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        } 
        else if (selectNode.getAttribute('role') === 'combobox') {
              synthClick(selectNode as HTMLElement);

              await new Promise(resolve => setTimeout(resolve, 500));

              const closestComboboxOptions = findClosestComboboxOptions(selectNode as HTMLElement);
              const targetOption = closestComboboxOptions?.querySelectorAll('.v-list-item')[aiResponse];
              if (targetOption) {
                synthClick(targetOption as HTMLElement);
              }
        }

    }

    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        // input, select, textarea, [contenteditable="true"]
        await ensureElementVisible(inputNode);

        if (inputNode.tagName.toLowerCase() === 'div' && inputNode.contentEditable) {
            if (!!inputNode.innerText.trim()) {
                return;
            }
            inputNode.textContent = aiResponse;
        } else {
            if (!!(inputNode as HTMLInputElement).value) {
                return;
            }
            (inputNode as HTMLInputElement).value = aiResponse;
        }

        // inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    shouldIgnoreElement(elementId: string): boolean {
        return false;
    }

    async clickTrigger(triggerNode: HTMLElement): Promise<void> {
        triggerNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        // console.log('clicked trigger');
        await new Promise(resolve => setTimeout(resolve, 1000));
    } 

    private async clickOutside(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const selectedEncounterForm = document.querySelector('[data-cy="selectedEncounterForm"]');
        if (selectedEncounterForm instanceof HTMLElement) {
            selectedEncounterForm.click();
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number, clickBeforeXpaths?: string[]): Promise<boolean> {
        if (clickBeforeXpaths) {
            for (const clickBeforeXpath of clickBeforeXpaths) {
                const clickBeforeNode = await findElementAcrossIframesWithRetry(clickBeforeXpath, 3, 1000);
                if (clickBeforeNode) {
                    await this.clickTrigger(clickBeforeNode as HTMLElement);
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        const inputNode = await findElementAcrossIframesWithRetry(xPath, 3, 1000);
        if (!inputNode) {
            return false;
        }

        if (this.shouldIgnoreElement(inputNode.id)) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                await this.populateCheckbox(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'radio':
                await this.populateRadio(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'select':
                await this.populateSelect(inputNode as HTMLSelectElement, aiResponse as number);
                return true;
            case 'free_response':
                await this.populateFreeResponse(inputNode as HTMLElement, aiResponse as string);

                // if (inputNode.getAttribute('aria-haspopup') === 'menu' || inputNode.getAttribute('role') === 'combobox') {
                //     console.log(inputNode, 'aria-haspopup is menu or role is combobox');
                //     await this.clickOutside();
                // }

                return true;
            case 'trigger':
                await this.clickTrigger(inputNode as HTMLElement);
                return true;
            default:
                return false;
        }

    }

    async openSection(workflowName: string): Promise<void> {
        // BestNotes doesn't need section opening
    }

    async submitForm(): Promise<void> {
        // BestNotes doesn't need form submission
    }

}

export class eMedImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Standard checkbox behavior
        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Standard checkbox behavior
        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void> {
        await ensureElementVisible(selectNode);

        selectNode.selectedIndex = aiResponse;

        selectNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        selectNode.dispatchEvent(new Event('input', { bubbles: true }));
        selectNode.dispatchEvent(new Event('change', { bubbles: true }));
        selectNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        // input, select, textarea, [contenteditable="true"]
        await ensureElementVisible(inputNode);

        if (inputNode.contentEditable) {
            if (!!inputNode.innerText.trim()) {
                return;
            }
            inputNode.innerText = aiResponse;
        } else if (inputNode.tagName.toLowerCase() === 'body' && inputNode.id === 'tinymce') {
            const parsedAiResponseHTML = convertStringToParagraphs(aiResponse);
            inputNode.innerHTML = parsedAiResponseHTML;
        } else {
            if (!!(inputNode as HTMLInputElement).value) {
                return;
            }
            (inputNode as HTMLInputElement).value = aiResponse;
        }

        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    shouldIgnoreElement(elementId: string): boolean {
        return false;
    }

    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number): Promise<boolean> {
        const inputNode = findElementAcrossIframes(xPath);
        if (!inputNode) {
            return false;
        }

        if (this.shouldIgnoreElement(inputNode.id)) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                await this.populateCheckbox(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'radio':
                await this.populateRadio(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'select':
                await this.populateSelect(inputNode as HTMLSelectElement, aiResponse as number);
                return true;
            case 'free_response':
                await this.populateFreeResponse(inputNode as HTMLElement, aiResponse as string);
                return true;
            default:
                return false;
        }
    }

    async openSection(workflowName: string): Promise<void> {
        // eMed doesn't need section opening
    }

    async submitForm(): Promise<void> {
        // eMed doesn't need form submission
    }
}

export class AllevaImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Standard checkbox behavior
        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        // Standard checkbox behavior
        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        if (inputNode.checked === false) {
            inputNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new Event('change', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void> {
        await ensureElementVisible(selectNode);

        selectNode.selectedIndex = aiResponse;

        selectNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        selectNode.dispatchEvent(new Event('input', { bubbles: true }));
        selectNode.dispatchEvent(new Event('change', { bubbles: true }));
        selectNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        // input, select, textarea, [contenteditable="true"]
        // Alleva customization: Overwrite answers
        await ensureElementVisible(inputNode);


        if (inputNode.tagName.toLowerCase() === 'div' && inputNode.contentEditable) {
            const responseToPopulate = (!!inputNode.innerText.trim() && inputNode.innerText.trim() !== aiResponse.trim()) ? inputNode.innerText + "\n\n" + aiResponse : aiResponse;
            inputNode.textContent = responseToPopulate;
        } else if (inputNode.tagName.toLowerCase() === 'body' && inputNode.id === 'tinymce') {
            const responseToPopulate = (!!inputNode.innerText.trim() && inputNode.innerText.trim() !== aiResponse.trim()) ? inputNode.innerText + "\n\n" + aiResponse : aiResponse;
            const parsedAiResponseHTML = convertStringToParagraphs(responseToPopulate);
            inputNode.innerHTML = parsedAiResponseHTML;
        } else if (inputNode.tagName.toLowerCase() === 'textarea') {
            const responseToPopulate = (!!(inputNode as HTMLInputElement | HTMLTextAreaElement).value.trim() && (inputNode as HTMLInputElement | HTMLTextAreaElement).value.trim() !== aiResponse.trim()) ? (inputNode as HTMLInputElement | HTMLTextAreaElement).value + "\n\n" + aiResponse : aiResponse;
            (inputNode as HTMLInputElement).value = responseToPopulate;
        } else {
            (inputNode as HTMLInputElement).value = aiResponse;
        }

        inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    shouldIgnoreElement(elementId: string): boolean {
        return false;
    }

    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number): Promise<boolean> {
        const inputNode = findElementAcrossIframes(xPath);
        if (!inputNode) {
            return false;
        }

        if (this.shouldIgnoreElement(inputNode.id)) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                await this.populateCheckbox(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'radio':
                await this.populateRadio(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'select':
                await this.populateSelect(inputNode as HTMLSelectElement, aiResponse as number);
                return true;
            case 'free_response':
                await this.populateFreeResponse(inputNode as HTMLElement, aiResponse as string);
                return true;
            default:
                return false;
        }
    }

    async openSection(workflowName: string): Promise<void> {
        // Alleva customization: Open all editable sections by querying <a> tags with text "edit"
        const editTriggers = [...document.querySelectorAll('a:not(.ng-hide)')]
            .filter(a => a.textContent?.trim().toLowerCase() === 'edit');

        editTriggers.forEach(trigger => {
            (trigger as HTMLElement).click();
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const openTriggers = [...document.querySelectorAll('i[ng-if="!showCustomForm"]')];
        openTriggers.forEach(trigger => {
            (trigger as HTMLElement).click();
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    async submitForm(): Promise<void> {
        // Alleva doesn't need form submission
    }
}

export class ECWImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
    }

    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
    }

    async populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void> {
    }

    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        inputNode.focus();
        if (inputNode.tagName.toLowerCase() === 'input' || inputNode.tagName.toLowerCase() === 'textarea') {
            inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            (inputNode as HTMLInputElement).value = aiResponse;
            inputNode.dispatchEvent(new Event('input', { bubbles: true }));
            inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        } else {
            inputNode.innerText = aiResponse;
        }
        

        await new Promise(resolve => setTimeout(resolve, 500));
        // inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        // inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        // inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    shouldIgnoreElement(elementId: string): boolean {
        return false;
    }

    async clickTrigger(triggerNode: HTMLElement): Promise<void> {
        triggerNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number): Promise<boolean> {
        const currNode = findElementAcrossIframes(xPath);
        if (!currNode) {
            return false;
        }
        
        if (this.shouldIgnoreElement(currNode.id)) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                return false;
            case 'radio':
                return false;
            case 'select':
                return false;
            case 'trigger':
                await this.clickTrigger(currNode as HTMLElement);
                return true;
            case 'free_response':
                await this.populateFreeResponse(currNode as HTMLElement, aiResponse as string);
                // okButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                return true;
            default:
                return false;
        }

        // const triggerNode = findElementAcrossIframes(xPath);
        // if (!triggerNode) {
        //     return false;
        // }

        // // open the section
        // triggerNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        // await new Promise(resolve => setTimeout(resolve, 2500));

        // // find clickThroughIframe: iframe with id clickthroughiframe
        // const clickThroughIframe = document.querySelector('iframe#clickthroughiframe') as HTMLIFrameElement;
        // if (!clickThroughIframe) {
        //     console.error('clickThroughIframe not found');
        //     return false;
        // }

        // // find iframe in clickThroughIframe with class cke_wysiwyg_frame
        // const iframe = clickThroughIframe.contentDocument?.querySelector('iframe.cke_wysiwyg_frame') as HTMLIFrameElement;
        // if (!iframe) {
        //     console.error('iframe not found');
        //     return false;
        // }

        // // find body with contenteditable="true" in iframe
        // const body = iframe.contentDocument?.querySelector('body[contenteditable="true"]');
        // if (!body) {
        //     console.error('body not found');
        //     return false;
        // }

        // const okButton = clickThroughIframe.contentDocument?.querySelector('button[value="Ok"]');
        // if (!okButton) {
        //     console.error('okButton not found');
        //     return false;
        // }

    }

    async openSection(workflowName: string): Promise<void> {
        // Alleva customization: Open all editable sections by querying <a> tags with text "edit"
    }

    async submitForm(): Promise<void> {
        // Alleva doesn't need form submission
    }
}

// function populateSelect(selectNode, aiResponse) {

//     if (selectNode.selectedIndex > 0) {
//         return;
//     }

//     selectNode.selectedIndex = aiResponse;

//     selectNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
//     selectNode.dispatchEvent(new Event('input', { bubbles: true }));
//     selectNode.dispatchEvent(new Event('change', { bubbles: true }));
//     selectNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
// }

export class SimplePracticeImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        if (inputNode.checked !== aiResponse) {
            inputNode.click();
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);

        if (inputNode.checked !== aiResponse) {
            inputNode.click();
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void> {
        await ensureElementVisible(selectNode);

        if (selectNode.selectedIndex !== aiResponse) {
            selectNode.selectedIndex = aiResponse;
            selectNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            selectNode.dispatchEvent(new Event('input', { bubbles: true }));
            selectNode.dispatchEvent(new Event('change', { bubbles: true }));
            selectNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        }
    }

    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        await ensureElementVisible(inputNode);

        if (inputNode.tagName.toLowerCase() === 'div' && inputNode.contentEditable) {
            if (!!inputNode.innerText.trim()) {
                return;
            }
            inputNode.focus();
            inputNode.innerText = aiResponse;
        } else {
            if (!!(inputNode as HTMLInputElement).value) {
                return;
            }
            (inputNode as HTMLInputElement).value = aiResponse;
        }
        await new Promise(resolve => setTimeout(resolve, 200));

        // inputNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        
        // inputNode.dispatchEvent(new Event('input', { bubbles: true }));
        // inputNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    }

    shouldIgnoreElement(elementId: string): boolean {
        return false;
    }

    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number): Promise<boolean> {
        const inputNode = findElementAcrossIframes(xPath);
        if (!inputNode) {
            return false;
        }

        if (this.shouldIgnoreElement(inputNode.id)) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                await this.populateCheckbox(inputNode as HTMLInputElement, aiResponse as boolean);
                // add random delay, between 500 and 2000ms
                // await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 750)));
                return true;
            case 'radio':
                await this.populateRadio(inputNode as HTMLInputElement, aiResponse as boolean);
                // await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 750)));
                return true;
            case 'select':
                await this.populateSelect(inputNode as HTMLSelectElement, aiResponse as number);
                // await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 750)));
                return true;
            case 'free_response':
                await this.populateFreeResponse(inputNode as HTMLElement, aiResponse as string);
                // await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 750)));
                return true;
            default:
                return false;
        }
    }
    async openSection(workflowName: string): Promise<void> {
        // SimplePractice doesn't need section opening
    }
    async submitForm(): Promise<void> {
        // SimplePractice doesn't need form submission
    }
}

export class EnsonaImplementation implements EMRPopulateInterface {
    async populateCheckbox(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }

        await ensureElementVisible(inputNode);
        if (inputNode.checked !== aiResponse) {
            inputNode.click();
        }
    }
    
    async populateRadio(inputNode: HTMLInputElement, aiResponse: boolean): Promise<void> {
        if (!aiResponse) {
            return;
        }
        
        await ensureElementVisible(inputNode);
        
        if (inputNode.checked !== aiResponse) {
            inputNode.click();
        }
    }
    
    async populateSelect(selectNode: HTMLSelectElement, aiResponse: number): Promise<void> {
        await ensureElementVisible(selectNode);
        selectNode.selectedIndex = aiResponse;
    }
    
    async populateFreeResponse(inputNode: HTMLElement, aiResponse: string): Promise<void> {
        await ensureElementVisible(inputNode);
        
        if (inputNode.tagName.toLowerCase() === 'div' && inputNode.contentEditable) {
            inputNode.textContent = aiResponse;
        } else {
            (inputNode as HTMLInputElement).value = aiResponse;
        }
    }
    
    async populateDataByXPath(xPath: string, answerType: string, aiResponse: string | boolean | number): Promise<boolean> {
        const inputNode = findElementAcrossIframes(xPath);
        if (!inputNode) {
            return false;
        }

        switch (answerType) {
            case 'checkbox':
                await this.populateCheckbox(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'radio':
                await this.populateRadio(inputNode as HTMLInputElement, aiResponse as boolean);
                return true;
            case 'select':
                await this.populateSelect(inputNode as HTMLSelectElement, aiResponse as number);
                return true;
            case 'free_response':
                await this.populateFreeResponse(inputNode as HTMLElement, aiResponse as string);
                return true;
            default:
                return false;
        }
    }
    
    shouldIgnoreElement(elementId: string): boolean {
        return false;
    }
    
    async openSection(workflowName: string): Promise<void> {
        // Ensona doesn't need section opening
    }
    
    async submitForm(): Promise<void> {
        // Ensona doesn't need form submission
    }
}