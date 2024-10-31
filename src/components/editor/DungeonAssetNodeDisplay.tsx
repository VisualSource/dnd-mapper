import type { LightNode } from "../DSNode"
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { emitEvent, EVENTS_MAP_EDITOR, WINDOW_MAP_EDITOR } from "@/lib/consts";
import { Button } from "../ui/button";
import { Activity, Clapperboard, Layers3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { Separator } from "../ui/separator";
import type { ResolvedStage } from "@/lib/types";
import update from "immutability-helper";
import type { Action, Trigger } from "@/lib/renderer/actions";
import { OpenDialog, useEditorContext } from "./EditorContext";
import type { UUID } from "node:crypto";

const ActionItem: React.FC<{ onDelete: () => void, triggerName: string, args: Record<string, string | number | boolean>, layerId: UUID, eventIndex: number, argIndex?: number }> = ({ eventIndex, argIndex, layerId, triggerName, args, onDelete }) => {
    const { lists } = useEditorContext();
    const { control, watch, register } = useFormContext<Omit<ResolvedStage, "map">>();

    const type = watch(argIndex === undefined ? `data.${layerId}.events.${eventIndex}.action.args.type` : `entities.${layerId}.events.${eventIndex}.action.args.${argIndex}.type`, undefined);

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
                                    <Controller name={argIndex === undefined ? `data.${layerId}.events.${eventIndex}.action.args.${name}` : `entities.${layerId}.events.${eventIndex}.action.args.${argIndex}.${name}`} control={control} render={({ field }) => (
                                        <select className="bg-transparent text-muted-foreground text-sm w-full" {...field}>
                                            {type === "entity" ? (
                                                lists?.entities.map(g => (
                                                    <optgroup className="bg-zinc-900 text-white" label={g.layerName} key={g.layerId}>
                                                        {g.options.map(e => (
                                                            <option className="bg-zinc-900 text-white" value={e.id} key={e.id}>{e.name}</option>
                                                        ))}
                                                    </optgroup>
                                                ))
                                            ) : (
                                                lists?.objects.map(o => (
                                                    <option className="bg-zinc-900 text-white" key={o.id} value={o.id}>{o.name}</option>
                                                ))
                                            )}
                                        </select>
                                    )} />

                                ) : name === "type" ? (
                                    <Controller name={argIndex === undefined ? `data.${layerId}.events.${eventIndex}.action.args.${name}` : `entities.${layerId}.events.${eventIndex}.action.args.${argIndex}.${name}`} control={control} render={({ field }) => (
                                        <select className="bg-transparent text-muted-foreground text-sm w-full" {...field}>
                                            <option className="bg-zinc-900 text-white" value="object">Object</option>
                                            <option className="bg-zinc-900 text-white" value="entity">Entity</option>
                                        </select>
                                    )} />
                                ) : typeof value === "boolean" ? (
                                    <input className="bg-transparent border rounded-sm px-2 py-1" type="checkbox" defaultChecked={value} {...register(argIndex === undefined ? `data.${layerId}.events.${eventIndex}.action.args.${name}` : `entities.${layerId}.events.${eventIndex}.action.args.${argIndex}.${name}`)} />
                                ) : <input className="bg-transparent border rounded-sm px-2 py-1" type={typeof value === "number" ? "number" : "text"} defaultValue={value} {...register(argIndex === undefined ? `data.${layerId}.events.${eventIndex}.action.args.${name}` : `entities.${layerId}.events.${eventIndex}.action.args.${argIndex}.${name}`, { valueAsNumber: typeof value === "number" })} />
                                }

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </li>
    );
}

export const DungeonAssetNodeDisplay: React.FC<{ node: LightNode }> = ({ node }) => {
    const { selected, openDialog, lists } = useEditorContext();
    const { watch, setValue } = useFormContext<Omit<ResolvedStage, "map">>();

    const stageData = watch("data", {
        [node.id]: {
            events: [],
            id: node.id,
            overrides: {}
        }
    });
    const isSelectedNode = node.id === selected?.id;

    return (
        <details className={cn("w-full group", { "border border-yellow-500 rounded-md": isSelectedNode })
        } open={isSelectedNode} >
            <summary className="flex w-full before:content-['+'] group-open:before:content-['-'] before:w-5" >
                <div className="flex justify-between border-b mb-1 w-full" >
                    <button onClick={() => emitEvent(EVENTS_MAP_EDITOR.CenterCameraOn, { type: "object", target: node.id }, WINDOW_MAP_EDITOR)} className="pb-1 font-semibold tracking-tight underline text-left" type="button" > {node?.name} </button>
                    <div className="flex gap-2 items-center p-1 mr-2" >
                        <Checkbox defaultChecked={node.visible} onCheckedChange={e => {
                            const state = e === "indeterminate" ? false : e;
                            emitEvent("setVisable", { target: node.id, type: "object", value: state }, WINDOW_MAP_EDITOR);

                            setValue("data", update(stageData, { [node.id]: { overrides: { visible: { $set: state } } } }));
                        }} />
                        <Label>Visable</Label>
                    </div>
                </div>
            </summary>
            < div className="flex flex-col mb-2 pl-4" >
                <h1>Triggers</h1>
                <ul className="mb-4 divide-y-2">
                    {(stageData[node.id]?.events)?.map((ev, i) => (
                        <li key={`_${i + 1}`} className="ml-2 border rounded p-1">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h5>{ev.type}: {ev.eventType}</h5>
                                    <span>Target:
                                        <select defaultValue={node.id} className="bg-transparent text-muted-foreground text-sm">
                                            <optgroup label="Objects" data-type="object">
                                                {lists?.objects.map(e => (
                                                    <option value={e.id} key={e.id}>{e.id === node.id ? "Self" : e.name}</option>
                                                ))}
                                            </optgroup>
                                            {lists?.entities.map((g => (
                                                <optgroup key={`group_${g.layerId}`} label={`Entites (${g.layerName}})`}>
                                                    {g.options.map(e => (
                                                        <option value={e.id} key={e.id}>{e.name}</option>
                                                    ))}
                                                </optgroup>
                                            )))}
                                        </select>
                                    </span>
                                </div>
                                < Button onClick={() => {
                                    setValue("data", update(stageData, { [node.id]: { events: { $splice: [[i, 1]] } } }));
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
                                                    setValue("data", update(stageData, { [node.id]: { events: { [i]: { action: { $set: null } } } } }));
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
                                                <ActionItem argIndex={actionIndex} eventIndex={i} layerId={node.id} args={action.args} triggerName={action.type} onDelete={() => {
                                                    setValue("data", update(stageData, {
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
                                            <ActionItem eventIndex={i} layerId={node.id} args={ev.action.args} triggerName={ev.action.type} onDelete={() => {
                                                setValue("data", update(stageData, { [node.id]: { events: { [i]: { action: { $set: null } } } } }));
                                            }} />
                                        )}
                                    </ul>
                                    {ev.action.type === "SERIES" ? (
                                        <Button size="sm" className="w-full mt-2" variant="secondary" onClick={() => {
                                            openDialog(OpenDialog.ActionList, (ev) => {
                                                const data = (ev as CustomEvent<Action | null>).detail;
                                                if (!data) return;
                                                if (data.type === "SERIES") return;
                                                setValue("data", update(stageData, {
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
                                            });
                                        }}><Layers3 className="mr-2 h-5 w-5" /> Add Action</Button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="flex w-full justify-center p-2">
                                    <Button size="sm" className="w-full" variant="secondary" onClick={() => {
                                        openDialog(OpenDialog.ActionList, (ev) => {
                                            const data = (ev as CustomEvent<Action | null>).detail;
                                            if (!data) return;
                                            setValue("data", update(stageData, {
                                                [node.id]: {
                                                    events: {
                                                        [i]: {
                                                            action: { $set: data }
                                                        }
                                                    }
                                                }
                                            }))
                                        });
                                    }}><Activity className="mr-2 h-5 w-5" /> Add Action</Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                < div className="flex justify-end" >
                    <Button size="sm" className="w-full" variant="outline" title="Add trigger" onClick={async () => {
                        openDialog(OpenDialog.TriggerList, (ev) => {
                            const data = (ev as CustomEvent<Trigger | null>).detail;
                            if (!data) return;
                            setValue("data", update(stageData, { [node.id]: { events: { $push: [data] } } }))
                        });
                    }}>
                        <Clapperboard className="h-4 w-4 mr-2" /> Add Trigger
                    </Button>
                </div>
            </div>
        </details>
    );
}