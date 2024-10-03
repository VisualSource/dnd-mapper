import { emitTo } from "@tauri-apps/api/event";
import { Window } from "@tauri-apps/api/window";
import {
	DISPLAY_MAP_EVENTS,
	WINDOW_MAP_EDITOR,
	MAP_WINDOW_LABEL,
} from "./consts";
import type { DisplayEventMap } from "./consts";

export const editorWindow = new Window(WINDOW_MAP_EDITOR);
editorWindow.listen("tauri://close-requested", () => editorWindow.hide());
export const toggleEditorWindow = () =>
	editorWindow
		.isVisible()
		.then((e) => (e ? editorWindow.hide() : editorWindow.show()));

export const displayWindow = new Window(MAP_WINDOW_LABEL);
displayWindow.listen("tauri://close-requested", () => displayWindow.hide());
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
