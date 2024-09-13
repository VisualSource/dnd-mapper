import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";

export const StageGroupSelect: React.FC<{ onSelect: (value: string) => void, value?: string }> = ({ value, onSelect }) => {
    const groups = useLiveQuery(() => db.groups.toArray(), []);

    return (
        <select onSelect={(ev) => onSelect(ev.currentTarget.value)} value={value}>
            <option value="">All</option>
            {groups?.map(e => (
                <option value={e.name} key={e.id}>
                    {e.name}
                </option>
            ))}
        </select>
    );
}