import { useMutation, useQuery } from "@tanstack/react-query";
import { useMessaging } from "@/modules/shared/ui/entrypoint-provider";
import { createQueries } from "@/modules/shared/infrastructure/create-queries";
import { workflowsQueries } from "../infrastructure/workflows.send-message.app";
import { invalidateQueriesGlobally } from "@/modules/shared/infrastructure/query-client";
import { PreMappingMetadata } from "@/modules/shared/types";


export const useWorkflowsQueries = () => {
    const { sendMessage } = useMessaging();
    const api = createQueries(sendMessage, workflowsQueries);

    return {
        useGetWorkflows: (centerId: string) => useQuery({
            queryKey: ['workflows', centerId],
            queryFn: async () => api.getWorkflows(centerId),
            enabled: !!centerId,
            refetchInterval: (query) => {
                const hasInProgress = query.state.data?.some(
                    (workflow) => workflow.mapping_status === 'in_progress'
                );
                return hasInProgress ? 3000 : false;
            }
        }),
        useGetWorkflowDetails: (workflowId: string) => useQuery({
            queryKey: ['workflow-details', workflowId],
            queryFn: async () => api.getWorkflowDetails(workflowId),
            enabled: !!workflowId
        }),
        useUpdateWorkflow: () => useMutation({
            mutationFn: async ({ 
                workflowId, 
                name, 
                ignoreFlags, 
                processedQuestions,
                centerId
            }: { 
                workflowId: string; 
                name?: string; 
                ignoreFlags?: Record<string, boolean>; 
                processedQuestions?: Record<string, string>;
                centerId: string;
            }) => {
                return api.updateWorkflow(workflowId, name, ignoreFlags, processedQuestions);
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflow-details', variables.workflowId]);
                invalidateQueriesGlobally(['workflows', variables.centerId]);
                // toast.success('Workflow updated successfully');
            }
        }),
        useDeleteWorkflow: () => useMutation({
            mutationFn: async ({ centerId, workflowId }: { centerId: string; workflowId: string }) => {
                return api.deleteWorkflow(workflowId);
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflows', variables.centerId]);
            }
        }),
        useCreateWorkflow: () => useMutation({
            mutationFn: async ({ workflowName, metadata, centerId, screenshot, categoryInstructions }: { workflowName: string; metadata: PreMappingMetadata[]; centerId: string; screenshot: string; categoryInstructions: { [key: string]: unknown } }) => {

                return api.createWorkflow({
                    workflow_name: workflowName,
                    metadata: metadata,
                    center_id: centerId,
                    screenshot: screenshot,
                    category_instructions: categoryInstructions
                });
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflows', variables.centerId]);
            }
        }),
        useSaveWorkflowPaths: () => useMutation({
            mutationFn: ({ workflowId, index, xpath, clickBeforeXpaths }: { workflowId: string; index: string; xpath: string | undefined; clickBeforeXpaths: string[] | undefined }) => 
                api.saveWorkflowPaths(workflowId, index, xpath, clickBeforeXpaths),
            onSuccess: (data, variables) => {
                invalidateQueriesGlobally(["workflow-details", variables.workflowId]);
            },
            onError: (error) => {
                console.error("saveWorkflowPaths error", error);
            }
        }),
        useRegenerateProcessedQuestion: () => useMutation({
            mutationFn: ({ workflowId, questionIndex }: { workflowId: string; questionIndex: string }) => 
                api.regenerateProcessedQuestion(workflowId, questionIndex),
            onSuccess: (data, variables) => {
                console.log("regenerateProcessedQuestion success", data);
                invalidateQueriesGlobally(["workflow-details", variables.workflowId]);
            },
            onError: (error) => {
                console.error("regenerateProcessedQuestion error", error);
            }
        }),
    };
}