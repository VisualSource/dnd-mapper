/*import {
	StageGroupDialog,
	type StageGroupDialogHandle,
} from "@/components/dialog/StageGroupDialog";*/
//import { Button, buttonVariants } from "@/components/ui/button";

import {
	//Link,
	Outlet,
	createFileRoute,
	//useMatchRoute,
	//useNavigate,
} from "@tanstack/react-router";
//import { confirm } from "@tauri-apps/plugin-dialog";
//import { Trash2 } from "lucide-react";
//import { useRef } from "react";

//import { db } from "../lib/db";
import { editorWindow, /*toggleEditorWindow*/ } from "../lib/window";

export const Route = createFileRoute("/stage-editor")({
	component: () => <Outlet />,
	onLeave() {
		editorWindow.hide();
	},
});

/*
<div className="flex w-full">
			<StageGroupDialog ref={sgDialog} />
			<main className="overflow-hidden flex flex-col border-r">
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
			
			</main>

		</div>

*/
