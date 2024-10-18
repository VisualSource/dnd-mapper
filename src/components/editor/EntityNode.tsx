import { useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import update from "immutability-helper";
import { EVENTS_MAP_EDITOR } from "@/lib/consts";
import { emitTo } from "@tauri-apps/api/event";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import type { UUID } from "node:crypto";
import type { Entity, ReslovedEntityInstance } from "@/lib/types";
import { Trash2, User2 } from "lucide-react";

const EntityNode: React.FC<{ targetWindow: string, entity: ReslovedEntityInstance, onRemove: () => void, setProp: (name: string, value: unknown) => void }> = ({ targetWindow, entity, onRemove, setProp }) => {
    return (
        <details className="bg-gray-950 group mb-2">
            <summary className="flex w-full before:content-['+'] group-open:before:content-['-'] before:w-5 bg-zinc-900">
                <div className="flex justify-between border-b mb-1 w-full" >
                    <button onClick={() => emitTo(targetWindow, EVENTS_MAP_EDITOR.CenterCameraOn, { type: "entity", target: entity.id })} className="pb-1 font-semibold tracking-tight underline text-left" type="button" > {entity.overrides.name ?? entity.entity.name} </button>
                    <div className="flex gap-2 items-center p-1 mr-2" >
                        <Checkbox defaultChecked={entity.overrides.visible ?? true} onCheckedChange={e => {
                            emitTo(targetWindow, EVENTS_MAP_EDITOR.SetVisable, { type: "entity", target: entity.id, value: e });
                            setProp("visible", e);
                        }} />
                        <Label>Visable</Label>
                    </div>
                </div>
            </summary>
            <div className="p-2 flex flex-col gap-2">
                <input className="bg-transparent border rounded-md pl-1" type="text" placeholder="Overriden name" defaultValue={entity.overrides?.name} />
                <div className="flex gap-2">
                    <input defaultValue={entity.x} type="number" className="w-1/3 bg-transparent border rounded-md pl-1" placeholder="x" />
                    <input defaultValue={entity.y} type="number" className="w-1/3 bg-transparent border rounded-md pl-1" placeholder="y" />
                    <input defaultValue={entity.z} type="number" className="w-1/3 bg-transparent border rounded-md pl-1" placeholder="z" />
                </div>
                <div className="flex justify-end">
                    <Button onClick={onRemove} size="icon" variant="destructive" className="h-7 w-7" title="Remove Entity">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </details>
    );
}

export const EntitiesNode: React.FC<{ layerId: UUID, targetWindow: string, openDialog: (target: string) => void }> = ({ layerId, targetWindow, openDialog }) => {
    const { setValue, watch } = useFormContext();

    const entitiesList = watch("entities", {}) as Record<UUID, ReslovedEntityInstance[]>;
    const list = entitiesList[layerId] as ReslovedEntityInstance[] | undefined;

    return (
        <details>
            <summary className="border-b pb-2 font-semibold tracking-tight">Entities</summary>
            <div>
                <ul className="ml-2">
                    {list?.map((entity, i) => (
                        <EntityNode key={entity.id} entity={entity} targetWindow={targetWindow} onRemove={() => {
                            setValue("entities", update(entitiesList, {
                                [layerId]: {
                                    $splice: [[i, 1]]
                                }
                            }));
                        }} setProp={(name, value) => {
                            setValue("entities", update(entitiesList, {
                                [layerId]: {
                                    [i]: {
                                        overrides: {
                                            [name]: {
                                                $set: value
                                            }
                                        }
                                    }
                                }
                            }));
                        }} />
                    ))}
                </ul>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => {
                    openDialog("aed");
                    window.addEventListener("dialog::additionEntityDialog", (ev) => {
                        const data = (ev as CustomEvent<Entity | null>).detail;
                        if (!data) return;
                        setValue("entities", update(entitiesList, {
                            [layerId]: (ev) => {
                                if (!ev?.length) return [{ entity: data, id: crypto.randomUUID(), x: 0, y: 0, z: 0, overrides: {} }];
                                return [...ev, { entity: data, id: crypto.randomUUID(), x: 0, y: 0, z: 0, overrides: {} }];
                            }
                        }));
                    }, { once: true });
                }}><User2 className="mr-2 h-4 w-4" /> Add Entity</Button>
            </div>
        </details>
    );
}