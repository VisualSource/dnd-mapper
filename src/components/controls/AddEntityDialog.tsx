import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { AddEntityForm } from "./AddEntityForm";
import type { Entity } from "../../lib/types";

const ContentDisplay: React.FC<{
    onClose: (item: Entity[]) => void,
    page: "add-type" | "add-entity" | "add-existing",
    setPage: (page: "add-type" | "add-entity" | "add-existing") => void
}> = ({ page, setPage, onClose }) => {
    const [items, setItems] = useState<Entity[]>([]);

    if (page === "add-type") {
        return (
            <div>
                <button type="button" onClick={() => setPage("add-entity")}>Add New</button>
                <button type="button" onClick={() => setPage("add-existing")}>Add Existing</button>
            </div>
        );
    }

    if (page === "add-entity") {
        return (
            <div>
                <button type="button" onClick={() => setPage("add-type")}>Back</button>

                <AddEntityForm onSubmit={(ev) => {
                    ev.preventDefault();
                    const data = new FormData(ev.currentTarget);
                    const name = data.get("name")?.toString() ?? "";
                    const image = data.get("image")?.toString() ?? "";
                    const initiative = Number.parseInt(data.get("initiative")?.toString() ?? "0");
                    const isPlayerControlled = data.get("isPlayerControlled")?.toString() === "on";
                    const health = Number.parseInt(data.get("health")?.toString() ?? "0");
                    const maxHealth = Number.parseInt(data.get("maxHealth")?.toString() ?? "0");

                    ev.currentTarget.reset();

                    setItems((prev) => {
                        return [...prev, { id: crypto.randomUUID(), name, image, initiative, isPlayerControlled, health, maxHealth, tempHealth: 0 }];
                    });

                }} />

                <hr />
                <ul>
                    {items.map(e => (
                        <li key={e.id}>
                            <div>
                                Name: {e.name}
                                Initiative: {e.initiative}
                                Health: {e.health}/{e.maxHealth} + {e.tempHealth}
                                PlayerControlled: {e.isPlayerControlled ? "YES" : "NO"}
                                Image: {e.image}
                            </div>

                            <button type="button">Remove</button>
                        </li>
                    ))}
                </ul>


                <button type="button" onClick={() => {
                    onClose(items);
                    setItems([]);
                }}>Ok</button>
            </div>
        );
    }

    return (
        <div>
            <button type="button" onClick={() => setPage("add-type")}>Back</button>

            <hr />
            <ul>
                <li>

                </li>
            </ul>


            <button type="button" onClick={() => onClose(items)}>Ok</button>
        </div>
    );
}

export const AddEntityDialog = forwardRef<unknown, { onClose: (items: Entity[]) => void }>(({ onClose }, ref) => {
    const [action, setAction] = useState<"add-type" | "add-entity" | "add-existing">("add-type");
    const dialogRef = useRef<HTMLDialogElement>(null);
    useImperativeHandle(ref, () => {
        return {
            show() {
                setAction("add-type");
                dialogRef.current?.showModal();
            },
            hide() {
                dialogRef.current?.close();
            }
        }
    }, []);

    return (
        <dialog ref={dialogRef} id="add-entity-dialog">
            <div>
                <header>
                    <h1>Add Entities</h1>
                    <button type="button" onClick={() => dialogRef.current?.close()}>X</button>
                </header>
                <ContentDisplay onClose={onClose} page={action} setPage={setAction} />
            </div>
        </dialog>
    );
});