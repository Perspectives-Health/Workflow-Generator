// import { CreateWorkflowRequest } from "@/modules/shared/types";
// import { useMutation } from "@tanstack/react-query";
// import { useMessaging } from "@/modules/shared/ui/entrypoint-provider";
// import { createQueries } from "@/modules/shared/infrastructure/create-queries";
// import { mappingQueries } from "../infrastructure/mapping.send-message.app";


// export const useMappingQueries = () => {
//     const { sendMessage } = useMessaging();
//     const api = createQueries(sendMessage, mappingQueries);

//     return {
//         useCreateWorkflow: () => useMutation({
//             mutationFn: async (body: CreateWorkflowRequest) => api.createWorkflow(body),
//         })
//     };
// }