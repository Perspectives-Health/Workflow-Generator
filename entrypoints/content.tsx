import '@/assets/style.css';
import { StrictMode } from 'react';
import { EntrypointProvider } from '@/modules/shared/ui/entrypoint-provider';
import { Entrypoint } from "@/modules/shared/types";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/modules/shared/infrastructure/query-client';
import { AuthProvider } from '@/modules/auth/ui/auth-provider';
import { createRoot } from 'react-dom/client';
import { WorkflowGenerator } from '@/content-script-ui/WorkflowGenerator';


export default defineContentScript({
	matches: ["*://*/*", "*://*.trecovery.com/*"],
	cssInjectionMode: "ui",
	async main(ctx) {
		// 3. Define your UI
		const ui = await createShadowRootUi(ctx, {
			name: 'perspectives-workflow-generator',
			position: 'inline',
			anchor: 'body',
			onMount(container) {
				// Define how your UI will be mounted inside the container
				const wrapper = document.createElement("div");
				container.append(wrapper);
				const root = createRoot(wrapper);
				root.render(
					<StrictMode>
						<QueryClientProvider client={queryClient}>
							<EntrypointProvider ctx={Entrypoint.CONTENT_SCRIPT}>
								<AuthProvider>
									<WorkflowGenerator />
								</AuthProvider>
							</EntrypointProvider>
						</QueryClientProvider>
					</StrictMode>
				);
				return { root, wrapper };
			},
		});

		// 4. Mount the UI
		ui.mount();
	},
	// async main(ctx) {
	//     const ui = await createShadowRootUi(ctx, {
	//         name: "perspectives-health-companion",
	//         inheritStyles: false,
	//         position: 'inline',
	//         anchor: 'body',
	//         onMount: (container) => {
	//             const wrapper = document.createElement("div");
	//             container.append(wrapper);
	//             const root = createRoot(wrapper);
	//             root.render(
	//                 // <StrictMode>
	//                     // <ErrorBoundary>
	//                         <QueryClientProvider client={queryClient}>
	//                             <EntrypointProvider ctx={Entrypoint.CONTENT_SCRIPT}>
	//                                 <AuthProvider>
	//                                     <div>Hello World</div>
	//                                 </AuthProvider>
	//                             </EntrypointProvider>
	//                         </QueryClientProvider>
	//                     // </ErrorBoundary>
	//                 // </StrictMode>,
	//             );
	//             return { root, wrapper };
	//         },
	//         onRemove: (elements) => {
	//             elements?.root.unmount();
	//             elements?.wrapper.remove();
	//         },
	//     });

	//     ui.mount();

	//     // Set up mutation observer to watch for dynamically added obstructive elements
	//     setupObstructiveElementObserver();

	//     // Watch CareCenter visibility to hide/show obstructive elements
	//     careCenterStorage.visible.watch((visible) => {
	//         toggleObstructiveElementVisibility(visible);
	//     });

	//     // Clean up observer when content script is removed
	//     return () => {
	//         disconnectObstructiveElementObserver();
	//     };
	// },
});
