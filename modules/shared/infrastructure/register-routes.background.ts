import type { ProtocolWithReturn } from "webext-bridge";
import type { ApiResponse, CreateWorkflowRequest, GetCentersResponse, UpdateWorkflowRequest, WorkflowDetails, WorkflowSummary } from "@/modules/shared/types";
import { onMessage } from "webext-bridge/background";
import { sendResponse, sendError } from "@/modules/shared/infrastructure/api-utils.background";
import { AuthSession } from "@/modules/auth/auth.types";
import { getCenters, getWorkflows, getWorkflowDetails, login, updateWorkflow, deleteWorkflow, createWorkflow, saveWorkflowPaths } from "@/modules/shared/infrastructure/api.background";


declare module "webext-bridge" {
    export interface ProtocolMap {
        "login": ProtocolWithReturn<{ email: string; password: string }, ApiResponse<AuthSession>>;
        "get-centers": ProtocolWithReturn<void, ApiResponse<GetCentersResponse>>;
        "get-workflows": ProtocolWithReturn<{ centerId: string }, ApiResponse<WorkflowSummary[]>>;
        "get-workflow-details": ProtocolWithReturn<{ workflowId: string }, ApiResponse<WorkflowDetails>>;
        // "create-workflow": ProtocolWithReturn<CreateWorkflowRequest, ApiResponse<string>>;
        "update-workflow": ProtocolWithReturn<UpdateWorkflowRequest, ApiResponse<void>>;
        "delete-workflow": ProtocolWithReturn<{ workflowId: string }, ApiResponse<void>>;
        "create-workflow": ProtocolWithReturn<CreateWorkflowRequest, ApiResponse<void>>;
        "save-workflow-paths": ProtocolWithReturn<{ workflowId: string, index: string, xpath: string | undefined, clickBeforeXpaths: string[] | undefined }, ApiResponse<void>>;
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

    onMessage("get-workflows", async ({ data }) => {
        try {
            const result = await getWorkflows(data.centerId);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-workflow-details", async ({ data }) => {
        try {
            const result = await getWorkflowDetails(data.workflowId);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });
    // onMessage("create-workflow", async ({ data }) => {
    //     try {
    //         const workflowId = await createWorkflow(data);
    //         return sendResponse(workflowId);
    //     } catch (error) {
    //         return sendError(error as Error);
    //     }
    // });
    onMessage("update-workflow", async ({ data }) => {
        try {
            await updateWorkflow(
                data.workflow_id,
                data.name ?? undefined,
                data.ignore_flags ?? undefined,
                data.processed_questions ?? undefined
            );
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
}