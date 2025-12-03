import { SendMessageFn } from "@/modules/shared/infrastructure/isomorphic-message";
import { CreateWorkflowRequest } from "@/modules/shared/types";

export const workflowsQueries = (sendMessage: SendMessageFn) => ({
    getWorkflows: async (centerId: string) => {
        const result = await sendMessage("get-workflows", { centerId });
        if (!result.success) throw result.error;
        return result.data;
    },
    getWorkflowDetails: async (workflowId: string) => {
        const result = await sendMessage("get-workflow-details", { workflowId });
        if (!result.success) throw result.error;
        return result.data;
    },
    updateWorkflow: async (workflowId: string, name?: string, ignoreFlags?: Record<string, boolean>, processedQuestions?: Record<string, string>) => {
        const result = await sendMessage("update-workflow", { workflow_id: workflowId, name, ignore_flags: ignoreFlags, processed_questions: processedQuestions });
        if (!result.success) throw result.error;
        return result.data;
    },
    deleteWorkflow: async (workflowId: string) => {
        const result = await sendMessage("delete-workflow", { workflowId });
        if (!result.success) throw result.error;
        return result.data;
    },
    createWorkflow: async (body: CreateWorkflowRequest) => {
        const result = await sendMessage("create-workflow", body);
        if (!result.success) throw result.error;
    },
    saveWorkflowPaths: async (workflowId: string, index: string, xpath: string | undefined, clickBeforeXpaths: string[] | undefined) => {
        const result = await sendMessage("save-workflow-paths", { workflowId, index, xpath, clickBeforeXpaths });
        if (!result.success) throw result.error;
        return result.data;
    },
    regenerateProcessedQuestion: async (workflowId: string, questionIndex: string) => {
        const result = await sendMessage("regenerate-processed-question", { workflowId, questionIndex });
        if (!result.success) throw result.error;
        return result.data;
    }
});