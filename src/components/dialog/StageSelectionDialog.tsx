import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { StageGroupSelect } from "../editor/StageGroupSelect";
import { StageList } from "../editor/StageList";

export type StageSelectionDialogHandle = { show: () => void, close: () => void };

export const StageSelectionDialog = forwardRef<StageSelectionDialogHandle, { onSelect: (id: string) => void }>(({ onSelect }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [search, setSearch] = useState<string>();
    const [group, setGroup] = useState<string>();
    const [query] = useDebounce(search, 1000);
    useImperativeHandle(ref, () => {
        return {
            show() {
                dialogRef.current?.showModal();
            },
            close() {
                dialogRef.current?.close();
            },
        }
    }, [])

    return (
        <dialog ref={dialogRef}>
            <header>
                <button type="button" onClick={() => dialogRef.current?.close()}>X</button>
            </header>
            <div>
                <input placeholder="search" type="search" value={search} onChange={(ev) => setSearch(ev.target.value)} />
                <StageGroupSelect onSelect={(value) => setGroup(value)} value={group} />
            </div>
            <StageList onClick={(stage) => onSelect(stage.id)} filter={query} group={group} />
        </dialog>
    );
});