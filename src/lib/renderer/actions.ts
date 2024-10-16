import type { UUID } from "node:crypto"

export type ActionSetAssetVisibility = {
    type: "ACTION_SET_ASSET_VISIBILITY",
    args: [UUID, boolean]
}
export type ActionSetEntityVisibility = {
    type: "ACTION_SET_ENTITY_VISIBILITY",
    args: [UUID, boolean]
}
export type ActionSetEntityPosition = {
    type: "ACTION_SET_ENTITY_POSITION",
    args: [UUID, number, number, number]
}
export type ActionMoveCameraToPosition = {
    type: "MOVE_CAMERA_TO_POSITION",
    args: [number, number]
}
export type ActionMoveCameraTo = {
    type: "MOVE_CAMERA_TO",
    args: [UUID, string]
}

export type ActionSeries = {
    type: "ACTION_SERIES",
    args: Array<ActionSetAssetVisibility |
        ActionSetEntityVisibility |
        ActionSetEntityPosition |
        ActionMoveCameraToPosition |
        ActionMoveCameraTo>
}

export type Action = ActionSeries | ActionSetAssetVisibility | ActionSetEntityVisibility | ActionSetEntityPosition | ActionMoveCameraToPosition | ActionMoveCameraTo


export type TriggerOnInteraction = {
    type: "ON_INTERACTION",
    action: Action,
    target: UUID;
    eventType: "click"
}


export type Trigger = TriggerOnInteraction;

export const TRIGGERS = [
    {
        value: {
            name: "ON_INTERACTION",
            type: "click"
        },
        description: "Triggers when a click interaction happens"
    }
]