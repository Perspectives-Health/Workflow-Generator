import { useMutation, useQuery } from '@tanstack/react-query';
import { useMessaging } from '@/modules/shared/ui/entrypoint-provider';
import { authQueries } from '@/modules/auth/infrastructure/auth.send-message.app';
import { createQueries } from '@/modules/shared/infrastructure/create-queries';
import { centersQueries } from '../infrastructure/centers.send-message.app';

export const useCentersQueries = () => {
    const { sendMessage } = useMessaging();
    const api = createQueries(sendMessage, centersQueries);

    return {
        useGetCenters: () => useQuery({
            queryKey: ['centers'],
            queryFn: async () => api.getCenters(),
        })
    };
}; 