import { FileQuestion, Trash2 } from "lucide-react";
import { confirm } from "@tauri-apps/plugin-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Entity } from "../../lib/types";
import { Button } from "../ui/button";
import { db } from "../../lib/db";

export const EntityList: React.FC<{ deletable?: boolean, filter?: string, onClick: (entity: Entity) => void }> = ({ onClick, filter, deletable }) => {
    const data = useLiveQuery(() => {
        if (!filter) return db.entity.toArray();
        return db.entity.where("name").startsWithIgnoreCase(filter).toArray()
    }, [filter], [])

    if (data === undefined) {
        return (<div className='w-full h-full flex justify-center items-center'>Loading Entitites</div>);
    }

    return (
        <ul className='p-2 space-y-2 overflow-y-scroll h-full' onClick={(ev) => {
            const item = (ev.nativeEvent.target as HTMLElement);
            if (!item) return;
            const isBtn = item.getAttribute("data-no-load") !== null;
            if (isBtn) return;
            const target = item.closest("li[data-id]");
            if (!target) return;
            const id = target.getAttribute("data-id");
            if (!id) return;
            const content = data.find(e => e.id === id);
            if (!content) return;
            onClick(content);
        }} onKeyUp={() => { }} onKeyDown={() => { }}>
            {data.length > 0 ? data.map(e => (
                <li key={e.id} className='flex w-ful shadow bg-card border rounded-lg text-card-foreground' data-id={e.id}>
                    <button type="button" className='flex gap-2 w-full p-2 items-center'>
                        <Avatar>
                            <AvatarImage src={e.image} alt={e.name} />
                            <AvatarFallback>
                                <FileQuestion />
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <h1 className="text-left">{e.name}</h1>
                            <p className="text-sm text-muted-foreground">Initiative: {e.initiative}</p>
                        </div>
                    </button>
                    {deletable ? (
                        <div className="flex flex-col justify-center mr-2">
                            <Button variant="destructive" data-no-load size="sm" type="button" onClick={async () => {
                                const confirmed = await confirm("Are you sure?", { title: "Delete Entity", kind: "warning" });
                                if (!confirmed) return;
                                await db.entity.delete(e.id);
                            }}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : null}
                </li>
            )) : (
                <li className="w-full text-center p-2">
                    No Entities
                </li>
            )}
        </ul>
    );
}