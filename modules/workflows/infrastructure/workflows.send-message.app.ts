import { SendMessageFn } from "@/modules/shared/infrastructure/isomorphic-message";
import { CreateWorkflowRequest } from "@/modules/shared/types";

export const workflowsQueries = (sendMessage: SendMessageFn) => ({
    getWorkflows: async ({ centerId, enterpriseId }: { centerId?: string, enterpriseId?: string }) => {
        const result = await sendMessage("get-workflows", { centerId, enterpriseId });
        if (!result.success) throw result.error;
        return result.data;
    },
    getWorkflow: async (workflowId: string) => {
        const result = await sendMessage("get-workflow", { workflowId });
        if (!result.success) throw result.error;
        return result.data;
    },
    getWorkflowMapping: async (workflowId: string) => {
        const result = await sendMessage("get-workflow-mapping", { workflowId });
        if (!result.success) throw result.error;
        return result.data;
    },
    updateWorkflow: async (workflowId: string, name?: string, ignoreFlags?: Record<string, boolean>, processedQuestions?: Record<string, string>, promptConfig?: Record<string, unknown>, grouping?: Record<string, number[]>) => {
        const result = await sendMessage("update-workflow", { workflow_id: workflowId, name, ignore_flags: ignoreFlags, processed_questions: processedQuestions, prompt_config: promptConfig, grouping: grouping });
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