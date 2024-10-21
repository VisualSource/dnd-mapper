import type { UUID } from "node:crypto";
import type { PuckSize } from "./display/utils";
import type { ReslovedEntityInstance } from "./types";
import { emitTo } from "@tauri-apps/api/event";

export const WINDOW_MAIN = "main";
export const WINDOW_MAP_EDITOR = "display-editor";

export const EVENTS_MAP_EDITOR = {
	Load: "load",
	SetVisable: "setVisable",
	MoveCamera: "moveCamera",
	CenterCameraOn: "centerCameraOn",
	AddEntity: "addEntity"
} as const;

export type EventMap = {
	load: unknown,
	addEntity: { layer: UUID, entity: ReslovedEntityInstance },
	setVisable: { type: "object" | "entity", target: UUID, value: boolean },
	moveCamera: { x: number, y: number },
	centerCameraOn: { type: "object" | "entity", target: UUID },
}

export const emitEvent = <T extends keyof EventMap>(event: T, args: EventMap[T], window: string) => emitTo(window, event, args);

//export const EDITOR_MAP_WINDOW_LABEL = "display-editor";
export const MAP_WINDOW_LABEL = "display";

export const DISPLAY_MAP_EVENTS = {
	Init: "init",
	Update: "update",
	Add: "add",
	Delete: "delete",
} as const;

export type DisplayEventMap = {
	move: { target: string; x: number; y: number };
	display: { displayOnMap: boolean; target: string };
	"set-z": { target: string; z: number };
	"set-puck": { target: string; size: PuckSize };
};

export type DisplayEvent =
	| { type: "move"; data: DisplayEventMap["move"] }
	| { type: "display"; data: DisplayEventMap["display"] }
	| { type: "set-z"; data: DisplayEventMap["set-z"] }
	| { type: "set-puck"; data: DisplayEventMap["set-puck"] };
