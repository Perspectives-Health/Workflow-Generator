import { useMutation, useQuery } from '@tanstack/react-query';
import { useMessaging } from '@/modules/shared/ui/entrypoint-provider';
import { authQueries } from '@/modules/auth/infrastructure/auth.send-message.app';
import { createQueries } from '@/modules/shared/infrastructure/create-queries';

export const useAuthQueries = () => {
    const { sendMessage } = useMessaging();
    const api = createQueries(sendMessage, authQueries);

    return {
        useLogin: () => useMutation({
            mutationFn: async ({ email, password }: { email: string; password: string }) => api.login(email, password),
        })
    };
}; 