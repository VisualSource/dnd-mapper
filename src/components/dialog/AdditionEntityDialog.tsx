import { ArrowLeft, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import type { Entity } from "../../lib/types";
import { AddEntityForm } from "../AddEntityForm";
import { EntityList } from "../editor/EntityList";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export type AdditionEntityDialogHandle = {
	show: () => void;
	close: () => void;
};

export const AdditionEntityDialog = forwardRef<
	unknown,
	{ onAdd: (entity: Entity) => void }
>(({ onAdd }, ref) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [view, setView] = useState<"ADD_NEW" | "ADD_EXISTING" | "SELECT">(
		"SELECT",
	);
	const [search, setSearch] = useState("");
	const [filter] = useDebounce(search, 1000);
	useImperativeHandle(
		ref,
		() => {
			return {
				show() {
					setView("SELECT");
					dialogRef.current?.showModal();
				},
				close() {
					dialogRef.current?.close();
				},
			};
		},
		[],
	);

	return (
		<dialog
			ref={dialogRef}
			className="bg-background text-foreground backdrop:opacity-70 backdrop:bg-gray-600 shadow-md w-96"
		>
			<header className="flex flex-col border-b p-1 sticky top-0 bg-background">
				<div className="flex justify-between items-center mb-2">
					<h1 className="font-semibold ml-2">Add Entity</h1>
					<div className="flex gap-2">
						{view !== "SELECT" ? (
							<Button
								variant="ghost"
								size="icon"
								type="button"
								onClick={() => setView("SELECT")}
							>
								<ArrowLeft className="h-5 w-5" />
							</Button>
						) : null}
						<Button
							variant="destructive"
							size="icon"
							type="button"
							onClick={() => dialogRef.current?.close()}
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</div>
				{view === "ADD_EXISTING" ? (
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="search"
						placeholder="Search"
					/>
				) : null}
			</header>
			{view === "SELECT" ? (
				<div className="flex gap-2 p-2 w-full">
					<Button
						className="w-full"
						type="button"
						onClick={() => setView("ADD_NEW")}
					>
						Add New
					</Button>
					<Button
						className="w-full"
						type="button"
						onClick={() => setView("ADD_EXISTING")}
					>
						Add Existing
					</Button>
				</div>
			) : view === "ADD_EXISTING" ? (
				<div className="max-h-72">
					<EntityList
						filter={filter}
						onClick={(entity) => {
							onAdd(entity);
							dialogRef.current?.close();
						}}
					/>
				</div>
			) : (
				<AddEntityForm
					onSubmit={(entity) => {
						onAdd(entity);
						dialogRef.current?.close();
					}}
				/>
			)}
		</dialog>
	);
});
