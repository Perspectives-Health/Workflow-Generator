import { useMutation, useQuery } from '@tanstack/react-query';
import { useMessaging } from '@/modules/shared/ui/entrypoint-provider';
import { authQueries } from '@/modules/auth/infrastructure/auth.send-message.app';
import { createQueries } from '@/modules/shared/infrastructure/create-queries';
import { centersQueries } from '../infrastructure/centers.send-message.app';
import { UpdateCenterRequest } from '@/modules/shared/types';
import { invalidateQueriesGlobally } from '@/modules/shared/infrastructure/query-client';

export const useCentersQueries = () => {
    const { sendMessage } = useMessaging();
    const api = createQueries(sendMessage, centersQueries);

    return {
        useGetCenters: () => useQuery({
            queryKey: ['centers'],
            queryFn: async () => api.getCenters(),
        }),
        useGetEnterprises: () => useQuery({
            queryKey: ['enterprises'],
            queryFn: async () => api.getEnterprises(),
        }),
        useGetCenterDetails: (centerId: string) => useQuery({
            queryKey: ['center-details', centerId],
            queryFn: async () => api.getCenterDetails(centerId),
            enabled: !!centerId
        }),
        useUpdateCenterPromptConfig: (centerId: string) => useMutation({
            mutationFn: async (body: UpdateCenterRequest) => api.updateCenterPromptConfig(centerId, body),
            onSuccess: () => {
                invalidateQueriesGlobally(['center-details', centerId]);
            },
        }),
    };
}; 