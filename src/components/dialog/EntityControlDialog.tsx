import { forwardRef, useEffect, useImperativeHandle, useReducer, useRef, useState } from "react";
import type { ReslovedEntity } from "../../lib/types";
import { emitUpdateEvent } from "../../lib/window";
import type { PuckSize } from "../../lib/display/utils";

type State = { update: null | string, initiative: number, z: number, puck: PuckSize, display: boolean };
const reducer = (state: State, ev: { type: string, value: string | number | boolean }) => ({ ...state, [ev.type]: ev.value, update: ev.type } as State);

export type EntityControlDialogHandle = { show: (id: string) => void, close: () => void }
type Props = {
    setQueue: React.Dispatch<React.SetStateAction<ReslovedEntity[]>>,
    queue: ReslovedEntity[]
};

export const EntityControlDialog = forwardRef<EntityControlDialogHandle, Props>(({ queue, setQueue }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<string | null>(null);
    const item = queue.find(e => e.instanceId === view);
    const id = item?.instanceId;
    const [state, dispatch] = useReducer(reducer, {
        initiative: item?.entity.initiative ?? 0,
        z: item?.z ?? 0,
        puck: item?.entity.puckSize ?? "small",
        display: item?.entity.displayOnMap ?? true,
        update: null
    });

    useEffect(() => {
        if (!state.update || !id) return;
        switch (state.update) {
            case "display": {
                emitUpdateEvent("display", { displayOnMap: state.display, target: id });
                setQueue(prev => {
                    const idx = prev.findIndex(e => e.instanceId === id);
                    if (idx === -1) return prev;
                    prev[idx].entity.displayOnMap = state.display;
                    return [...prev];
                });
                break;
            }
            case "puck": {
                emitUpdateEvent("set-puck", { target: id, size: state.puck });
                setQueue(prev => {
                    const idx = prev.findIndex(e => e.instanceId === id);
                    if (idx === -1) return prev;
                    prev[idx].entity.puckSize = state.puck
                    return [...prev];
                });
                break;
            }
            case "z": {
                emitUpdateEvent("set-z", { target: id, z: state.z });
                setQueue(prev => {
                    const idx = prev.findIndex(e => e.instanceId === id);
                    if (idx === -1) return prev;
                    prev[idx].z = state.z;
                    return [...prev];
                });
                break;
            }
            case "initiative": {
                setQueue(prev => {
                    const idx = prev.findIndex(e => e.instanceId === id);
                    if (idx === -1) return prev;
                    prev[idx].entity.initiative = state.initiative;
                    return [...prev];
                });
                break;
            }
            default:
                break;
        }
    }, [state, id, setQueue])

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

            <div>
                <label htmlFor="initiative">Initiative</label>
                <input id="initiative" value={state.initiative} onChange={(ev) => {
                    dispatch({ type: "initiative", value: ev.target.valueAsNumber });
                }} required name="initiative" type="number" placeholder="Initiative" />
            </div>

            <div>
                <label htmlFor="Z-Index">Z-Index</label>
                <input id="z-Index" value={state.z} onChange={(ev) => {
                    dispatch({ type: "z", value: ev.target.valueAsNumber })
                }} required name="z-index" type="number" placeholder="Initiative" />
            </div>

            <div>
                <label htmlFor="pucksize">Puck Size</label>
                <select id="pucksize" value={state.puck} onChange={(ev) => dispatch({ type: "puck", value: ev.target.value })}>
                    <option value="small" selected>Small</option>
                    <option value="mid">Medium</option>
                    <option value="large">Large</option>
                </select>
            </div>

            <form className='flex flex-col gap-4' onSubmit={async (ev) => {
                ev.preventDefault();
                if (!item) return;
                const data = new FormData(ev.currentTarget);
                const x = Number.parseInt(data.get("x")?.toString() ?? "0");
                const y = Number.parseInt(data.get("y")?.toString() ?? "0");

                await emitUpdateEvent("move", { target: item.instanceId, x, y })

                setQueue(prev => {
                    const idx = prev.findIndex(e => e.instanceId === item?.instanceId);
                    if (idx === -1) return prev;
                    prev[idx].x = x;
                    prev[idx].y = y;
                    return [...prev];
                });
            }}>
                <h1>Movement</h1>

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

            {!item?.entity.isPlayerControlled ? (<form className="border p-2" onSubmit={async (e) => {
                e.preventDefault();
                if (!item) return;
                const data = new FormData(e.currentTarget);
                const amount = Number.parseInt(data.get("health_mod")?.toString() ?? "0");
                const type = data.get("health_type");

                switch (type) {
                    case "heal": {
                        const health = Math.min(item.entity.health + amount, item.entity.maxHealth);
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
                        const health = Math.max(0, item.entity.health + l);

                        if (health <= 0) {
                            await emitUpdateEvent("display", { target: item.instanceId, displayOnMap: true })
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
                            prev[idx].entity.tempHealth = amount;
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
                    <input type="checkbox" checked={state.display} onChange={async (ev) => dispatch({ type: "display", value: ev.target.checked })} />
                </label>
                <p className="text-gray-400">(hides unit from board)</p>
            </div>

        </dialog>
    );
})