import { Center, MenuItem } from "./types";

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
	selectedWorkflowId: storage.defineItem<string | null>(
		'local:shared::selectedWorkflowId',
		{
			fallback: null,
		}
	),
	manageWorkflowMenuScrollPositions: storage.defineItem<Record<string, number>>(
		'local:shared::manageWorkflowMenuScrollPositions',
		{
			fallback: {},
		}
	),
}
