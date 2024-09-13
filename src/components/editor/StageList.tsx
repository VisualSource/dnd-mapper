import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";

export const StageList: React.FC<{ filter?: string, group?: string }> = ({ filter, group }) => {
    const stages = useLiveQuery(() => {
        if (filter && group) {
            return db.stage.where("name").startsWith(filter).and(e => e.stageGroup === group).toArray();
        }
        if (filter && !group) return db.stage.where("name").startsWith(filter).toArray();
        if (!filter && group) return db.stage.where("stageGroup").equals(group).toArray();
        return db.stage.toArray();
    }, [group, filter], []);

    if (!stages) {
        return (
            <div>Loading Stages</div>
        );
    }

    return (
        <ul>
            {stages.map(e => (
                <li key={e.id}>
                    <button type="button">
                        <div className="h-12 w-12 relative">
                            <img className="h-full w-full object-cover" alt="background" src={e.backgroundImage} />
                        </div>
                        <div>
                            <h1>{e.name}</h1>
                            <p>{e.stageGroup}</p>
                        </div>
                    </button>
                </li>
            ))}
        </ul>
    );
}