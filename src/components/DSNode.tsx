import type { UUID } from "node:crypto";
import { Plus, Trash2 } from "lucide-react";

import type { NodeType } from "@/lib/renderer/dungeonScrawl/types";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { emitTo } from "@tauri-apps/api/event";
import { EVENTS_MAP_EDITOR } from "@/lib/consts";

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

export const DSNode: React.FC<{ node: LightNode, targetWindow: string }> = ({ node, targetWindow }) => {
    switch (node.type) {
        case "DOCUMENT":
            return (
                <div className="flex flex-col">
                    <h3 className="border-b pb-2 font-bold tracking-tight">{node.name}</h3>

                    {node.children?.map(e => (
                        <DSNode targetWindow={targetWindow} key={e.id} node={e} />
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
                            <DSNode targetWindow={targetWindow} key={e.id} node={e} />
                        ))}
                    </div>
                </details>
            );
        case "IMAGES":
            return (
                <details className="pl-2">
                    <summary className="border-b pb-2 font-semibold tracking-tight">
                        {node.name}: <span className="text-muted-foreground text-sm">{node.type}</span>
                    </summary>
                    <div className="flex gap-2 items-center p-1 pl-2">
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            emitTo(targetWindow, EVENTS_MAP_EDITOR.SetVisable, { target: node.id, value: e });
                        }} />
                        <Label>Visable</Label>
                    </div>
                    <div className="pl-2 flex flex-col">
                        {node.children?.map(e => (
                            <DSNode targetWindow={targetWindow} key={e.id} node={e} />
                        ))}
                    </div>
                </details>
            );
        case "TEMPLATE":
            return (
                <details className="pl-2">
                    <summary className="border-b pb-2 font-semibold tracking-tight">{node?.name}: <span className="text-muted-foreground text-sm">{node.type}</span></summary>
                    <div className="flex gap-2 items-center p-1 pl-2">
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            emitTo(targetWindow, EVENTS_MAP_EDITOR.SetVisable, { target: node.id, value: e });
                        }} />
                        <Label>Visable</Label>
                    </div>
                    <div className="pl-2 flex flex-col">
                        {node.children?.map(e => (
                            <DSNode targetWindow={targetWindow} key={e.id} node={e} />
                        ))}
                    </div>
                </details>
            );
        case "GRID":
            return (<div>{node.type}</div>)
        case "FOLDER":
            return (
                <div>
                    <h5>{node.type}</h5>
                    <div className="pl-2 flex flex-col">
                        {node.children?.map(e => (
                            <DSNode targetWindow={targetWindow} key={e.id} node={e} />
                        ))}
                    </div>
                </div>
            );
        case "DUNGEON_ASSET":
            return (
                <details className="w-full group">
                    <summary className="flex w-full before:content-['+'] group-open:before:content-['-'] before:w-5">
                        <div className="flex justify-between border-b mb-1 w-full">
                            <button onClick={() => {
                                emitTo(targetWindow, EVENTS_MAP_EDITOR.MoveCamera, { x: Math.floor((Math.random() % 10) * 100), y: Math.floor((Math.random() % 10) * 100) });
                            }} className="pb-1 font-semibold tracking-tight underline text-left" type="button">{node?.name}</button>
                            <div className="flex gap-2 items-center p-1">
                                <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                                    emitTo(targetWindow, EVENTS_MAP_EDITOR.SetVisable, { target: node.id, value: e });
                                }} />
                                <Label>Visable</Label>
                            </div>
                        </div>
                    </summary>
                    <div className="flex justify-end">
                        <ul>

                            <li>
                                <h5>Trigger: ON_DOOR_OPEN</h5>


                                <button type="button">
                                    <Trash2 />
                                </button>
                            </li>

                        </ul>
                        <Button size="sm">
                            <Plus className="h-4 2-4" />
                            Add Trigger
                        </Button>
                    </div>
                </details>
            );
        case "SHADOW":
            return (<div>{node.type}</div>)
        case "HATCHING":
            return (<div>{node.type}</div>)
        case "BUFFER_SHADING":
            return (<div>{node.type}</div>)
        default:
            return null;
    }
}