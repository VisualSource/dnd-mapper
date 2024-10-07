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
    type: "ACTION_MOVE_CAMERA_TO_POSITION",
    args: [number, number]
}
export type ActionMoveCameraToEntity = {
    type: "ACTION_MOVE_CAMERA_TO_ENTITY",
    args: [UUID]
}
export type ActionMoveCameraToAsset = {
    type: "ACTION_MOVE_CAMERA_TO_ASSET",
    args: [UUID]
}
export type ActionSeries = {
    type: "ACTION_SERIES",
    args: Array<ActionSetAssetVisibility |
        ActionSetEntityVisibility |
        ActionSetEntityPosition |
        ActionMoveCameraToPosition |
        ActionMoveCameraToAsset |
        ActionMoveCameraToEntity>
}

export type Action = ActionSeries | ActionSetAssetVisibility | ActionSetEntityVisibility | ActionSetEntityPosition | ActionMoveCameraToPosition | ActionMoveCameraToAsset | ActionMoveCameraToEntity


export type TriggerOnDoorOpen = {
    type: "TRIGGER_ON_DOOR_OPEN";
    target: UUID;
    action: Action;
}
export type TriggerOnDoorClose = {
    type: "TRIGGER_ON_DOOR_CLOSE";
    target: UUID;
    action: Action;
}
export type TriggerOnInteraction = {
    type: "TRIGGER_ON_INTERACTION",
    action: Action,
    target: UUID;
    eventType: "click"
}


export type Trigger = TriggerOnDoorOpen | TriggerOnDoorClose;