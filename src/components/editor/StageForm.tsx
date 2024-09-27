import { useFieldArray, useForm } from "react-hook-form";
import { FileQuestion, Trash2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { emitTo } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import {
	AdditionEntityDialog,
	type AdditionEntityDialogHandle,
} from "../dialog/AdditionEntityDialog";
import { EDITOR_MAP_EVENTS, EDITOR_MAP_WINDOW_LABEL } from "../../lib/consts";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { ResolvedStage, Stage } from "../../lib/types";

import { ComboBox } from "../ui/combobox";
import { Button } from "../ui/button";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { db } from "../../lib/db";
import { DSFileSelector } from "../DSFileSelector";
import { Separator } from "../ui/separator";

export const StageForm: React.FC<{
	stage?: ResolvedStage;
	onSubmit: (stage: Stage) => void;
}> = ({ stage, onSubmit }) => {
	const dialogRef = useRef<AdditionEntityDialogHandle>(null);
	const stages = useLiveQuery(
		() =>
			db.stage
				.filter((e) => e.id !== stage?.id)
				.toArray()
				.then((e) => e.map((e) => ({ value: e.name, id: e.id }))),
		[stage?.id],
	);
	const groupEditor = useLiveQuery(
		() =>
			db.groups
				.toArray()
				.then((e) => e.map((d) => ({ id: d.id.toString(), value: d.name }))),
		[],
	);
	const form = useForm<ResolvedStage>({
		async defaultValues() {
			if (!stage) {
				return {
					name: "",
					background: {
						image: "",
						position: { x: 0, y: 0 },
						autoCenter: true,
						offset: { x: 0, y: 0 },
						size: { w: 0, h: 0 },
						rotation: 0,
					},
					entities: [],
					gridScale: 28,
					id: crypto.randomUUID(),
					nextStage: null,
					prevStage: null,
					stageGroup: null,
				} as ResolvedStage;
			}
			return stage;
		},
	});
	const watch = form.watch;
	const entityField = useFieldArray({
		control: form.control,
		name: "entities",
	});

	useEffect(() => {
		const sub = watch((value, { type }) => {
			if (type === "valueChange") {
				emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Update, value);
			}
		});
		return () => sub.unsubscribe();
	}, [watch]);

	const onFormSubmit = async (state: ResolvedStage) => {
		await emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Update, state);
		const value: Stage = {
			...state,
			entities: state.entities.map(({ entity, ...rest }) => ({
				...rest,
				id: entity.id,
			})),
		};
		onSubmit(value);
	};

	return (
		<>
			<AdditionEntityDialog
				onAdd={(e) =>
					entityField.prepend({
						entity: e,
						instanceId: crypto.randomUUID(),
						x: 0,
						y: 0,
					})
				}
				ref={dialogRef}
			/>
			<Form {...form}>
				<form
					className="overflow-y-scroll p-2 gap-2 flex flex-col"
					onSubmit={form.handleSubmit(onFormSubmit)}
				>
					<FormField
						control={form.control}
						rules={{ required: { message: "A name is required", value: true } }}
						name="name"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="text"
										placeholder="Dungeon Section 1"
									/>
								</FormControl>
								<FormDescription>
									A friendly name for this stage
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField control={form.control} name="background.image" render={({ field }) => (
						<FormItem>
							<FormLabel>Dungeon Layout</FormLabel>
							<FormControl>
								<DSFileSelector value={field.value} onChange={field.onChange} />
							</FormControl>
							<FormDescription>
								The file the describes that layout of the dungeon using the dungeon scroll editor.
							</FormDescription>
						</FormItem>
					)} />


					<div className="flex flex-col border p-2">
						<h1 className="font-medium">Entities</h1>
						<p className="text-sm text-muted-foreground">
							All the enemy's and players that will be on the map
						</p>
						<Separator />
						<ul className="max-h-52 my-2 overflow-y-scroll px-2 space-y-2">
							{entityField.fields.map((e, index) => (
								<li key={e.instanceId} className="border rounded-sm p-2">
									<div className="flex gap-2 items-center">
										<Avatar>
											<AvatarFallback>
												<FileQuestion />
											</AvatarFallback>
											<AvatarImage src={e.entity.image} alt={e.entity.name} />
										</Avatar>
										<div className="flex justify-between w-full">
											<h1>{e.entity.name}</h1>

											<Button
												variant="destructive"
												size="icon"
												type="button"
												onClick={() => entityField.remove(index)}
											>
												<Trash2 />
											</Button>
										</div>
									</div>
									<div className="flex flex-col gap-2 my-2">
										<Label>Name Override</Label>
										<Input
											{...form.register(`entities.${index}.nameOverride`)}
										/>
									</div>
									<div className="flex gap-2 w-full">
										<div className="flex flex-col gap-2">
											<Label>X</Label>
											<Input
												{...form.register(`entities.${index}.x`, {
													valueAsNumber: true,
												})}
												type="number"
												placeholder="x"
											/>
										</div>

										<div className="flex flex-col gap-2">
											<Label>Y</Label>
											<Input
												{...form.register(`entities.${index}.y`, {
													valueAsNumber: true,
												})}
												type="number"
												placeholder="y"
											/>
										</div>
									</div>
								</li>
							))}
						</ul>

						<div className="flex justify-end">
							<Button
								type="button"
								onClick={() => dialogRef.current?.show()}
								variant="secondary"
								size="sm"
							>
								Add Entity
							</Button>
						</div>
					</div>

					<div className="flex w-full gap-2">
						<FormField
							control={form.control}
							name="prevStage"
							render={({ field }) => (
								<FormItem className="flex flex-col w-full">
									<FormLabel>Prev Stage</FormLabel>
									<FormControl>
										<ComboBox
											options={stages}
											defaultValue={field.value ?? undefined}
											onSelect={(e) => field.onChange(e)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="nextStage"
							render={({ field }) => (
								<FormItem className="flex flex-col w-full">
									<FormLabel>Next Stage</FormLabel>
									<FormControl>
										<ComboBox
											options={stages}
											defaultValue={field.value ?? undefined}
											onSelect={(e) => field.onChange(e)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="stageGroup"
						render={({ field }) => (
							<FormItem className="flex flex-col w-full">
								<FormLabel>Stage Group</FormLabel>
								<FormControl>
									<ComboBox
										options={groupEditor}
										defaultValue={field.value?.toString() ?? undefined}
										onSelect={(e) => field.onChange(Number.parseInt(e))}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end">
						<Button type="submit">Save</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
