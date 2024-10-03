import type { UUID } from "node:crypto";
import { Plus } from "lucide-react";

import type { NodeType } from "@/lib/renderer/dungeonScrawl/types";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { emitTo } from "@tauri-apps/api/event";
import { EVENTS_MAP_EDITOR } from "@/lib/consts";

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
                    <summary className="border-b pb-2 font-semibold tracking-tight">{node.name}: <span className="text-muted-foreground text-sm">{node.type}</span></summary>
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
                <div className="flex flex-col">
                    <button className="border-b pb-1 mb-1 font-semibold tracking-tight underline text-left" type="button">{node?.name}</button>
                    <div className="flex gap-2 items-center p-1">
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            emitTo(targetWindow, EVENTS_MAP_EDITOR.SetVisable, { target: node.id, value: e });
                        }} />
                        <Label>Visable</Label>
                    </div>
                    <div className="flex justify-end">

                        <Button size="sm">
                            <Plus className="h-4 2-4" />
                            Add Trigger
                        </Button>
                    </div>
                </div>
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