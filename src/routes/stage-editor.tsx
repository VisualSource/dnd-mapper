import {
	StageGroupDialog,
	type StageGroupDialogHandle,
} from "@/components/dialog/StageGroupDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Link,
	Outlet,
	createFileRoute,
	useMatchRoute,
	useNavigate,
} from "@tanstack/react-router";
import { confirm } from "@tauri-apps/plugin-dialog";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { StageGroupSelect } from "../components/editor/StageGroupSelect";
import { StageList } from "../components/editor/StageList";
import { db } from "../lib/db";
import { editorWindow, toggleEditorWindow } from "../lib/window";

const CreateStagePage: React.FC = () => {
	const sgDialog = useRef<StageGroupDialogHandle>(null);
	const matchRoute = useMatchRoute();
	const naviagte = useNavigate();
	const isEditing = matchRoute({ to: "/stage-editor/$id" });
	const [group, setGroup] = useState<string>();
	const [search, setSearch] = useState<string>();
	const [query] = useDebounce(search, 1000);

	return (
		<div className="flex w-full">
			<StageGroupDialog ref={sgDialog} />
			<main className="overflow-hidden w-7/12 flex flex-col border-r">
				<header className="flex justify-between p-2">
					<Link
						to="/"
						className={buttonVariants({ variant: "ghost", size: "sm" })}
					>
						Back
					</Link>

					<div className="flex gap-2">
						<Button
							type="button"
							size="sm"
							variant="ghost"
							onClick={() => sgDialog.current?.show()}
						>
							Add Stage Group
						</Button>
						<Button
							type="button"
							size="sm"
							variant="secondary"
							onClick={toggleEditorWindow}
						>
							Show Board
						</Button>

						{isEditing && isEditing.id !== "new" ? (
							<Button
								variant="destructive"
								size="sm"
								type="button"
								onClick={async () => {
									const confirmed = await confirm("Are you sure?", {
										title: "Delete Stage",
										kind: "warning",
									});
									if (!confirmed) return;
									await db.stage.delete(isEditing.id);
									naviagte({ to: "/stage-editor" });
								}}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						) : null}
					</div>
				</header>
				<Outlet />
			</main>
			<aside className="flex flex-col overflow-hidden w-5/12 p-2">
				<header className="flex w-full pb-2 gap-1">
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search"
						type="search"
					/>
					<StageGroupSelect onSelect={setGroup} value={group} />
					<Link
						to="/stage-editor/new"
						className={buttonVariants({ variant: "secondary" })}
					>
						New
					</Link>
				</header>
				<Separator className="mb-2" />
				<StageList
					deletable
					group={group}
					filter={query}
					onClick={(stage) =>
						naviagte({ to: "/stage-editor/$id", params: { id: stage.id } })
					}
				/>
			</aside>
		</div>
	);
};

export const Route = createFileRoute("/stage-editor")({
	component: CreateStagePage,
	onLeave() {
		editorWindow.hide();
	},
});
