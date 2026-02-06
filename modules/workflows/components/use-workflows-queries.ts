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
        useGetWorkflows: ({ centerId, enterpriseId }: { centerId?: string, enterpriseId?: string }) => useQuery({
            queryKey: ['workflows', centerId ?? enterpriseId],
            queryFn: async () => api.getWorkflows({ centerId, enterpriseId }),
            enabled: !!centerId || !!enterpriseId,
            refetchInterval: (query) => {
                const hasInProgress = query.state.data?.some(
                    (workflow) => workflow.mapping_status === 'in_progress'
                );
                return hasInProgress ? 3000 : false;
            }
        }),
        useGetWorkflow: (workflowId: string) => useQuery({
            queryKey: ['workflow-summary', workflowId],
            queryFn: async () => api.getWorkflow(workflowId),
            enabled: !!workflowId
        }),
        useGetWorkflowMapping: (workflowId: string) => useQuery({
            queryKey: ['workflow-mapping', workflowId],
            queryFn: async () => api.getWorkflowMapping(workflowId),
            enabled: !!workflowId
        }),
        useUpdateWorkflow: () => useMutation({
            mutationFn: async ({ 
                workflowId, 
                centerId,
                enterpriseId,
                name, 
                ignoreFlags, 
                processedQuestions,
                promptConfig,
                grouping,
            }: { 
                workflowId: string; 
                centerId?: string;
                enterpriseId?: string;
                name?: string; 
                ignoreFlags?: Record<string, boolean>; 
                processedQuestions?: Record<string, string>;
                promptConfig?: Record<string, unknown>;
                grouping?: Record<string, number[]>;
            }) => {
                return api.updateWorkflow(workflowId, name, ignoreFlags, processedQuestions, promptConfig, grouping);
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflow-mapping', variables.workflowId]);
                invalidateQueriesGlobally(['workflows', variables.centerId ?? variables.enterpriseId ?? '']);
                invalidateQueriesGlobally(['workflow-summary', variables.workflowId]);
                // toast.success('Workflow updated successfully');
            }
        }),
        useDeleteWorkflow: () => useMutation({
            mutationFn: async ({ centerId, enterpriseId, workflowId }: { centerId?: string; enterpriseId?: string; workflowId: string }) => {
                return api.deleteWorkflow(workflowId);
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflows', variables.centerId ?? variables.enterpriseId ?? '']);
            }
        }),
        useMapWorkflow: () => useMutation({
            mutationFn: async ({ workflowName, metadata, centerId, enterpriseId, screenshot, categoryInstructions }: { workflowName: string; metadata: PreMappingMetadata[]; centerId?: string; enterpriseId?: string; screenshot: string; categoryInstructions: { [key: string]: unknown } }) => {

                return api.mapWorkflow({
                    workflow_name: workflowName,
                    metadata: metadata,
                    center_id: centerId,
                    enterprise_id: enterpriseId,
                    screenshot: screenshot,
                    category_instructions: categoryInstructions
                });
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflows', variables.centerId ?? variables.enterpriseId ?? '']);
            }
        }),
        useSaveWorkflowPaths: () => useMutation({
            mutationFn: ({ workflowId, index, xpath, clickBeforeXpaths }: { workflowId: string; index: string; xpath: string | undefined; clickBeforeXpaths: string[] | undefined }) => 
                api.saveWorkflowPaths(workflowId, index, xpath, clickBeforeXpaths),
            onSuccess: (data, variables) => {
                invalidateQueriesGlobally(["workflow-mapping", variables.workflowId]);
            },
            onError: (error) => {
                console.error("saveWorkflowPaths error", error);
            }
        }),
        useRegenerateProcessedQuestion: () => useMutation({
            mutationFn: ({ workflowId, questionIndex }: { workflowId: string; questionIndex: string }) => 
                api.regenerateProcessedQuestion(workflowId, questionIndex),
            onSuccess: (data, variables) => {
                invalidateQueriesGlobally(["workflow-mapping", variables.workflowId]);
            },
            onError: (error) => {
                console.error("regenerateProcessedQuestion error", error);
            }
        }),
    };
}