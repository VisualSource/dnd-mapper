import { Window } from "@tauri-apps/api/window";
import { EDITOR_MAP_WINDOW_LABEL } from "./consts";

export const editorWindow = new Window(EDITOR_MAP_WINDOW_LABEL);
export const toggleEditorWindow = () => editorWindow.isVisible().then(e => e ? editorWindow.hide() : editorWindow.show());

export const displayWindow = new Window("display");
export const displayWindowToggle = () => displayWindow.isVisible().then(e => e ? displayWindow.hide() : displayWindow.show());