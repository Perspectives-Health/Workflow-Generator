import { EhrPlatform } from "@/modules/shared/types";
import { EMRPopulateInterface } from "./emr-populate-interface";
import { ECWImplementation, EnsonaImplementation, KIPUImplementation, ReliatraxImplementation, SimplePracticeImplementation } from "./emr-populate-impl";
import { AllevaImplementation, BestNotesImplementation, eMedImplementation } from "./emr-populate-impl";
import { NoteData } from "@/modules/shared/types";
import { getMode } from "../populate-utils";


export const injectFormData = async (workflowData: NoteData, index?: number) => {
    const mode = getMode();
    let emrInterface: EMRPopulateInterface;
    switch (mode) {
        case EhrPlatform.KIPU:
            emrInterface = new KIPUImplementation();
            break;
        case EhrPlatform.RELIATRAX:
            emrInterface = new ReliatraxImplementation();
            break;
        case EhrPlatform.BESTNOTES:
            emrInterface = new BestNotesImplementation();
            break;
        case EhrPlatform.EMED:
            emrInterface = new eMedImplementation();
            break;
        case EhrPlatform.ALLEVA:
            emrInterface = new AllevaImplementation();
            break;
        case EhrPlatform.ECW:
            emrInterface = new ECWImplementation();
            break;
        case EhrPlatform.SIMPLEPRACTICE:
            emrInterface = new SimplePracticeImplementation();
            break;
        case EhrPlatform.ENSORA:
            emrInterface = new EnsonaImplementation();
            break;
        default:
            throw new Error(`Unsupported mode: ${mode}`);
    }

    const parseItem = (item: NoteData[string]) => {
        // Skip if answer is null, undefined, or empty string
        if (item.type !== "trigger" && (item.answer === "null" || item.answer === undefined || item.answer === null || item.answer === "")) {
            return null;
        }

        // For checkbox and radio questions, only process if answer is "Yes" or "True"
        if ((item.type === "checkbox" || item.type === "radio")
            && typeof item.answer === "string"
            && item.answer.toLowerCase() !== "yes"
            && item.answer.toLowerCase() !== "true") {
            return null;
        }

        let aiResponse: string | number | boolean = item.answer || "";
        if ((item.type === "checkbox" || item.type === "radio") && typeof item.answer === "string" && (item.answer.toLowerCase() === "yes" || item.answer.toLowerCase() === "true")) {
            aiResponse = item.answer.toLowerCase() === "yes" || item.answer.toLowerCase() === "true";
        } else if (item.type === "select") {
            aiResponse = item.answer as number;
        } else if (item.type === "trigger") {
            aiResponse = "";
        } else {
            aiResponse = item.answer as string;
        }

        return {
            xPath: item.xpath,
            answerType: item.type,
            aiResponse: aiResponse,
            clickBeforeXpaths: item.click_before_xpaths || []
        };
    };

    // If index is specified, only process that specific item
    if (index !== undefined) {
        const item = workflowData[index.toString()];
        if (!item) {
            throw new Error(`Index ${index} not found in workflowData`);
        }
        if (item.ignore === true) {
            console.log(`Ignoring question: ${item.question_text}`);
            return;
        }
        const parsedItem = parseItem(item);
        if (parsedItem) {
            await emrInterface.populateDataByXPath(parsedItem.xPath, parsedItem.answerType, parsedItem.aiResponse, parsedItem.clickBeforeXpaths);
        }
        return;
    }

    // Process all items
    const parsedData = Object.entries(workflowData)
        .filter(([_, value]) => {
            if (value.ignore === true) {
                console.log(`Ignoring question: ${value.question_text}`);
            }
            return value.ignore !== true;
        })
        .map(([_, item]) => parseItem(item));

    for (const item of parsedData) {
        if (item) {
            await emrInterface.populateDataByXPath(item.xPath, item.answerType, item.aiResponse, item.clickBeforeXpaths);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    await emrInterface.submitForm();
}