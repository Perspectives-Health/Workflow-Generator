import { SendMessageFn } from "@/modules/shared/infrastructure/isomorphic-message";


export const authQueries = (sendMessage: SendMessageFn) => ({
    login: async (email: string, password: string) => {
        const response = await sendMessage("login", { email, password });
        if (!response.success) throw response.error;
        return response.data;
    },
});