import {
    SendMessageFn,
    OnMessageFn,
    OpenStreamFn,
    OnOpenStreamChannelFn
} from "@/modules/shared/infrastructure/isomorphic-message";
import { components } from "./schema.d";

/**
 * Represents a generic API response structure using a discriminated union.
 * @template T - The type of the data contained in the response for a successful operation.
 */
export type ApiResponse<T> =
    | { success: true; data: T; error?: undefined }
    | { success: false; data?: undefined; error: string }; // Error is now just the message string


export enum Entrypoint {
    CONTENT_SCRIPT = "content-script",
    POPUP = "popup",
    BACKGROUND = "background"
}

export interface MessagingFunctions {
    sendMessage: SendMessageFn;
    onMessage: OnMessageFn;
    openStream: OpenStreamFn;
    onOpenStreamChannel: OnOpenStreamChannelFn;
}

export type Center = components["schemas"]["CenterDisplayInfo"];

export type Enterprise = { id: string, name: string };

export type GetCentersResponse = Center[];

export type CenterDetails = components["schemas"]["CenterDetailsResponse"];

export type MenuItem = "view-centers" | "view-workflows" | "create-workflow" | "manage-workflow";

export type WorkflowSummary = components["schemas"]["WorkflowResponse"];

export type CategoryType = components["schemas"]["CategoryType"];

export type ProgressNoteType = components["schemas"]["ProgressNoteType"];

export type MappingMetadata = {
    index: number;
    label: string;
    placeholder: string;
    type: string;
    xpath: string;
    question_text: string;
    processed_question_text: string;
    click_before_xpaths?: string[] | null;
};

export type PreMappingMetadata = components["schemas"]["Metadata"];

// export type CreateWorkflowRequest = components["schemas"]["MappingCreate"];

export type WorkflowMapping = components["schemas"]["Mapping"];

export type WorkflowMappingRequest = components["schemas"]["WorkflowMappingRequest"];

export type UpdateCenterRequest = components["schemas"]["UpdateCenterRequest"];

export type UpdateWorkflowRequest = components["schemas"]["UpdateWorkflowRequest"];

export enum EhrPlatform {
    KIPU = 'kipu',
    RELIATRAX = 'reliatrax',
    SIMPLEPRACTICE = 'simplepractice',
    BESTNOTES = 'bestnotes',
    EMED = 'emed',
    ALLEVA = 'alleva',
    ECW = 'ecw',
    ENSORA = 'ensora',
    OPENCORE = 'opencore',
}

export type ElementInfo = {
    [key: number]: {
        elementType: string;
        elementPrimaryPath: string;
        elementAbsoluteXPath: string;
        elementLabel: string;
        elementPlaceholder: string;
        elementOptions: string[];
    };
};

export enum MappingStage {
    ERROR = -1,
    IDLE = 0,
    GETTING_FORM = 1,
    CLONING_FORM = 2,
    FINDING_INPUTS = 3,
    EXTRACTING_ELEMENT_INFO = 4,
    DELETE_INPUTS = 5,
    CAPTURING_SCREENSHOT = 6,
    SENDING = 7,
    COMPLETED = 8,
}

export type RegenerateProcessedQuestionResponse = components["schemas"]["RegenerateProcessedQuestionResponse"];

export type TestPopuateRequestBody = {
    sessionId: string;
    workflowId: string;
    categoryType: CategoryType;
}

export type NoteData = components["schemas"]["PopulateModel"];

export type EnterpriseDetailsResponse = components["schemas"]["EnterpriseDetailsResponse"];