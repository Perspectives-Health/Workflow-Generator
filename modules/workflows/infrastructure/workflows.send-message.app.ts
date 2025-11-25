import { SendMessageFn } from "@/modules/shared/infrastructure/isomorphic-message";

export const workflowsQueries = (sendMessage: SendMessageFn) => ({
    getWorkflows: async (centerId: string) => {
        const result = await sendMessage("get-workflows", { centerId });
        if (!result.success) throw result.error;
        return result.data;
    }
});