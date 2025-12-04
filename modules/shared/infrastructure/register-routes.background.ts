import type { ProtocolWithReturn } from "webext-bridge";
import type { ApiResponse, CenterDetails, CreateWorkflowRequest, GetCentersResponse, RegenerateProcessedQuestionResponse, UpdateCenterRequest, UpdateWorkflowRequest, WorkflowMapping, WorkflowSummary } from "@/modules/shared/types";
import { onMessage } from "webext-bridge/background";
import { sendResponse, sendError } from "@/modules/shared/infrastructure/api-utils.background";
import { AuthSession } from "@/modules/auth/auth.types";
import { getCenters, getWorkflows, login, updateWorkflow, deleteWorkflow, createWorkflow, saveWorkflowPaths, regenerateProcessedQuestion, getCenterDetails, updateCenterPromptConfig, getWorkflowMapping, getWorkflow } from "@/modules/shared/infrastructure/api.background";


declare module "webext-bridge" {
    export interface ProtocolMap {
        "login": ProtocolWithReturn<{ email: string; password: string }, ApiResponse<AuthSession>>;
        "get-centers": ProtocolWithReturn<void, ApiResponse<GetCentersResponse>>;
        "get-center-details": ProtocolWithReturn<{ centerId: string }, ApiResponse<CenterDetails>>;
        "update-center-prompt-config": ProtocolWithReturn<{ centerId: string, body: UpdateCenterRequest }, ApiResponse<void>>;
        "get-workflows": ProtocolWithReturn<{ centerId: string }, ApiResponse<WorkflowSummary[]>>;
        "get-workflow": ProtocolWithReturn<{ workflowId: string }, ApiResponse<WorkflowSummary>>;
        "get-workflow-mapping": ProtocolWithReturn<{ workflowId: string }, ApiResponse<WorkflowMapping>>;
        "update-workflow": ProtocolWithReturn<UpdateWorkflowRequest, ApiResponse<void>>;
        "delete-workflow": ProtocolWithReturn<{ workflowId: string }, ApiResponse<void>>;
        "create-workflow": ProtocolWithReturn<CreateWorkflowRequest, ApiResponse<void>>;
        "save-workflow-paths": ProtocolWithReturn<{ workflowId: string, index: string, xpath: string | undefined, clickBeforeXpaths: string[] | undefined }, ApiResponse<void>>;
        "regenerate-processed-question": ProtocolWithReturn<{ workflowId: string, questionIndex: string }, ApiResponse<RegenerateProcessedQuestionResponse>>;
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
            const result = await getWorkflows(data.centerId);
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
}