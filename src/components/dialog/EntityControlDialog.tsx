import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { ResolvedStage } from "../../lib/types";
import { emitTo } from "@tauri-apps/api/event";
import { DISPLAY_MAP_EVENTS, MAP_WINDOW_LABEL } from "../../lib/consts";

export type EntityControlDialogHandle = { show: (id: string) => void, close: () => void }

export const EntityControlDialog = forwardRef<EntityControlDialogHandle, { setQueue: (callback: (prev: ResolvedStage["entities"]) => ResolvedStage["entities"]) => void, queue: ResolvedStage["entities"] }>(({ queue, setQueue }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<string | null>(null);

    const item = queue.find(e => e.instanceId === view);

    useImperativeHandle(ref, () => {
        return {
            show(id) {
                setView(id);
                dialogRef.current?.showModal();
            },
            close() {
                dialogRef.current?.close();
                setView(null);
            },
        }
    }, []);

    return (
        <dialog ref={dialogRef}>
            <header>
                <button type="button" onClick={() => dialogRef.current?.close()}>X</button>
            </header>

            <form className='flex flex-col gap-4' onSubmit={async (ev) => {
                ev.preventDefault();
                const data = new FormData(ev.currentTarget);
                const x = Number.parseInt(data.get("x")?.toString() ?? "0");
                const y = Number.parseInt(data.get("y")?.toString() ?? "0");
                const i = Number.parseInt(data.get("initiative")?.toString() ?? "0");

                await emitTo(MAP_WINDOW_LABEL, DISPLAY_MAP_EVENTS.Move, { target: item?.instanceId, x, y });

                setQueue(prev => {
                    const idx = prev.findIndex(e => e.instanceId === item?.instanceId);
                    if (idx === -1) return prev;
                    prev[idx].x = x;
                    prev[idx].y = y;
                    prev[idx].entity.initiative = i;
                    return [...prev];
                });
            }}>
                <h1>Movement</h1>

                <input defaultValue={item?.entity.initiative} required name="initiative" type="number" placeholder="Initiative" />

                <div className='flex'>
                    <label>
                        X: <input defaultValue={item?.x} placeholder='x' type="number" name="x" />
                    </label>
                    <label>
                        Y: <input defaultValue={item?.y} placeholder='y' type="number" name="y" />
                    </label>
                </div>

                <button type="submit">Move</button>
            </form>

            {!item?.entity.isPlayerControlled ? (<form className="border p-2" onSubmit={(e) => {
                e.preventDefault();
                if (!item) return;
                const data = new FormData(e.currentTarget);
                const amount = Number.parseInt(data.get("health_mod")?.toString() ?? "0");
                const type = data.get("health_type");

                switch (type) {
                    case "heal": {
                        const health = Math.max(item.entity.health + amount, item.entity.maxHealth);
                        setQueue(prev => {
                            const idx = prev.findIndex(e => e.instanceId === item?.instanceId);
                            if (idx === -1) return prev;
                            prev[idx].entity.health = health;
                            return [...prev];
                        });

                        break;
                    }
                    case "damage": {
                        const l = item.entity.tempHealth - amount;

                        if (l > 0) {
                            setQueue(prev => {
                                const idx = prev.findIndex(e => e.instanceId === item?.instanceId);
                                if (idx === -1) return prev;
                                prev[idx].entity.tempHealth = l;
                                return [...prev];
                            });
                            return;
                        }
                        const health = Math.max(0, item.entity.health - l);

                        if (health <= 0) {
                            emitTo(MAP_WINDOW_LABEL, DISPLAY_MAP_EVENTS.Update, { target: item.instanceId, displayOnMap: false });
                        }

                        setQueue(prev => {
                            const idx = prev.findIndex(e => e.instanceId === item?.instanceId);
                            if (idx === -1) return prev;
                            prev[idx].entity.tempHealth = 0;
                            prev[idx].entity.health = health;
                            prev[idx].entity.displayOnMap = health <= 0 ? false : prev[idx].entity.displayOnMap;
                            return [...prev];
                        });

                        break;
                    }
                    case "temp": {
                        setQueue(prev => {
                            const idx = prev.findIndex(e => e.instanceId === item?.instanceId);
                            if (idx === -1) return prev;
                            prev[idx].entity.tempHealth += amount;
                            return [...prev];
                        });
                        break;
                    }
                }
            }}>
                <div className='flex justify-center'>
                    <h1>HP: {(item?.entity.health ?? 0) + (item?.entity.tempHealth ?? 0)}/{item?.entity.maxHealth ?? 0}</h1>
                </div>
                <div className='flex gap-2 justify-center'>
                    <label className='flex items-center align-middle gap-1'>
                        <input type="radio" name="health_type" defaultValue="damage" />
                        Damage
                    </label>
                    <label className='flex items-center align-middle gap-1'>
                        <input type="radio" name="health_type" defaultValue="heal" />
                        Heal
                    </label>
                    <label className='flex items-center align-middle gap-1'>
                        <input type="radio" name="health_type" defaultValue="temp" />
                        Temp HP
                    </label>
                </div>

                <div className='flex flex-col items-center'>
                    <input name="health_mod" placeholder='amount' type="number" />
                    <button type="submit">Apply</button>
                </div>
            </form>) : null}

            <div>
                <label className='flex items-center align-middle gap-1'>
                    displayOnMap
                    <input type="checkbox" defaultChecked={item?.entity.displayOnMap} onChange={(ev) => {
                        if (!item) return;
                        emitTo(MAP_WINDOW_LABEL, DISPLAY_MAP_EVENTS.Update, { target: item.instanceId, displayOnMap: ev.currentTarget.checked });
                        setQueue(prev => {
                            const idx = prev.findIndex(e => e.instanceId === item?.instanceId);
                            if (idx === -1) return prev;
                            prev[idx].entity.displayOnMap = ev.currentTarget.checked;
                            return [...prev];
                        });

                    }} />
                </label>
                <p className="text-gray-400">(hides unit from board)</p>
            </div>

        </dialog>
    );
})