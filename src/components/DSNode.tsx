import type { UUID } from "node:crypto";
import type { NodeType } from "@/lib/renderer/dungeonScrawl/types";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { emitEvent, WINDOW_MAP_EDITOR } from "@/lib/consts";
import { DungeonAssetNodeDisplay } from "./editor/DungeonAssetNodeDisplay";
import { EntitiesNode } from "./editor/EntityNode";
import { useEditorContext } from "./editor/EditorContext";

/**
 * TRIGGERS
 * 
 * ON_DOOR_OPEN     -> action
 * ON_DOOR_CLOSE    -> action
 * ON_STAIRS_CLIMB  -> action
 * ON_STARIS_DESEND -> action  
 * ON_INTERACTION   -> target, type, action
 * 
*/



/*
ACTIONS

{
 TYPE: string
 ARGS: []

}

SERIES -> action[]
- a list of actions that are executed in order

SET_ASSET_VISIBILITY    -> target, state
- set a dungeon asset's visibiltiy. Options are on,off, target is UUID

SET_ENTITY_VISIBILITY   -> target, state
-  set a entity's visibility. options are on,off, target is UUID

SET_ENTITY_POSITION     -> target, x, y, z
- move a entity to a new position, target is a UUID, x,y,z are number

MOVE_CAMERA_TO_POSITION -> x, y
- moves the camera to a set x and y position

MOVE_CAMERA_TO_ENTITY   -> target
- move the camera to center on a entity

MOVE_CAMERA_TO_ASSET   -> target

*/
export type LightNode = { name?: string, visible?: boolean, type: NodeType | "DOCUMENT", id: UUID, children?: LightNode[] }

export const DSNode: React.FC<{ node: LightNode }> = ({ node }) => {
    const { selected } = useEditorContext();
    switch (node.type) {
        case "DOCUMENT":
            return (
                <div className="flex flex-col">
                    <h3 className="border-b pb-2 font-bold tracking-tight">{node.name}</h3>

                    {node.children?.map(e => (
                        <DSNode key={e.id} node={e} />
                    ))}
                </div>
            );
        case "PAGE":
            return (
                <details className="pl-2" open>
                    <summary className="border-b pb-2 text-sm font-semibold tracking-tight select-none">
                        {node?.name?.length ? node.name : "Page"}
                    </summary>
                    <div className="pl-2 flex flex-col">
                        {node.children?.map(e => (
                            <DSNode key={e.id} node={e} />
                        ))}
                    </div>
                </details>
            );
        case "IMAGES": {
            const isOpen = node.children?.some(e => e.id === selected?.id);
            return (
                <details className="pl-2" open={isOpen} data-type={node.type} data-id={node.id}>
                    <summary className="border-b pb-2 font-semibold tracking-tight">
                        {node.name}: <span className="text-muted-foreground text-sm">{node.type}</span>
                    </summary>
                    <div className="flex gap-2 items-center p-1 pl-2">
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            emitEvent("setVisable", { target: node.id, type: "object", value: e === "indeterminate" ? false : e }, WINDOW_MAP_EDITOR);
                        }} />
                        <Label>Visable</Label>
                    </div>
                    <div className="pl-2 flex flex-col">
                        {node.children?.map(e => (
                            <DSNode key={e.id} node={e} />
                        ))}
                    </div>
                </details>
            );
        }
        case "TEMPLATE":
            return (
                <details className="pl-2">
                    <summary className="border-b pb-2 font-semibold tracking-tight">{node?.name}: <span className="text-muted-foreground text-sm">{node.type}</span></summary>
                    <div className="flex gap-2 items-center p-1 pl-2">
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            emitEvent("setVisable", { target: node.id, type: "object", value: e === "indeterminate" ? false : e }, WINDOW_MAP_EDITOR);
                        }} />
                        <Label>Visable</Label>
                    </div>
                    <div className="pl-2 flex flex-col">
                        <EntitiesNode layerId={node.id} />
                    </div>
                </details>
            );
        case "FOLDER":
            return (
                <div>
                    <h5>{node.type}</h5>
                    <div className="pl-2 flex flex-col">
                        {node.children?.map(e => (
                            <DSNode key={e.id} node={e} />
                        ))}
                    </div>
                </div>
            );
        case "DUNGEON_ASSET": {
            return (
                <DungeonAssetNodeDisplay node={node} />
            );
        }
        case "ASSET": {
            return (
                <DungeonAssetNodeDisplay node={node} />
            );
        }
        default:
            return null;
    }
}