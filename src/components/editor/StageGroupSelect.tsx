import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";

import { ComboBox } from "../ui/combobox";

export const StageGroupSelect: React.FC<{
	container?: Element | null | undefined;
	onSelect: (value: string) => void;
	value?: string;
}> = ({ container, value, onSelect }) => {
	const groups = useLiveQuery(
		() =>
			db.groups
				.toArray()
				.then((e) => e.map((d) => ({ id: d.id.toString(), value: d.name }))),
		[],
	);

	return (
		<ComboBox
			name="group"
			container={container}
			options={groups}
			defaultValue={value}
			onSelect={(e) => onSelect(e)}
		/>
	);
};
