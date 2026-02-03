import type { ProtocolWithReturn } from "webext-bridge";
import type { ApiResponse, CategoryType, CenterDetails, CreateWorkflowRequest, GetCentersResponse, RegenerateProcessedQuestionResponse, UpdateCenterRequest, UpdateWorkflowRequest, WorkflowMapping, WorkflowSummary, NoteData, EnterpriseDetailsResponse } from "@/modules/shared/types";
import { onMessage } from "webext-bridge/background";
import { sendResponse, sendError } from "@/modules/shared/infrastructure/api-utils.background";
import { AuthSession } from "@/modules/auth/auth.types";
import { getCenters, getWorkflows, login, updateWorkflow, deleteWorkflow, createWorkflow, saveWorkflowPaths, regenerateProcessedQuestion, getCenterDetails, updateCenterPromptConfig, getWorkflowMapping, getWorkflow, generateNote, createClinicalSession, updateClinicalSessionWorkflows, getNoteData, getEnterprises } from "@/modules/shared/infrastructure/api.background";


declare module "webext-bridge" {
    export interface ProtocolMap {
        "login": ProtocolWithReturn<{ email: string; password: string }, ApiResponse<AuthSession>>;
        "get-centers": ProtocolWithReturn<void, ApiResponse<GetCentersResponse>>;
        "get-center-details": ProtocolWithReturn<{ centerId: string }, ApiResponse<CenterDetails>>;
        "update-center-prompt-config": ProtocolWithReturn<{ centerId: string, body: UpdateCenterRequest }, ApiResponse<void>>;
        "get-workflows": ProtocolWithReturn<{ centerId?: string, enterpriseId?: string }, ApiResponse<WorkflowSummary[]>>;
        "get-workflow": ProtocolWithReturn<{ workflowId: string }, ApiResponse<WorkflowSummary>>;
        "get-workflow-mapping": ProtocolWithReturn<{ workflowId: string }, ApiResponse<WorkflowMapping>>;
        "update-workflow": ProtocolWithReturn<UpdateWorkflowRequest, ApiResponse<void>>;
        "delete-workflow": ProtocolWithReturn<{ workflowId: string }, ApiResponse<void>>;
        "create-workflow": ProtocolWithReturn<CreateWorkflowRequest, ApiResponse<void>>;
        "save-workflow-paths": ProtocolWithReturn<{ workflowId: string, index: string, xpath: string | undefined, clickBeforeXpaths: string[] | undefined }, ApiResponse<void>>;
        "regenerate-processed-question": ProtocolWithReturn<{ workflowId: string, questionIndex: string }, ApiResponse<RegenerateProcessedQuestionResponse>>;
        "get-default-transcript": ProtocolWithReturn<{ workflowId: string }, ApiResponse<string>>;
        "test-populate": ProtocolWithReturn<{ workflowId: string, transcript: string }, ApiResponse<string>>;
        "get-note-data": ProtocolWithReturn<{ sessionId: string, workflowId: string }, ApiResponse<NoteData>>;
        "get-enterprises": ProtocolWithReturn<void, ApiResponse<EnterpriseDetailsResponse[]>>;
    }
}

export function registerBackgroundRoutes() {
    onMessage("login", async ({ data }) => {
        try {
            const result = await login(data);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-centers", async () => {
        try {
            const result = await getCenters();
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-enterprises", async () => {
        try {
            const result = await getEnterprises();
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });
    onMessage("update-center-prompt-config", async ({ data }) => {
        try {
            const result = await updateCenterPromptConfig(data.centerId, data.body);
            return sendResponse();
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-center-details", async ({ data }) => {
        try {
            const result = await getCenterDetails(data.centerId);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-workflows", async ({ data }) => {
        try {
            const result = await getWorkflows(data);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-workflow", async ({ data }) => {
        try {
            const result = await getWorkflow(data.workflowId);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-workflow-mapping", async ({ data }) => {
        try {
            const result = await getWorkflowMapping(data.workflowId);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });
    onMessage("update-workflow", async ({ data }) => {
        try {
            await updateWorkflow(
                {
                    workflow_id: data.workflow_id,
                    name: data.name ?? undefined,
                    ignore_flags: data.ignore_flags ?? undefined,
                    processed_questions: data.processed_questions ?? undefined,
                    prompt_config: data.prompt_config ?? undefined,
                    grouping: data.grouping ?? undefined
                });
            return sendResponse();
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("delete-workflow", async ({ data }) => {
        try {
            await deleteWorkflow(data.workflowId);
            return sendResponse();
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("create-workflow", async ({ data }) => {
        try {
            await createWorkflow(data);
            return sendResponse();
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("save-workflow-paths", async ({ data }) => {
        try {
            const result = await saveWorkflowPaths(data.workflowId, data.index, data.xpath, data.clickBeforeXpaths);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("regenerate-processed-question", async ({ data }) => {
        try {
            const result = await regenerateProcessedQuestion(data.workflowId, data.questionIndex);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-default-transcript", async ({ data }) => {
        try {
            const workflowDetails = await getWorkflow(data.workflowId);
            const categoryType = workflowDetails.category_type;
            const urlPath = categoryType === 'intake_assessment'
                ? '/sample-transcripts/intake_assessment.txt'
                : '/sample-transcripts/progress_note.txt';
            const url = browser.runtime.getURL(urlPath);
            const response = await fetch(url);
            const sampleTranscript = await response.text();
            return sendResponse(sampleTranscript);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("test-populate", async ({ data }) => {
        try {
            const clinicalSession = await createClinicalSession();
            await updateClinicalSessionWorkflows(clinicalSession.id, [data.workflowId]);
            
            // Fire and forget - don't await, let it run in background
            generateNote(clinicalSession.id, data.workflowId, data.transcript)
                .catch(err => console.error("generateNote background error:", err));

            // Return session ID immediately so frontend can start polling
            return sendResponse(clinicalSession.id);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-note-data", async ({ data }) => {
        try {
            const result = await getNoteData(data.sessionId, data.workflowId);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });
}