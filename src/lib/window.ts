import { emitTo } from "@tauri-apps/api/event";
import { Window } from "@tauri-apps/api/window";
import {
	DISPLAY_MAP_EVENTS,
	EDITOR_MAP_WINDOW_LABEL,
	MAP_WINDOW_LABEL,
} from "./consts";
import type { DisplayEventMap } from "./consts";

export const editorWindow = new Window(EDITOR_MAP_WINDOW_LABEL);
export const toggleEditorWindow = () =>
	editorWindow
		.isVisible()
		.then((e) => (e ? editorWindow.hide() : editorWindow.show()));

export const displayWindow = new Window(MAP_WINDOW_LABEL);
export const displayWindowToggle = () =>
	displayWindow
		.isVisible()
		.then((e) => (e ? displayWindow.hide() : displayWindow.show()));

export async function emitUpdateEvent<
	T extends keyof DisplayEventMap,
	P extends DisplayEventMap[T],
>(type: T, payload: P) {
	await emitTo(MAP_WINDOW_LABEL, DISPLAY_MAP_EVENTS.Update, {
		type,
		data: payload,
	});
}
