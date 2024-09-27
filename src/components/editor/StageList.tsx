import { confirm } from "@tauri-apps/plugin-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { FileQuestion, Trash2 } from "lucide-react";
import { db } from "../../lib/db";
import type { Stage } from "../../lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export const StageList: React.FC<{
	deletable?: boolean;
	filter?: string;
	group?: string;
	onClick: (stage: Stage) => void;
}> = ({ deletable, filter, group, onClick }) => {
	const stages = useLiveQuery(
		() => {
			if (filter && group) {
				return db.stage
					.where("name")
					.startsWithIgnoreCase(filter)
					.and((e) => e.stageGroup === group)
					.toArray();
			}
			if (filter && !group)
				return db.stage.where("name").startsWithIgnoreCase(filter).toArray();
			if (!filter && group)
				return db.stage.where("stageGroup").equals(group).toArray();
			return db.stage.toArray();
		},
		[group, filter],
		[],
	);

	if (!stages) {
		return <div className="h-full w-full text-center">Loading Stages</div>;
	}

	return (
		<ul className="space-y-2"
			onClick={(ev) => {
				const el = ev.nativeEvent.target as HTMLElement;
				if (!el) return;
				const target = el.closest("li[data-id]");
				if (!target) return;

				const id = target.getAttribute("data-id");
				if (!id) return;
				const item = stages.find((e) => e.id === id);
				if (!item) return;
				onClick(item);
			}}
			onKeyUp={() => { }}
			onKeyDown={() => { }}
		>
			{stages.map((e) => (
				<li
					key={e.id}
					data-id={e.id}
					className="flex w-full p-2 shadow bg-card border rounded-lg text-card-foreground"
				>
					<button type="button" className="flex gap-2 w-full">

						<div>
							<h1>{e.name}</h1>
							<p className="text-sm text-muted-foreground text-left">
								Group: {e.stageGroup}
							</p>
						</div>
					</button>
					{deletable ? (
						<div className="flex flex-col justify-center">
							<Button
								variant="destructive"
								size="sm"
								type="button"
								onClick={async (ev) => {
									ev.preventDefault();
									ev.stopPropagation();
									const confirmed = await confirm("Are you sure?", {
										title: "Delete Stage?",
										kind: "warning",
									});
									if (!confirmed) return;
									await db.stage.delete(e.id);
								}}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					) : null}
				</li>
			))}
		</ul>
	);
};
