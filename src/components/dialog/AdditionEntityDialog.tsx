import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { AddEntityForm } from "../AddEntityForm";
import type { Entity } from "../../lib/types";
import { EntityList } from "../editor/EntityList";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDebounce } from "use-debounce";

export type AdditionEntityDialogHandle = { show: () => void; close: () => void; }

export const AdditionEntityDialog = forwardRef<unknown, { onAdd: (entity: Entity) => void }>(({ onAdd }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<"ADD_NEW" | "ADD_EXISTING" | "SELECT">("SELECT");
    const [search, setSearch] = useState("");
    const [filter] = useDebounce(search, 1000);
    useImperativeHandle(ref, () => {
        return {
            show() {
                setView("SELECT");
                dialogRef.current?.showModal();
            },
            close() {
                dialogRef.current?.close();
            }
        }
    }, []);

    return (
        <dialog ref={dialogRef} className="bg-background text-foreground backdrop:opacity-70 backdrop:bg-gray-600 shadow-md">
            <header className="flex flex-col border-b p-1 sticky top-0 bg-background">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="font-semibold ml-2">Add Entity</h1>
                    <Button variant="ghost" size="sm" type="button" onClick={() => dialogRef.current?.close()}><X className="h-5 w-5" /></Button>
                </div>
                {view === "ADD_EXISTING" ? (
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder="Search" />
                ) : null}
            </header>
            {view === "SELECT" ? (
                <div className="flex gap-2 p-2">
                    <Button type="button" onClick={() => setView("ADD_NEW")}>Add New</Button>
                    <Button type="button" onClick={() => setView("ADD_EXISTING")}>Add Existing</Button>
                </div>
            ) : view === "ADD_EXISTING" ? (
                <div className="max-h-72">
                    <EntityList filter={filter} onClick={(entity) => {
                        onAdd(entity);
                        dialogRef.current?.close();
                    }} />
                </div>
            ) : (
                <AddEntityForm onSubmit={(entity) => {
                    onAdd(entity);
                    dialogRef.current?.close();
                }} />
            )}
        </dialog>
    );
});