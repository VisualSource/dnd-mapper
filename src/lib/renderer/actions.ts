import type { UUID } from "node:crypto"

export type ActionSetVisibility = {
    type: "SET_VISIBILITY",
    args: {
        target: UUID;
        state: boolean;
        type: "object" | "entity"
    }
}

export type ActionSetEntityPosition = {
    type: "SET_ENTITY_POSITION",
    args: {
        lerp: boolean;
        target: UUID,
        x: number;
        y: number;
        z: number;
    };
}
export type ActionMoveCameraToPosition = {
    type: "MOVE_CAMERA_TO_POSITION",
    args: {
        lerp: boolean
        x: number;
        y: number;
    }
}
export type ActionMoveCameraTo = {
    type: "MOVE_CAMERA_TO",
    args: {
        lerp: boolean
        target: UUID;
        type: "object" | "entity";
    }
}

export type ActionSetTransform = {
    type: "SET_TRANSFORM",
    args: {
        lerp: boolean;
        target: UUID,
        type: "object" | "entity",
        a: number;
        b: number;
        c: number;
        d: number
    }
}

export type ActionSeries = {
    type: "SERIES",
    args: Array<ActionSetVisibility |
        ActionSetEntityPosition |
        ActionMoveCameraToPosition |
        ActionMoveCameraTo | ActionSetTransform>
}

export type Action = ActionSeries | ActionSetVisibility | ActionSetEntityPosition | ActionMoveCameraToPosition | ActionMoveCameraTo | ActionSetTransform;

export type TriggerOnInteraction = {
    type: "ON_INTERACTION",
    action: Action | null,
    target: UUID;
    targetType: "object" | "entity"
    eventType: "click"
}


export type Trigger = TriggerOnInteraction;

export const TRIGGERS: { name: string; id: Trigger["type"], variant: string | null, description: string; }[] = [
    {
        name: "On Interaction",
        id: "ON_INTERACTION",
        variant: "click",
        description: "Triggers when a click interaction happens"
    }
];

export const ACTIONS: { name: string; value: Action["type"], description: string; }[] = [
    {
        name: "Set Asset Visibility",
        value: "SET_VISIBILITY",
        description: "Set a object or entity's visibility property"
    },
    {
        name: "Set Entity Position",
        value: "SET_ENTITY_POSITION",
        description: "Move a entity to a new position"
    },
    {
        name: "Move Camera to Position",
        value: "MOVE_CAMERA_TO_POSITION",
        description: "Move the camera to a specific locaiton"
    },
    {
        name: "Move Camera To",
        value: "MOVE_CAMERA_TO",
        description: "Camera move to center on a specific object or entity."
    },
    {
        name: "Series",
        value: "SERIES",
        description: "Execute a series of actions one after another"
    },
    {
        name: "Set Transform",
        value: "SET_TRANSFORM",
        description: "Change the transform of a entity or object"
    }
];

export function getDefaultTrigger(id: Trigger["type"] | null): Trigger | null {
    switch (id) {
        case "ON_INTERACTION":
            return {
                type: "ON_INTERACTION",
                action: null,
                target: "" as UUID,
                targetType: "object",
                eventType: "click"
            } as TriggerOnInteraction;
        default:
            return null;
    }
}

export function getDefaultAction(id: Action["type"] | null): Action | null {
    switch (id) {
        case "SERIES":
            return {
                type: "SERIES",
                args: []
            } as ActionSeries;
        case "SET_VISIBILITY":
            return {
                type: "SET_VISIBILITY",
                args: {
                    state: true,
                    target: "" as UUID,
                    type: "object"
                }
            } as ActionSetVisibility
        case "SET_ENTITY_POSITION":
            return {
                type: "SET_ENTITY_POSITION",
                args: {
                    lerp: false,
                    target: "" as UUID,
                    x: 0,
                    y: 0,
                    z: 0
                }
            } as ActionSetEntityPosition
        case "MOVE_CAMERA_TO_POSITION":
            return {
                type: "MOVE_CAMERA_TO_POSITION",
                args: {
                    lerp: false,
                    x: 0,
                    y: 0
                }
            } as ActionMoveCameraToPosition
        case "MOVE_CAMERA_TO":
            return {
                type: "MOVE_CAMERA_TO",
                args: {
                    lerp: false,
                    target: "" as UUID,
                    type: "object"
                }
            } as ActionMoveCameraTo;
        case "SET_TRANSFORM":
            return {
                type: "SET_TRANSFORM",
                args: {
                    lerp: false,
                    target: "" as UUID,
                    type: "object",
                    a: 1,
                    b: 0,
                    c: 0,
                    d: 1
                }
            } as ActionSetTransform;
        default:
            return null;
    }
}