import { type Control, type FieldValues, useForm } from "react-hook-form";
import { ImageSelect } from "./ImageSelect";
import type { Entity } from "../lib/types";

export const AddEntityForm: React.FC<{ btnMsg?: string, resetOnSubmit?: boolean, onSubmit: (entity: Entity) => void, entity?: Entity }> = ({ onSubmit, entity, resetOnSubmit = true, btnMsg = "Ok" }) => {
    const { register, handleSubmit, watch, control } = useForm({
        defaultValues: entity ?? {
            id: crypto.randomUUID(),
            displayOnMap: true,
            isPlayerControlled: false,
            health: 100,
            maxHealth: 100,
            tempHealth: 0,
            image: "",
            initiative: 0,
            name: "",
        }
    });

    const isPlayerControlled = watch("isPlayerControlled")

    return (
        <form className="w-full p-2 overflow-y-scroll h-full" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
                <label htmlFor="entity-name">Name</label>
                <input id="entity-name" {...register("name", { required: true, maxLength: 256, minLength: 3 })} placeholder="Name" />
                <p className="text-sm">A display name for this entity</p>
            </div>
            <div className="flex flex-col gap-2">
                <ImageSelect name="image" control={control as never as Control<FieldValues>} />
                <p className="text-sm">A icon to display on the map</p>
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="entity-initiative">Initiative</label>
                <input id="entity-initiative" {...register("initiative", { required: true, valueAsNumber: true })} type="number" placeholder="Initiative" />
                <p className="text-sm">The order of who go first</p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <label htmlFor="entity-displayOnMap">displayOnMap</label>
                    <input id="entity-displayOnMap" {...register("displayOnMap")} type="checkbox" />
                </div>
                <p className="text-sm">This option will stop this enity from being shown on the map but will remain in the action queue.</p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <label htmlFor="entity-isPlayerControlled">isPlayerControlled</label>
                    <input id="entity-isPlayerControlled" type="checkbox" {...register("isPlayerControlled", {})} />
                </div>
                <p className="text-sm">Health values will be managed by players.</p>
            </div>
            {!isPlayerControlled ? (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="entity-health">Health</label>
                        <input id="entity-health" {...register("health", { min: 0, required: true, valueAsNumber: true })} type="number" placeholder="Health" />
                        <p className="text-sm">The current health of the entity</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="entity-max-health">Max Health</label>
                        <input id="entity-max-health" {...register("maxHealth", { required: true, min: 0, valueAsNumber: true })} type="number" placeholder="Max Health" />
                        <p className="text-sm">The max health of the entity</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="entity-temp-health">Temp Health</label>
                        <input id="entity-temp-health" {...register("tempHealth", { required: true, min: 0, valueAsNumber: true })} type="number" placeholder="Temp Health" />
                        <p className="text-sm">The temp health of the entity</p>
                    </div>
                </div>
            ) : null}

            <button type="submit">{btnMsg}</button>
        </form>
    );
}