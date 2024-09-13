import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { AddEntityForm } from "../AddEntityForm";
import type { Entity } from "../../lib/types";
import { EntityList } from "../editor/EntityList";

export type AdditionEntityDialogHandle = { show: () => void; close: () => void; }

export const AdditionEntityDialog = forwardRef<unknown, { onAdd: (entity: Entity) => void }>(({ onAdd }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<"ADD_NEW" | "ADD_EXISTING" | "SELECT">("SELECT");
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
        <dialog ref={dialogRef}>
            <header>
                <button type="button" onClick={() => dialogRef.current?.close()}>X</button>
            </header>
            {view === "SELECT" ? (
                <div>
                    <button type="button" onClick={() => setView("ADD_NEW")}>Add New</button>
                    <button type="button" onClick={() => setView("ADD_EXISTING")}>Add Existing</button>
                </div>
            ) : view === "ADD_EXISTING" ? (
                <div>
                    <EntityList onClick={(entity) => {
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