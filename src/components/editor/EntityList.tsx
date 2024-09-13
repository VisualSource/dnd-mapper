import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import type { Entity } from "../../lib/types";
import { confirm } from "@tauri-apps/plugin-dialog";

export const EntityList: React.FC<{ deletable?: boolean, filter?: string, onClick: (entity: Entity) => void }> = ({ onClick, filter, deletable }) => {
    const data = useLiveQuery(() => {
        if (!filter) {
            return db.entity.toArray();
        }
        return db.entity.where("name").startsWith(filter).toArray()
    }, [filter], [])

    if (data === undefined) {
        return (<div className='w-full h-full flex justify-center items-center'>Loading Entitites</div>);
    }

    return (
        <ul className='p-2 space-y-2 overflow-y-scroll h-full' onClick={(ev) => {
            const item = (ev.nativeEvent.target as HTMLElement).closest("li[data-id]");
            if (!item) return;
            const id = item.getAttribute("data-id");
            if (!id) return;
            const content = data.find(e => e.id === id);
            if (!content) return;
            onClick(content);
        }} onKeyUp={() => { }} onKeyDown={() => { }}>
            {data.length > 0 ? data.map(e => (
                <li key={e.id} className='flex w-full bg-gray-700 shadow' data-id={e.id}>
                    <button type="button" className='flex gap-2 w-full p-2'>
                        <div className="h-12 w-12 relative">
                            <img src={e.image} alt={e.name} className="h-full w-full object-cover" />
                        </div>
                        <div className='flex flex-col'>
                            <h1 className="text-left">{e.name}</h1>
                            <p className="text-sm">Initiative: {e.initiative}</p>
                        </div>
                    </button>
                    {deletable ? (
                        <button type="button" onClick={async () => {
                            const confirmed = await confirm("Are you sure?", { title: "Delete Entity", kind: "warning" });
                            if (!confirmed) return;
                            await db.entity.delete(e.id);
                        }}>
                            Del
                        </button>
                    ) : null}
                </li>
            )) : (
                <li>
                    No Entities
                </li>
            )}
        </ul>
    );
}