import { emitTo } from "@tauri-apps/api/event";
import type { LightNode } from "../DSNode"
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { EVENTS_MAP_EDITOR } from "@/lib/consts";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { StageObject } from "@/lib/types";


const TriggerItem: React.FC<{ id: string, triggerName: string, args: { name: string, value: string | number }[] }> = ({ triggerName, args }) => {
    return (
        <li>
            <div className="flex justify-between items-center" >
                <h5><span className="font-bold" >Trigger</span>: <span className="text-xs text-muted-foreground">{triggerName}</span > </h5>
                < Button type="button" variant="destructive" className="h-7 w-7" size="icon" title="Delete Trigger" >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            < table className="table-fixed w-full" >
                <thead>
                    <tr>
                        <th>Name </th>
                        <th colSpan={2}>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {args.map((arg, i) => (
                        <tr key={`_${i + 1}`}>
                            <td>{arg.name}</td>
                            <td colSpan={2} className="text-xs text-muted-foreground">{arg.value}</td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </li>
    );
}

export const DungeonAssetNodeDisplay: React.FC<{ openDialog: (target: string) => void, node: LightNode, targetWindow: string, selectedNode: string | null }> = ({ node, targetWindow, selectedNode, openDialog }) => {
    const { getValues, setValue } = useFormContext();

    const value = getValues("data") ?? {};

    const isSelectedNode = node.id === selectedNode;

    return (
        <details className={cn("w-full group", { "border border-yellow-500 rounded-md": isSelectedNode })
        } open={isSelectedNode} >
            <summary className="flex w-full before:content-['+'] group-open:before:content-['-'] before:w-5" >
                <div className="flex justify-between border-b mb-1 w-full" >
                    <button onClick={() => emitTo(targetWindow, EVENTS_MAP_EDITOR.CenterCameraOn, { type: "object", target: node.id })} className="pb-1 font-semibold tracking-tight underline text-left" type="button" > {node?.name} </button>
                    <div className="flex gap-2 items-center p-1" >
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            emitTo(targetWindow, EVENTS_MAP_EDITOR.SetVisable, { target: node.id, value: e });
                            setValue("data", { ...value, [node.id]: { ...value[node.id], overrides: { ...value[node.id].overrides, visiable: e } } })
                        }} />
                        <Label>Visable</Label>
                    </div>
                </div>
            </summary>
            < div className="flex flex-col mb-2 pl-4" >
                <h1>Triggers</h1>
                <ul className="mb-4 divide-y-2">
                    {(value[node.id]?.events as unknown[])?.map((_, i) => (
                        <li key={`_${i + 1}`}>
                            <h5>ON_INTERACTION: click</h5>
                            <span>Target: <span className="text-muted-foreground text-xs">TARGET</span></span>
                            <ul>
                                <TriggerItem id="" args={[{ name: "Target", value: "" }, { name: "Type", value: "object" }]} triggerName="MOVE_CAMERA_TO" />
                            </ul>
                        </li>
                    ))}
                </ul>
                < div className="flex justify-end" >
                    <Button size="icon" variant="outline" title="Add trigger" onClick={async () => {
                        openDialog("tld");
                        window.addEventListener("dialog::trigger-list", (ev) => {
                            const data = (ev as CustomEvent<{ name: string; type?: string } | null>).detail;
                            if (!data) return;
                            setValue("data", { ...value, [node.id]: { events: [{ type: data.name }] } })
                        }, { once: true });
                    }}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </details>
    );
}