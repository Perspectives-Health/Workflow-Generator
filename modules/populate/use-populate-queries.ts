import { useMutation, useQuery } from "@tanstack/react-query";
import { useMessaging } from "@/modules/shared/ui/entrypoint-provider";
import { createQueries } from "@/modules/shared/infrastructure/create-queries";
import { populateQueries } from "./infrastructure/populate.send-message.app";


export const usePopulateQueries = () => {
    const { sendMessage } = useMessaging();
    const api = createQueries(sendMessage, populateQueries);

    return {
        useTestPopulate: () => useMutation({
            mutationFn: async ({ workflowId, transcript }: { workflowId: string, transcript: string }) => api.testPopulate(
                workflowId,
                transcript
            ),
        }),
        useGetNoteData: (sessionId: string, workflowId: string, isPolling: boolean = false) => useQuery({
            queryKey: ['note-data', workflowId, sessionId],
            queryFn: async () => api.getNoteData(sessionId, workflowId),
            enabled: !!sessionId && !!workflowId,
            // Poll every 2 seconds when isPolling is true
            refetchInterval: isPolling ? 2000 : false,
            // Retry on error when polling (the note might not be ready yet)
            retry: isPolling ? false : 3,
        }),
        useGetDefaultTranscript: (workflowId: string) => useQuery({
            queryKey: ['default-transcript', workflowId],
            queryFn: async () => api.getDefaultTranscript(workflowId),
            enabled: !!workflowId,
        }),
    };
};