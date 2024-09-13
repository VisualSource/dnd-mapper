import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import type { Stage } from "../../lib/types";
import { confirm } from "@tauri-apps/plugin-dialog";

export const StageList: React.FC<{ deletable?: boolean, filter?: string, group?: string, onClick: (stage: Stage) => void }> = ({ deletable, filter, group, onClick }) => {
    const stages = useLiveQuery(() => {
        if (filter && group) {
            return db.stage.where("name").startsWithIgnoreCase(filter).and(e => e.stageGroup === group).toArray();
        }
        if (filter && !group) return db.stage.where("name").startsWithIgnoreCase(filter).toArray();
        if (!filter && group) return db.stage.where("stageGroup").equals(group).toArray();
        return db.stage.toArray();
    }, [group, filter], []);

    if (!stages) {
        return (
            <div>Loading Stages</div>
        );
    }

    return (
        <ul onClick={(ev) => {
            const target = (ev.nativeEvent.target as HTMLElement).closest("li[data-id]");
            if (!target) return;
            const id = target.getAttribute("data-id");
            if (!id) return;
            const item = stages.find(e => e.id === id);
            if (!item) return;
            onClick(item);
        }} onKeyUp={() => { }} onKeyDown={() => { }}>
            {stages.map(e => (
                <li key={e.id} data-id={e.id}>
                    <button type="button">
                        <div className="h-12 w-12 relative">
                            <img className="h-full w-full object-cover" alt="background" src={e.backgroundImage} />
                        </div>
                        <div>
                            <h1>{e.name}</h1>
                            <p>{e.stageGroup}</p>
                        </div>
                    </button>
                    {deletable ? (
                        <button type="button" onClick={async () => {
                            const confirmed = await confirm("Are you sure?", { title: "Delete Stage?", kind: "warning" });
                            if (!confirmed) return;
                            await db.stage.delete(e.id);
                        }}>Del</button>
                    ) : null}
                </li>
            ))}
        </ul>
    );
}