import { SendMessageFn } from "@/modules/shared/infrastructure/isomorphic-message";
import { CategoryType } from "@/modules/shared/types";


export const populateQueries = (sendMessage: SendMessageFn) => ({
    testPopulate: async (workflowId: string, transcript: string) => {
        const response = await sendMessage("test-populate", { workflowId, transcript });
        if (!response.success) throw response.error;
        return response.data;
    },
    getNoteData: async (sessionId: string, workflowId: string) => {
        const response = await sendMessage("get-note-data", { sessionId, workflowId });
        if (!response.success) throw response.error;
        return response.data;
    },
    getDefaultTranscript: async (workflowId: string) => {
        const response = await sendMessage("get-default-transcript", { workflowId });
        if (!response.success) throw response.error;
        return response.data;
    }
});