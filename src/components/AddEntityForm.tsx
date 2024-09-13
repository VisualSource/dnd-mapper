import { useState } from "react";

import { ImageSelect } from "./ImageSelect";
import type { Entity } from "../lib/types";

export const AddEntityForm: React.FC<{ btnMsg?: string, resetOnSubmit?: boolean, onSubmit?: (entity: Entity) => void, entity?: Entity }> = ({ onSubmit, entity, resetOnSubmit = true, btnMsg = "Ok" }) => {
    const [show, setShow] = useState<boolean>(entity?.isPlayerControlled ?? false);

    return (
        <form className="w-full p-2 overflow-y-scroll h-full" onSubmit={(ev) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);
            const name = data.get("name")?.toString() ?? "Unnamed Entity";
            const image = data.get("image")?.toString() ?? "";
            const initiative = Number.parseInt(data.get("initiative")?.toString() ?? "0");
            const displayOnMap = data.get("displayOnMap")?.toString() === "on";
            const isPlayerControlled = data.get("isPlayerControlled")?.toString() === "on";
            const health = Number.parseInt(data.get("health")?.toString() ?? "0");
            const maxHealth = Number.parseInt(data.get("maxHealth")?.toString() ?? "0");
            const tempHealth = Number.parseInt(data.get("tempHealth")?.toString() ?? "0");

            if (resetOnSubmit) ev.currentTarget.reset();

            onSubmit?.call(undefined, { name, image, initiative, displayOnMap, isPlayerControlled, health, maxHealth, tempHealth, id: entity?.id ?? crypto.randomUUID() })
        }}>
            <div className="flex flex-col gap-2">
                <label>Name</label>
                <input required name="name" maxLength={255} minLength={3} placeholder="Name" defaultValue={entity?.name} />
                <p className="text-sm">A display name for this entity</p>
            </div>
            <div className="flex flex-col gap-2">
                <ImageSelect required defaultValue={entity?.image} name="image" />
                <p className="text-sm">A icon to display on the map</p>
            </div>
            <div className="flex flex-col gap-2">
                <label>Initiative</label>
                <input required name="initiative" type="number" placeholder="Initiative" defaultValue={entity?.initiative} />
                <p className="text-sm">The order of who go first</p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <label>displayOnMap</label>
                    <input name="displayOnMap" type="checkbox" defaultChecked={entity?.displayOnMap ?? true} />
                </div>
                <p className="text-sm">This option will stop this enity from being shown on the map but will remain in the action queue.</p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <label>isPlayerControlled</label>
                    <input onChange={(ev) => setShow(ev.currentTarget.checked)} checked={show} name="isPlayerControlled" type="checkbox" />
                </div>
                <p className="text-sm">Health values will be managed by players.</p>
            </div>
            {!show ? (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <label>Health</label>
                        <input required name="health" defaultValue={entity?.health} type="number" placeholder="Health" />
                        <p className="text-sm">The current health of the entity</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label>Max Health</label>
                        <input required name="maxHealth" defaultValue={entity?.maxHealth} type="number" placeholder="Max Health" />
                        <p className="text-sm">The max health of the entity</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label>Temp Health</label>
                        <input required name="tempHealth" defaultValue={entity?.tempHealth} type="number" placeholder="Temp Health" />
                        <p className="text-sm">The temp health of the entity</p>
                    </div>
                </div>
            ) : null}

            <button type="submit">{btnMsg}</button>
        </form>
    );
}