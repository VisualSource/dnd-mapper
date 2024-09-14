import { useForm, useFieldArray, type Control, type FieldValues } from 'react-hook-form';
import { emitTo } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { AdditionEntityDialog, type AdditionEntityDialogHandle } from "../dialog/AdditionEntityDialog";
import { EDITOR_MAP_EVENTS, EDITOR_MAP_WINDOW_LABEL } from "../../lib/consts";
import type { ResolvedStage, Stage } from "../../lib/types";
import { ImageSelect } from "../ImageSelect";

export const StageForm: React.FC<{ stage?: ResolvedStage, onSubmit: (stage: Stage) => void }> = ({ stage, onSubmit }) => {
    const dialogRef = useRef<AdditionEntityDialogHandle>(null);

    const { register, control, handleSubmit, watch } = useForm<ResolvedStage>({
        async defaultValues() {
            if (!stage) {
                return {
                    name: "",
                    background: {
                        image: "",
                        position: { x: 0, y: 0 },
                        autoCenter: true,
                        offset: { x: 0, y: 0 },
                        size: { w: 0, h: 0 },
                        rotation: 0
                    },
                    entities: [],
                    gridScale: 28,
                    id: crypto.randomUUID(),
                    nextStage: null,
                    prevStage: null,
                    stageGroup: null
                } as ResolvedStage;
            }
            return stage;
        },
    });
    const entityField = useFieldArray({
        control,
        name: "entities"
    });
    const backgoundAutoCenter = watch("background.autoCenter");

    useEffect(() => {
        const sub = watch((value, { type }) => {
            if (type === "valueChange") {
                emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Update, value);
            }
        });
        return () => sub.unsubscribe();
    }, [watch]);

    const onFormSubmit = async (state: ResolvedStage) => {
        await emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Update, state);
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
                    <input  {...register("gridScale", { required: true, valueAsNumber: true })} id="stage-grid-scale" type="number" />
                    <p className="text-sm">The size of the grid cells (Default 28px)</p>
                </div>

                <ImageSelect control={control as never as Control<FieldValues>} name="background.image" />

                <div>
                    <label htmlFor="background.autoCenter">Auto Center</label>
                    <input type="checkbox" id="background.autoCenter" {...register("background.autoCenter", {})} />
                </div>

                {!backgoundAutoCenter ? (<div className="flex flex-col">
                    <h2>Image Position</h2>
                    <div className="flex gap-2 w-full">
                        <div>
                            <label htmlFor="stage-backgroundPosition.x">X</label>
                            <input  {...register("background.position.x", { required: true, valueAsNumber: true })} id="stage-backgroundPosition.x" className="w-full" type="number" placeholder="X" />
                        </div>
                        <div>
                            <label htmlFor="stage-backgroundPosition.y">Y</label>
                            <input {...register("background.position.y", { required: true, valueAsNumber: true })} id="stage-backgroundPosition.y" className="w-full" type="number" placeholder="Y" />
                        </div>
                    </div>
                </div>) : null}

                <div className="flex flex-col">
                    <h2>Image Size</h2>
                    <div className="flex gap-2 w-full">
                        <div>
                            <label htmlFor="stage-backgroundSize.h">Width</label>
                            <input {...register("background.size.w", { required: true, valueAsNumber: true })} id="stage-backgroundSize.h" className="w-full" type="number" placeholder="W" />
                        </div>
                        <div>
                            <label htmlFor="stage-backgroundSize.w">Height</label>
                            <input {...register("background.size.h", { required: true, valueAsNumber: true })} id="stage-backgroundSize.w" className="w-full" type="number" placeholder="H" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h2>Image Offset</h2>
                    <div className="flex gap-2 w-full">
                        <div>
                            <label htmlFor="background.offset.x">X</label>
                            <input  {...register("background.offset.x", { required: true, valueAsNumber: true })} id="background.offset.x" className="w-full" type="number" placeholder="X" />
                        </div>
                        <div>
                            <label htmlFor="background.offset.y">Y</label>
                            <input {...register("background.offset.y", { required: true, valueAsNumber: true })} id="background.offset.y" className="w-full" type="number" placeholder="Y" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="background.rotation">Image Rotation</label>
                    <input {...register("background.rotation", { required: true, valueAsNumber: true })} id="background.rotation" className="w-full" type="number" placeholder="360" />
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
                                    <input {...register(`entities.${index}.x`, { valueAsNumber: true })} type="number" placeholder="x" />
                                    <input {...register(`entities.${index}.y`, { valueAsNumber: true })} type="number" placeholder="y" />
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