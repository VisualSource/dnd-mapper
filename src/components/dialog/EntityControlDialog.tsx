import { forwardRef, useEffect, useImperativeHandle, useReducer, useRef } from "react";
import type { ReslovedEntity } from "../../lib/types";
import { emitUpdateEvent } from "../../lib/window";
import type { PuckSize } from "../../lib/display/utils";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";

type State = { update: null | string, initiative: number, z: number, puck: PuckSize, display: boolean, id: string };
const reducer = (state: State, ev: { type: string, value: string | number | boolean | { id: string, initiative: number, z: number, puck: PuckSize, display: boolean } }) => {
    if (ev.type === "reset") {
        return { update: null, ...ev.value as { initiative: number, z: number, puck: PuckSize, display: boolean } } as State;
    }
    return ({ ...state, [ev.type]: ev.value, update: ev.type } as State)
};

export type EntityControlDialogHandle = { show: (id: ReslovedEntity) => void, close: () => void }
type Props = {
    setQueue: React.Dispatch<React.SetStateAction<ReslovedEntity[]>>,
    queue: ReslovedEntity[]
};

export const EntityControlDialog = forwardRef<EntityControlDialogHandle, Props>(({ queue, setQueue }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [state, dispatch] = useReducer(reducer, {
        id: "",
        initiative: 0,
        z: 0,
        puck: "small",
        display: true,
        update: null
    });
    const id = state.id;
    const item = queue.find(e => e.instanceId === id);

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
            show(target) {
                dispatch({
                    type: "reset", value: {
                        id: target.instanceId,
                        initiative: target.entity.initiative ?? 0,
                        z: target?.z ?? 0,
                        puck: target?.entity.puckSize ?? "small",
                        display: target?.entity.displayOnMap ?? true,
                    }
                });
                dialogRef.current?.showModal();
            },
            close() {
                dialogRef.current?.close();
                dispatch({
                    type: "reset", value: {
                        id: "",
                        initiative: 0,
                        z: 0,
                        puck: "small",
                        display: true,
                    }
                });
            },
        }
    }, []);

    return (
        <dialog ref={dialogRef} className="bg-background text-foreground backdrop:opacity-70 backdrop:bg-gray-600">
            <header className="flex border-b p-1 justify-between items-center sticky top-0 bg-background">
                <h1 className="font-semibold ml-2">Entity Control</h1>
                <Button variant="ghost" size="sm" type="button" onClick={() => dialogRef.current?.close()}><X className="h-5 w-5" /></Button>
            </header>

            <div className="flex flex-col gap-2 px-2">
                <div>
                    <Label>Initiative</Label>
                    <Input id="initiative" value={state.initiative} onChange={(ev) => {
                        dispatch({ type: "initiative", value: ev.target.valueAsNumber });
                    }} required name="initiative" type="number" placeholder="Initiative" />
                </div>

                <div>
                    <Label>Z Index</Label>
                    <Input id="z-Index" value={state.z} onChange={(ev) => {
                        dispatch({ type: "z", value: ev.target.valueAsNumber })
                    }} required name="z-index" type="number" placeholder="Initiative" />
                </div>

                <div className="flex flex-col">
                    <Label>Puck Size</Label>
                    <select className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1" onChange={(ev) => dispatch({ type: "puck", value: ev.target.value })} defaultValue={state.puck}>
                        <option value="small">Small (1 cell)</option>
                        <option value="mid">Medium (4 cells)</option>
                        <option value="large">Large (9 cells)</option>
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
                    <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Movement</h1>

                    <div className='flex gap-2'>
                        <div>
                            <Label>X</Label>
                            <Input defaultValue={item?.x} placeholder='x' type="number" name="x" />
                        </div>
                        <div>
                            <Label>Y</Label>
                            <Input defaultValue={item?.y} placeholder='y' type="number" name="y" />
                        </div>
                    </div>

                    <Button type="submit" variant="secondary" size="sm">Move</Button>
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
                        <h1>HP: <span className={cn({ "text-blue-400": (item?.entity.tempHealth ?? 0) > 0 })}>{(item?.entity.health ?? 0) + (item?.entity.tempHealth ?? 0)}</span>/{item?.entity.maxHealth ?? 0}</h1>
                    </div>
                    <div className='flex gap-2 justify-center'>
                        <RadioGroup name="health_type" className="flex flex-row p-2">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="damage" />
                                <Label>Damage</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="heal" />
                                <Label>Heal</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="temp" />
                                <Label>Temp</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='flex flex-col items-center gap-2'>
                        <Input name="health_mod" placeholder='amount' type="number" />
                        <Button className="w-full" type="submit" variant="secondary" size="sm">Apply</Button>
                    </div>
                </form>) : null}


                <div className="flex flex-row items-center justify-between border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Display On Map</Label>
                        <p>
                            Hides unit from board
                        </p>
                    </div>
                    <Switch checked={state.display} onCheckedChange={e => dispatch({ type: "display", value: e })} />
                </div>
            </div>

        </dialog>
    );
})