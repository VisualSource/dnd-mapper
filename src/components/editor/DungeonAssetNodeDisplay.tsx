import { emitTo } from "@tauri-apps/api/event";
import type { LightNode } from "../DSNode"
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { EVENTS_MAP_EDITOR } from "@/lib/consts";
import { Button } from "../ui/button";
import { Activity, Clapperboard, Layers3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { Separator } from "../ui/separator";
import type { StageObject } from "@/lib/types";
import type { UUID } from "node:crypto";
import update from "immutability-helper";
import type { Action, Trigger } from "@/lib/renderer/actions";

const ActionItem: React.FC<{ onDelete: () => void, triggerName: string, args: Record<string, string | number | boolean> }> = ({ triggerName, args, onDelete }) => {
    return (
        <li className="p-1">
            <div className="flex justify-between items-center" >
                <h5><span className="font-bold" >Action</span>: <span className="text-xs text-muted-foreground">{triggerName}</span > </h5>
                <div className="flex gap-2">
                    < Button onClick={onDelete} type="button" variant="destructive" className="h-7 w-7" size="icon" title="Delete Action" >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            < table className="table-fixed w-full" >
                <thead>
                    <tr>
                        <th>Name </th>
                        <th colSpan={2}>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(args).map(([name, value], i) => (
                        <tr key={`_${i + 1}`}>
                            <td>{name.replace(/^\w/, name[0].toUpperCase())}</td>
                            <td colSpan={2} className="text-xs text-muted-foreground">
                                {name === "target" ? (
                                    <select>
                                        <option>Object</option>
                                    </select>
                                ) : name === "type" ? (
                                    <select>
                                        <option value="object">Object</option>
                                    </select>
                                ) : typeof value === "boolean" ? (
                                    <input type="checkbox" defaultChecked={value} />
                                ) : <input type={typeof value === "number" ? "number" : "text"} defaultValue={value} />
                                }

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </li>
    );
}

export const DungeonAssetNodeDisplay: React.FC<{ openDialog: (target: string) => void, node: LightNode, targetWindow: string, selectedNode: string | null }> = ({ node, targetWindow, selectedNode, openDialog }) => {
    const { watch, setValue } = useFormContext();

    const value = watch("data", {}) as Record<UUID, StageObject>;

    const isSelectedNode = node.id === selectedNode;

    return (
        <details className={cn("w-full group", { "border border-yellow-500 rounded-md": isSelectedNode })
        } open={isSelectedNode} >
            <summary className="flex w-full before:content-['+'] group-open:before:content-['-'] before:w-5" >
                <div className="flex justify-between border-b mb-1 w-full" >
                    <button onClick={() => emitTo(targetWindow, EVENTS_MAP_EDITOR.CenterCameraOn, { type: "object", target: node.id })} className="pb-1 font-semibold tracking-tight underline text-left" type="button" > {node?.name} </button>
                    <div className="flex gap-2 items-center p-1 mr-2" >
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            emitTo(targetWindow, EVENTS_MAP_EDITOR.SetVisable, { type: "object", target: node.id, value: e });
                            if (!value[node.id]) {
                                setValue("data", update(value, {
                                    [node.id]: {
                                        $set: {
                                            events: [],
                                            id: node.id,
                                            overrides: {
                                                visible: e
                                            }
                                        }
                                    }
                                }));
                                return;
                            }
                            setValue("data", update(value, {
                                [node.id]: {
                                    overrides: {
                                        visible: {
                                            $set: e
                                        }
                                    }
                                }
                            }));
                        }} />
                        <Label>Visable</Label>
                    </div>
                </div>
            </summary>
            < div className="flex flex-col mb-2 pl-4" >
                <h1>Triggers</h1>
                <ul className="mb-4 divide-y-2">
                    {(value[node.id]?.events)?.map((ev, i) => (
                        <li key={`_${i + 1}`} className="ml-2 border rounded p-1">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h5>{ev.type}: {ev.eventType}</h5>
                                    <span>Target:
                                        <select className="bg-transparent text-muted-foreground text-sm">
                                            <optgroup label="Objects">
                                                <option value="9e8873fe-6952-41c6-a2fa-4e3ad422d3ec">Object</option>
                                            </optgroup>
                                            <optgroup label="Entities">
                                                <option value="9e8873fe-6952-41c6-a2fa-4e3ad422d3ec">Entity</option>
                                            </optgroup>
                                        </select>
                                    </span>
                                </div>
                                < Button onClick={() => {
                                    setValue("data", update(value, { [node.id]: { events: { $splice: [[i, 1]] } } }));
                                }} type="button" variant="destructive" className="h-7 w-7" size="icon" title="Delete Trigger" >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Separator />
                            {ev.action ? (
                                <div>
                                    {ev.action.type === "SERIES" ? (
                                        <>
                                            <div className="flex justify-between items-center p-1">
                                                <h5>Action: <span className="text-muted-foreground text-sm">{ev.action.type}</span></h5>
                                                < Button onClick={() => {
                                                    setValue("data", update(value, { [node.id]: { events: { [i]: { action: { $set: null } } } } }));
                                                }} type="button" variant="destructive" className="h-7 w-7" size="icon" title="Delete Action" >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Separator />
                                        </>
                                    ) : null}
                                    <ul className="ml-2 mt-2 divide-y-2">
                                        {ev.action.type === "SERIES" ? (
                                            ev.action.args.map((action, actionIndex) => (
                                                <ActionItem args={action.args} triggerName={action.type} onDelete={() => {
                                                    setValue("data", update(value, {
                                                        [node.id]: {
                                                            events: {
                                                                [i]: {
                                                                    action: { args: { $splice: [[actionIndex, 1]] } }
                                                                }
                                                            }
                                                        }
                                                    }))
                                                }} key={`${action.type}_${actionIndex}`} />
                                            ))
                                        ) : (
                                            <ActionItem args={ev.action.args} triggerName={ev.action.type} onDelete={() => {
                                                setValue("data", update(value, { [node.id]: { events: { [i]: { action: { $set: null } } } } }));
                                            }} />
                                        )}
                                    </ul>
                                    {ev.action.type === "SERIES" ? (
                                        <Button size="sm" className="w-full mt-2" variant="secondary" onClick={() => {
                                            openDialog("ald");
                                            window.addEventListener("dialog::actions-list", (ev) => {
                                                const data = (ev as CustomEvent<Action | null>).detail;
                                                if (!data) return;
                                                if (data.type === "SERIES") return;
                                                setValue("data", update(value, {
                                                    [node.id]: {
                                                        events: {
                                                            [i]: {
                                                                action: (v) => {
                                                                    if (!v) return v;
                                                                    if (Array.isArray(v.args)) {
                                                                        v.args = [...v.args, data]
                                                                    }
                                                                    return v;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }))
                                            }, { once: true });
                                        }}><Layers3 className="mr-2 h-5 w-5" /> Add Action</Button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="flex w-full justify-center p-2">
                                    <Button size="sm" className="w-full" variant="secondary" onClick={() => {
                                        openDialog("ald");
                                        window.addEventListener("dialog::actions-list", (ev) => {
                                            const data = (ev as CustomEvent<Action | null>).detail;
                                            if (!data) return;
                                            setValue("data", update(value, {
                                                [node.id]: {
                                                    events: {
                                                        [i]: {
                                                            action: { $set: data }
                                                        }
                                                    }
                                                }
                                            }))
                                        }, { once: true });
                                    }}><Activity className="mr-2 h-5 w-5" /> Add Action</Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                < div className="flex justify-end" >
                    <Button size="sm" className="w-full" variant="outline" title="Add trigger" onClick={async () => {
                        openDialog("tld");
                        window.addEventListener("dialog::trigger-list", (ev) => {
                            const data = (ev as CustomEvent<Trigger | null>).detail;
                            if (!data) return;

                            if (!value[node.id]) {
                                setValue("data", update(value, {
                                    [node.id]: {
                                        $set: {
                                            events: [data],
                                            id: node.id,
                                            overrides: {}
                                        }
                                    }
                                }));
                                return;
                            }

                            setValue("data", update(value, { [node.id]: { events: { $push: [data] } } }))
                        }, { once: true });
                    }}>
                        <Clapperboard className="h-4 w-4 mr-2" /> Add Trigger
                    </Button>
                </div>
            </div>
        </details>
    );
}