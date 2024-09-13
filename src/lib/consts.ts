export const EDITOR_MAP_WINDOW_LABEL = "display-editor";
export const MAP_WINDOW_LABEL = "display";

export const EDITOR_MAP_EVENTS = {
    "Init": "init",
    "Update": "update"
} as const;

export const DISPLAY_MAP_EVENTS = {
    "Init": "init",
    "Destory": "init",
    "Move": "move",
    "Update": "update",
    "Add": "add"
} as const;
