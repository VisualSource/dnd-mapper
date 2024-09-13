import { useForm, useFieldArray, type Control, type FieldValues } from 'react-hook-form';
import { emitTo } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { AdditionEntityDialog, type AdditionEntityDialogHandle } from "../dialog/AdditionEntityDialog";
import { EDITOR_MAP_EVENTS, EDITOR_MAP_WINDOW_LABEL } from "../../lib/consts";
import type { ResolvedStage, Stage } from "../../lib/types";
import { ImageSelect } from "../ImageSelect";
import { db } from "../../lib/db";

export const StageForm: React.FC<{ stage?: Stage, onSubmit: (stage: Stage) => void }> = ({ stage, onSubmit }) => {
    const dialogRef = useRef<AdditionEntityDialogHandle>(null);

    const { register, control, handleSubmit, watch } = useForm<ResolvedStage>({
        async defaultValues() {
            let value: ResolvedStage;
            if (!stage) {
                value = {
                    name: "",
                    backgroundImage: "",
                    backgroundPosition: { x: 0, y: 0 },
                    backgroundSize: { h: 0, w: 0 },
                    entities: [],
                    gridScale: 28,
                    id: crypto.randomUUID(),
                    nextStage: null,
                    prevStage: null,
                    stageGroup: null
                } as ResolvedStage;
            } else {
                const items = await db.entity.where("id").anyOf(stage.entities.map(e => e.id)).toArray();

                const a: ResolvedStage["entities"] = [];
                for (const e of stage.entities) {
                    const ent = items.find(d => d.id === e.id);
                    if (!ent) continue;
                    a.push({ x: e.x, y: e.y, instanceId: e.id, entity: ent });
                }

                value = { ...stage, entities: a };
            }
            emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Init, value);
            return value;

        },
    });
    const entityField = useFieldArray({
        control,
        name: "entities"
    });

    useEffect(() => {
        const sub = watch((value, { type }) => {
            if (type === "valueChange") {
                emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Update, value);
            }
        });
        return () => sub.unsubscribe();
    }, [watch]);

    const onFormSubmit = (state: ResolvedStage) => {
        const value: Stage = { ...state, entities: state.entities.map(({ entity, ...rest }) => ({ ...rest, id: entity.id })) };
        onSubmit(value);
    }

    return (
        <>
            <AdditionEntityDialog onAdd={e => entityField.prepend({ entity: e, instanceId: crypto.randomUUID(), x: 0, y: 0 })} ref={dialogRef} />
            <form className="overflow-y-scroll p-2" onSubmit={handleSubmit(onFormSubmit)}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="stage-name">Name</label>
                    <input {...register("name", { required: true })} id="stage-name" placeholder="Name" />
                    <p className="text-sm">A friendly name for this stage</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="stage-grid-scale">Grid Scale</label>
                    <input  {...register("gridScale", { required: true })} id="stage-grid-scale" type="number" />
                    <p className="text-sm">The size of the grid cells (Default 28px)</p>
                </div>

                <ImageSelect control={control as never as Control<FieldValues>} name="backgroundImage" />
                <div className="flex flex-col">
                    <h2>Image Position</h2>
                    <div className="flex gap-2 w-full">
                        <div>
                            <label htmlFor="stage-backgroundPosition.x">X</label>
                            <input  {...register("backgroundPosition.x", { required: true })} id="stage-backgroundPosition.x" className="w-full" type="number" placeholder="X" />
                        </div>
                        <div>
                            <label htmlFor="stage-backgroundPosition.y">Y</label>
                            <input {...register("backgroundPosition.y", { required: true })} id="stage-backgroundPosition.y" className="w-full" type="number" placeholder="Y" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h2>Image Size</h2>
                    <div className="flex gap-2 w-full">
                        <div>
                            <label htmlFor="stage-backgroundSize.h">Width</label>
                            <input {...register("backgroundSize.h", { required: true })} id="stage-backgroundSize.h" className="w-full" type="number" placeholder="W" />
                        </div>
                        <div>
                            <label htmlFor="stage-backgroundSize.w">Height</label>
                            <input {...register("backgroundSize.w", { required: true })} id="stage-backgroundSize.w" className="w-full" type="number" placeholder="H" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1>Entities</h1>
                    <ul className="max-h-52 mb-2 overflow-y-scroll">
                        {entityField.fields.map((e, index) => (
                            <li key={e.instanceId}>
                                <div className="flex gap-2">
                                    <div className="h-6 w-6 relative">
                                        <img className="h-full w-full object-cover" src={e.entity.image} alt="Entity Icon" />
                                    </div>
                                    <div className="flex justify-between">
                                        <h1>{e.entity.name}</h1>

                                        <button type="button" onClick={() => entityField.remove(index)}>Del</button>
                                    </div>
                                </div>
                                <input {...register(`entities.${index}.nameOverride`)} placeholder="Name override" />
                                <div>
                                    <input {...register(`entities.${index}.x`)} type="number" placeholder="x" />
                                    <input {...register(`entities.${index}.y`)} type="number" placeholder="y" />
                                </div>
                            </li>
                        ))}
                    </ul>


                    <div className="flex justify-end">
                        <button type="button" onClick={() => dialogRef.current?.show()}>Add Entity</button>
                    </div>
                </div>


                <div className="flex w-full">
                    <div className="flex flex-col w-full">
                        <label htmlFor="stage-prev">Prev Stage</label>
                        <select id="stage-prev" {...register("prevStage", { required: true })}>
                            <option>None</option>
                        </select>
                    </div>
                    <div className="flex flex-col w-full">
                        <label htmlFor="stage-next">Next Stage</label>
                        <select id="stage-next" {...register("nextStage", { required: true })}>
                            <option>None</option>
                        </select>
                    </div>
                </div>


                <div className="flex flex-col">
                    <label htmlFor="stage-group">Stage Group</label>
                    <select id="stage-group" {...register("stageGroup", { required: true })}>
                        <option>None</option>
                    </select>
                </div>


                <div className="flex justify-end">
                    <button type="submit">Save</button>
                </div>
            </form>
        </>
    );
}