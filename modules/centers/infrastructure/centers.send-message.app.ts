import { SendMessageFn } from "@/modules/shared/infrastructure/isomorphic-message";


export const centersQueries = (sendMessage: SendMessageFn) => ({
    getCenters: async () => {
        const response = await sendMessage("get-centers", undefined);
        if (!response.success) throw response.error;
        return response.data;
    },
});