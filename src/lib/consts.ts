import type { PuckSize } from "./display/utils";

export const EDITOR_MAP_WINDOW_LABEL = "display-editor";
export const MAP_WINDOW_LABEL = "display";

export const EDITOR_MAP_EVENTS = {
    "Update": "update"
} as const;

export const DISPLAY_MAP_EVENTS = {
    "Init": "init",
    "Update": "update",
    "Add": "add",
    "Delete": "delete"
} as const;


export type DisplayEventMap = {
    "move": { target: string; x: number, y: number }
    "display": { displayOnMap: boolean, target: string }
    "set-z": { target: string, z: number },
    "set-puck": { target: string; size: PuckSize }
}

export type DisplayEvent = { type: "move", data: DisplayEventMap["move"] } |
{ type: "display", data: DisplayEventMap["display"] } |
{ type: "set-z", data: DisplayEventMap["set-z"] } |
{ type: "set-puck", data: DisplayEventMap["set-puck"] }
