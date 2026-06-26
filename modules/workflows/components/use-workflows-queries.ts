import { useMutation, useQuery } from "@tanstack/react-query";
import { useMessaging } from "@/modules/shared/ui/entrypoint-provider";
import { createQueries } from "@/modules/shared/infrastructure/create-queries";
import { workflowsQueries } from "../infrastructure/workflows.send-message.app";
import { invalidateQueriesGlobally } from "@/modules/shared/infrastructure/query-client";
import { PreMappingMetadata, SunwaveWorkflowRequest } from "@/modules/shared/types";


export const useWorkflowsQueries = () => {
    const { sendMessage } = useMessaging();
    const api = createQueries(sendMessage, workflowsQueries);
    const getWorkflowsScopeKey = ({ centerId, enterpriseId, isGlobal }: { centerId?: string; enterpriseId?: string; isGlobal?: boolean }) =>
        isGlobal ? 'global' : centerId ?? enterpriseId ?? '';

    return {
        useGetWorkflows: ({ centerId, enterpriseId, isGlobal }: { centerId?: string, enterpriseId?: string, isGlobal?: boolean }) => useQuery({
            queryKey: ['workflows', getWorkflowsScopeKey({ centerId, enterpriseId, isGlobal })],
            queryFn: async () => api.getWorkflows({ centerId, enterpriseId, isGlobal }),
            enabled: !!centerId || !!enterpriseId || !!isGlobal,
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
        useGetEmrAvailableForms: ({ centerId, enabled = true }: { centerId: string; enabled?: boolean }) => useQuery({
            queryKey: ['emr-available-forms', centerId],
            queryFn: async () => api.getEmrAvailableForms(centerId),
            staleTime: 1000 * 60 * 60 * 1,
            enabled: enabled && !!centerId,
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
                isGlobal,
                isUr,
            }: { 
                workflowId: string; 
                centerId?: string;
                enterpriseId?: string;
                isGlobal?: boolean;
                name?: string; 
                ignoreFlags?: Record<string, boolean>; 
                processedQuestions?: Record<string, string>;
                promptConfig?: Record<string, unknown>;
                grouping?: Record<string, number[]>;
                isUr?: boolean;
            }) => {
                return api.updateWorkflow(workflowId, name, ignoreFlags, processedQuestions, promptConfig, grouping, isUr);
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflow-mapping', variables.workflowId]);
                invalidateQueriesGlobally(['workflows', getWorkflowsScopeKey(variables)]);
                invalidateQueriesGlobally(['workflow-summary', variables.workflowId]);
                // toast.success('Workflow updated successfully');
            }
        }),
        useDeleteWorkflow: () => useMutation({
            mutationFn: async ({ centerId, enterpriseId, workflowId }: { centerId?: string; enterpriseId?: string; isGlobal?: boolean; workflowId: string }) => {
                return api.deleteWorkflow(workflowId);
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflows', getWorkflowsScopeKey(variables)]);
            }
        }),
        useMapWorkflow: () => useMutation({
            mutationFn: async ({ workflowName, metadata, centerId, enterpriseId, screenshot, categoryInstructions, workflowId, isUr }: { workflowName: string; metadata: PreMappingMetadata[]; centerId?: string; enterpriseId?: string; isGlobal?: boolean; screenshot: string; categoryInstructions: { [key: string]: unknown }; workflowId?: string; isUr?: boolean }) => {

                return api.mapWorkflow({
                    workflow_name: workflowName,
                    metadata: metadata,
                    center_id: centerId,
                    enterprise_id: enterpriseId,
                    screenshot: screenshot,
                    category_instructions: categoryInstructions,
                    workflow_id: workflowId,
                    is_ur: isUr ?? false
                });
            },
            onSuccess: (_, variables) => {
                invalidateQueriesGlobally(['workflows', getWorkflowsScopeKey(variables)]);
            }
        }),
        useCreateSunwaveWorkflow: () => useMutation({
            mutationFn: async (body: SunwaveWorkflowRequest) => api.createSunwaveWorkflow(body),
            onSuccess: (data, variables) => {
                if (variables.center_id) {
                    invalidateQueriesGlobally(['workflows', variables.center_id]);
                } else {
                    invalidateQueriesGlobally(['workflows']);
                }
                if (data.workflow_id) {
                    invalidateQueriesGlobally(['workflow-summary', data.workflow_id]);
                }
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
