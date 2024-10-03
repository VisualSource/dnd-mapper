import { createFileRoute, Link } from "@tanstack/react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { FileQuestion, Trash2 } from "lucide-react";
import { readFile } from "@tauri-apps/plugin-fs";
import { useLiveQuery } from "dexie-react-hooks";
import { emitTo } from "@tauri-apps/api/event";
import type { UUID } from "node:crypto";
import { useRef } from "react";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AdditionEntityDialog, type AdditionEntityDialogHandle } from "@/components/dialog/AdditionEntityDialog";
import { StageGroupDialog, type StageGroupDialogHandle } from "@/components/dialog/StageGroupDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EVENTS_MAP_EDITOR, WINDOW_MAP_EDITOR } from "@/lib/consts";
import type { Dungeon } from "@/lib/renderer/dungeonScrawl/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { editorWindow, toggleEditorWindow } from "@/lib/window";
import { DSFileSelector } from "@/components/DSFileSelector";
import { DSNode, type LightNode } from "@/components/DSNode";
import { Separator } from "@/components/ui/separator";
import { ComboBox } from "@/components/ui/combobox";
import type { ResolvedStage } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resloveStage } from "@/lib/loader";
import { db } from "@/lib/db";

const loadGroups = () => db.groups
	.toArray()
	.then((e) => e.map((d) => ({ id: d.id.toString(), value: d.name })))
const loadStages = (id: string) => db.stage
	.filter((e) => e.id !== id)
	.toArray()
	.then((e) => e.map((e) => ({ value: e.name, id: e.id })));

export const Route = createFileRoute("/stage-editor/$id")({
	component: StageEditorEditPage,
	errorComponent: () => (
		<div className="h-full w-full flex flex-col justify-center items-center">
			Not Found
		</div>
	),
	async loader(ctx) {
		const [stages, groups, stage] = await Promise.allSettled([
			loadStages(ctx.params.id),
			loadGroups(),
			resloveStage(ctx.params.id)
		]);

		if (stages.status === "rejected" ||
			groups.status === "rejected" ||
			stage.status === "rejected") throw new Error("Failed to load resources");
		if (!stage.value) throw new Error("No stage found");
		return { stages: stages.value, groups: groups.value, stage: stage.value }
	},
	async onEnter(ctx) {
		const visible = await editorWindow.isVisible();
		if (!visible) await editorWindow.show();
	},
});

const getNode = (nodes: Dungeon["state"]["document"]["nodes"], rootNode: UUID): LightNode => {

	const node = nodes[rootNode];

	const children = [];
	if ("children" in node) {
		for (const nodeId of node.children) {
			children.push(getNode(nodes, nodeId));
		}
	}
	let visible: boolean | undefined;
	if ("visible" in node) {
		visible = node.visible;
	}

	let name: string | undefined;
	if ("name" in node) {
		name = node.name;
	}

	return {
		name,
		visible,
		type: node.type,
		id: rootNode,
		children
	}
}

function StageEditorEditPage() {
	const data = Route.useLoaderData();
	const aedRef = useRef<AdditionEntityDialogHandle>(null);
	const sgdRef = useRef<StageGroupDialogHandle>(null);

	const form = useForm<ResolvedStage>({
		defaultValues: data.stage
	});
	const entityField = useFieldArray({
		control: form.control,
		name: "entities",
	});

	const dsFile = form.watch("dsFilepath");
	const loadDsfile = useLiveQuery(async () => {
		try {
			const file = await readFile(dsFile);
			const reader = new TextDecoder();
			const value = reader.decode(file);

			const start = value.slice(value.indexOf("map") + 3);
			const config = start.slice(0, start.lastIndexOf("}") + 1);

			const content = JSON.parse(config) as Dungeon;

			await emitTo(WINDOW_MAP_EDITOR, EVENTS_MAP_EDITOR.Load, content);

			return getNode(content.state.document.nodes, "document" as UUID);
		} catch (error) {
			return null;
		}
	}, [dsFile], null);

	const onSubmit = (state: ResolvedStage) => { }

	return (
		<div className="h-full w-full flex flex-col overflow-hidden">
			<StageGroupDialog ref={sgdRef} />
			<AdditionEntityDialog
				onAdd={(e) =>
					entityField.prepend({
						entity: e,
						instanceId: crypto.randomUUID(),
						x: 0,
						y: 0,
					})
				}
				ref={aedRef}
			/>
			<header className="flex gap-2 w-full p-2 justify-between">
				<Link to="/stage-editor" className={buttonVariants({ variant: "ghost", size: "sm" })}>Back</Link>
				<div className="flex gap-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => sgdRef.current?.show()}
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
				</div>
			</header>
			<Separator />
			<section className="flex h-full overflow-hidden">
				<main className="w-8/12 h-full flex">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="overflow-y-scroll p-2 gap-2 flex flex-col">
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
							<FormField control={form.control} name="dsFilepath" render={({ field }) => (
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
												<div className="flex flex-col gap-2 w-full">
													<Label>X</Label>
													<Input
														{...form.register(`entities.${index}.x`, {
															valueAsNumber: true,
														})}
														type="number"
														placeholder="x"
													/>
												</div>

												<div className="flex flex-col gap-2 w-full">
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
										onClick={() => aedRef.current?.show()}
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
													name="stage"
													options={data.stages}
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
													name="stage"
													options={data.stages}
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
												name="groups"
												options={data.groups}
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
				</main>
				<aside className="w-4/12 h-full flex flex-col">
					{loadDsfile === undefined ? (
						<div>Loading...</div>
					) : loadDsfile === null ? (
						<div>No File</div>
					) : (
						<div className="flex flex-col gap-2 overflow-y-scroll h-full">
							<DSNode node={loadDsfile} targetWindow={WINDOW_MAP_EDITOR} />
						</div>
					)}
				</aside>
			</section>
		</div >
	);
}
