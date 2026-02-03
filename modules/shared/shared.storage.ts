import { Center, Enterprise, MenuItem } from "./types";

export const sharedStorage = {
	position: storage.defineItem<{ x: number, y: number }>(
		'local:shared::position',
		{
			fallback: { x: 20, y: 20 },
		}
	),
	currMenuItem: storage.defineItem<MenuItem>(
		'local:shared::currMenuItem',
		{
			fallback: "view-centers",
		}
	),
	backStack: storage.defineItem<MenuItem[]>(
		'local:shared::backStack',
		{
			fallback: [],
		}
	),
	visibility: storage.defineItem<boolean>(
		'local:shared::visibility',
		{
			fallback: true,
		}
	),
	selectedCenter: storage.defineItem<Center | null>(
		'local:shared::selectedCenter',
		{
			fallback: null,
		}
	),
	selectedEnterprise: storage.defineItem<Enterprise | null>(
		'local:shared::selectedEnterprise',
		{
			fallback: null,
		}
	),
	selectedWorkflowId: storage.defineItem<string | null>(
		'local:shared::selectedWorkflowId',
		{
			fallback: null,
		}
	),
	manageWorkflowMenuScrollPositions: storage.defineItem<Record<string, { scrollPosition: number; timestamp: number }>>(
		'local:shared::manageWorkflowMenuScrollPositions',
		{
			fallback: {},
		}
	),
	// Map workflowId to session info
	workflowSessionIdMap: storage.defineItem<Record<string, { sessionId: string; createdAt: string; isGenerating?: boolean }>>(
		'local:shared::workflowSessionIdMap',
		{
			fallback: {},
		}
	)
}
