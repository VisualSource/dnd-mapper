import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { StageGroupSelect } from "../editor/StageGroupSelect";
import { StageList } from "../editor/StageList";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Input } from "../ui/input";

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
        <dialog ref={dialogRef} className="bg-background text-foreground backdrop:opacity-70 backdrop:bg-gray-600 shadow-md">
            <header className="flex border-b p-1 justify-between items-center sticky top-0 bg-background">
                <h1 className="font-semibold ml-2">Select Stage</h1>
                <Button variant="ghost" size="sm" type="button" onClick={() => dialogRef.current?.close()}><X className="h-5 w-5" /></Button>
            </header>
            <div className="flex gap-2 p-2">
                <Input placeholder="Search" type="search" value={search} onChange={(ev) => setSearch(ev.target.value)} />
                <StageGroupSelect container={dialogRef.current} onSelect={(value) => setGroup(value)} value={group} />
            </div>
            <div className="max-h-56">
                <StageList onClick={(stage) => onSelect(stage.id)} filter={query} group={group} />
            </div>
        </dialog>
    );
});