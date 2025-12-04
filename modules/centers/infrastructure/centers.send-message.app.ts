import { SendMessageFn } from "@/modules/shared/infrastructure/isomorphic-message";
import { UpdateCenterRequest } from "@/modules/shared/types";


export const centersQueries = (sendMessage: SendMessageFn) => ({
    getCenters: async () => {
        const response = await sendMessage("get-centers", undefined);
        if (!response.success) throw response.error;
        return response.data;
    },
    getCenterDetails: async (centerId: string) => {
        const response = await sendMessage("get-center-details", { centerId });
        if (!response.success) throw response.error;
        return response.data;
    },
    updateCenterPromptConfig: async (centerId: string, body: UpdateCenterRequest) => {
        const response = await sendMessage("update-center-prompt-config", { centerId, body });
        if (!response.success) throw response.error;
    },
});