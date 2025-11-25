import { useQuery } from "@tanstack/react-query";
import { useMessaging } from "@/modules/shared/ui/entrypoint-provider";
import { createQueries } from "@/modules/shared/infrastructure/create-queries";
import { workflowsQueries } from "../infrastructure/workflows.send-message.app";

export const useWorkflowsQueries = () => {
    const { sendMessage } = useMessaging();
    const api = createQueries(sendMessage, workflowsQueries);

    return {
        useGetWorkflows: (centerId: string) => useQuery({
            queryKey: ['workflows', centerId],
            queryFn: async () => api.getWorkflows(centerId),
            enabled: !!centerId
        })
    };
}