import type { ResolvedStage } from "@/lib/types";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { UseFieldArrayReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ComboBox } from "../ui/combobox";
import { useDebouncedCallback } from 'use-debounce';
import type { UUID } from "node:crypto";

export type InstanceEditorDialogHandle = {
    show: (index: number) => void;
};

export const InstanceEditorDialog = forwardRef<InstanceEditorDialogHandle, {
    entity: UseFieldArrayReturn<ResolvedStage, "entities", "id">,
    defaultLayer?: string
    layers: { id: string, value: string }[] | null | undefined
}>(({ entity, layers, defaultLayer }, ref) => {
    const [show, setShow] = useState<number>(0);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const setNameOverride = useDebouncedCallback<(value: string) => void>((ev) => {
        entity.update(show, { ...entity.fields[show], nameOverride: ev });
    }, 1000);

    useImperativeHandle(ref, () => {
        return {
            show(index: number) {
                setShow(index);
                dialogRef.current?.showModal();
            }
        }
    }, []);

    return (
        <dialog ref={dialogRef} className="bg-background text-foreground backdrop:opacity-70 backdrop:bg-gray-600 shadow-md w-96">
            <header className="flex flex-col border-b p-1 sticky top-0 bg-background">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="font-semibold ml-2">Edit Entity Instance</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            size="icon"
                            type="button"
                            onClick={() => {
                                dialogRef.current?.close()
                            }}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>
            <div className="flex flex-col gap-2 p-2 w-full">
                <div>
                    <Label>Override Name</Label>
                    <Input defaultValue={entity.fields[show]?.nameOverride} onChange={e => setNameOverride(e.target.value)} placeholder="Mickey" />
                </div>
                <div>
                    <Input value={entity.fields[show]?.x ?? 0} onChange={(e) => {
                        entity.update(show, { ...entity.fields[show], x: e.target.valueAsNumber });
                    }} type="number" />
                    <Input value={entity.fields[show]?.y ?? 0} onChange={(e) => {
                        entity.update(show, { ...entity.fields[show], y: e.target.valueAsNumber });
                    }} type="number" />
                    <Input value={entity.fields[show]?.z ?? 0} onChange={(e) => {
                        entity.update(show, { ...entity.fields[show], z: e.target.valueAsNumber });
                    }} type="number" />
                </div>
                {
                    layers === undefined ? (
                        <div>Loading Layers</div>
                    ) : layers === null ? (<div>No Layers avaiable</div>
                    ) : (
                        <ComboBox container={dialogRef.current} options={layers} name="layer" defaultValue={defaultLayer} onSelect={e => entity.update(show, { ...entity.fields[show], layer: (!e.length ? defaultLayer : e) as UUID })} />
                    )
                }
            </div>
        </dialog>
    );
});