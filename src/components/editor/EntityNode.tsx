import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Trash2, User2 } from "lucide-react";
import type { UUID } from "node:crypto";

import { emitEvent, EVENTS_MAP_EDITOR, WINDOW_MAP_EDITOR } from "@/lib/consts";
import type { Entity, ReslovedEntityInstance, ResolvedStage } from "@/lib/types";
import { OpenDialog, useEditorContext } from "./EditorContext";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

const EntityNode: React.FC<{ index: number, layerId: UUID, entity: ReslovedEntityInstance, onRemove: () => void }> = ({ index, entity, onRemove, layerId }) => {
    const { register, control } = useFormContext<ResolvedStage>();

    return (
        <details className="bg-gray-950 group mb-2">
            <summary className="flex w-full before:content-['+'] group-open:before:content-['-'] before:w-5 bg-zinc-900">
                <div className="flex justify-between border-b mb-1 w-full" >
                    <button onClick={() => emitEvent(EVENTS_MAP_EDITOR.CenterCameraOn, { type: "entity", target: entity.id, layerId }, WINDOW_MAP_EDITOR)} className="pb-1 font-semibold tracking-tight underline text-left" type="button" > {entity.overrides?.name?.length ? entity.overrides?.name : entity.entity.name}</button>
                    <div className="flex gap-2 items-center p-1 mr-2" >
                        <Controller defaultValue={true} control={control} name={`entities.${layerId}.${index}.overrides.visible`} render={({ field }) => (
                            <Checkbox defaultChecked={field.value} onCheckedChange={e => {
                                const state = e === "indeterminate" ? false : e;
                                emitEvent(EVENTS_MAP_EDITOR.SetVisable, { type: "entity", layerId, target: entity.id, value: state }, WINDOW_MAP_EDITOR);
                                field.onChange(state);
                            }} />
                        )} />

                        <Label>Visable</Label>
                    </div>
                </div>
            </summary>
            <div className="p-2 flex flex-col gap-2">
                <input className="bg-transparent border rounded-md pl-1" type="text" placeholder="Overriden name" {...register(`entities.${layerId}.${index}.overrides.name`)} />
                <div className="flex gap-2">
                    <input type="number" className="w-1/3 bg-transparent border rounded-md pl-1" placeholder="x" {...register(`entities.${layerId}.${index}.x`, { valueAsNumber: true })} />
                    <input type="number" className="w-1/3 bg-transparent border rounded-md pl-1" placeholder="y" {...register(`entities.${layerId}.${index}.y`, { valueAsNumber: true })} />
                    <input type="number" className="w-1/3 bg-transparent border rounded-md pl-1" placeholder="z" {...register(`entities.${layerId}.${index}.z`, { valueAsNumber: true })} />
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

export const EntitiesNode: React.FC<{ layerId: UUID, }> = ({ layerId }) => {
    const { openDialog } = useEditorContext();
    const { control } = useFormContext<ResolvedStage>();
    const { fields, append, remove } = useFieldArray({ keyName: "fieldId", control, name: `entities.${layerId}` });

    return (
        <details>
            <summary className="border-b pb-2 font-semibold tracking-tight">Entities</summary>
            <div>
                <ul className="ml-2">
                    {fields.map((entity, i) => (
                        <EntityNode index={i} layerId={layerId} key={entity.fieldId} entity={entity} onRemove={() => remove(i)} />
                    ))}
                </ul>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => {
                    openDialog(OpenDialog.AddEntity, async (ev) => {
                        const data = (ev as CustomEvent<Entity | null>).detail;
                        if (!data) return;
                        const el = { entity: data, id: crypto.randomUUID(), x: 0, y: 0, z: 0, overrides: {} };
                        append(el, { shouldFocus: true, focusIndex: fields.length });
                        await emitEvent("addEntity", { layer: layerId, entity: el }, WINDOW_MAP_EDITOR);
                    });
                }}><User2 className="mr-2 h-4 w-4" /> Add Entity</Button>
            </div>
        </details>
    );
}