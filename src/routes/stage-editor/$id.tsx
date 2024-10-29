import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { readFile } from "@tauri-apps/plugin-fs";
import { useLiveQuery } from "dexie-react-hooks";
import { emitTo, listen } from "@tauri-apps/api/event";
import type { UUID } from "node:crypto";
import { useEffect, useRef, useState } from "react";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AdditionEntityDialog, type AdditionEntityDialogHandle } from "@/components/dialog/AdditionEntityDialog";
import { StageGroupDialog, type StageGroupDialogHandle } from "@/components/dialog/StageGroupDialog";
import { emitEvent, EVENTS_MAP_EDITOR, WINDOW_MAP_EDITOR } from "@/lib/consts";
import type { Dungeon, PageNode } from "@/lib/renderer/dungeonScrawl/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { editorWindow, toggleEditorWindow } from "@/lib/window";
import { DSFileSelector } from "@/components/DSFileSelector";
import { DSNode, type LightNode } from "@/components/DSNode";
import { Separator } from "@/components/ui/separator";
import { ComboBox } from "@/components/ui/combobox";
import type { Entity, ResolvedStage } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { resloveStage } from "@/lib/loader";
import { db } from "@/lib/db";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TriggerListDialog } from "@/components/editor/TriggersListDialog";
import type { DialogHandle } from "@/components/Dialog";
import { ActionListDialog } from "@/components/dialog/ActionListDialog";
import { DevTool } from "@hookform/devtools";

//import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
//import { InstanceEditorDialog, type InstanceEditorDialogHandle } from "@/components/dialog/instanceEditorDialog";
import update from "immutability-helper";
import { LayerSelectDialog } from "@/components/dialog/LayerSelectDialog";
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
	async onLeave() {
		const visible = await editorWindow.isVisible();
		if (visible) await editorWindow.hide();
	},
	async onEnter() {
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

const loadDungeonFile = async (filepath: string) => {
	const file = await readFile(filepath);
	const reader = new TextDecoder();
	const value = reader.decode(file);

	const start = value.slice(value.indexOf("map") + 3);
	const config = start.slice(0, start.lastIndexOf("}") + 1);

	const content = JSON.parse(config) as Dungeon;
	return content;
}

function StageEditorEditPage() {
	const data = Route.useLoaderData();
	const [selectedNode, setSelectedNode] = useState<string | null>(null);
	//const ied = useRef<InstanceEditorDialogHandle>(null);
	const selectLayerDialog = useRef<DialogHandle>(null);
	const aedRef = useRef<AdditionEntityDialogHandle>(null);
	const tld = useRef<DialogHandle>(null);
	const ald = useRef<DialogHandle>(null);
	const sgdRef = useRef<StageGroupDialogHandle>(null);

	const form = useForm<ResolvedStage>({
		defaultValues: data.stage
	});
	const setValue = form.setValue;
	const getValue = form.getValues;

	const dsFile = form.watch("dsFilepath");
	const loadDsfile = useLiveQuery(async () => {
		try {
			const content = await loadDungeonFile(dsFile);

			await emitTo(WINDOW_MAP_EDITOR, EVENTS_MAP_EDITOR.Load, content);

			const layers = Object.values(content.state.document.nodes).filter(e => e.type === "IMAGES" || e.type === "TEMPLATE").map(e => ({ value: e.id, name: e.name }));

			const defaultLayer = (content.state.document.nodes[content.state.document.nodes.document.selectedPage] as PageNode).children.at(0);

			return {
				defaultLayer,
				layers,
				tree: getNode(content.state.document.nodes, "document" as UUID)
			};
		} catch (error) {
			return null;
		}
	}, [dsFile], null);

	useEffect(() => {
		const unsub = listen("editor-reload-map", async () => {
			const content = await loadDungeonFile(dsFile);
			await emitTo(WINDOW_MAP_EDITOR, EVENTS_MAP_EDITOR.Load, content);
		});

		return () => {
			unsub.then(e => e());
		}
	}, [dsFile]);

	useEffect(() => {
		const unsub = listen<string>("editor-select", async (ev) => {
			setSelectedNode(ev.payload);
		});
		const ub = listen<{ x: number, y: number; }>("editor-add-entity", async (ev) => {
			selectLayerDialog.current?.show();

			const layerId = await new Promise<UUID | null>(ok => {
				window.addEventListener("dialog::layer-select-dialog", ev => ok((ev as CustomEvent<UUID | null>).detail), { once: true });
			});
			if (!layerId) return;

			aedRef.current?.show();

			const result = await new Promise<Entity | null>((ok) => {
				window.addEventListener("dialog::additionEntityDialog", (ev) => ok((ev as CustomEvent<Entity | null>).detail), { once: true });
			});
			if (!result) return;

			const entity = { entity: result, id: crypto.randomUUID(), x: ev.payload.x, y: ev.payload.y, z: 0, overrides: {} };

			const prev = getValue("entities");

			setValue(`entities.${layerId}`, update(prev[layerId], {
				$push: [entity]
			}), { shouldDirty: true, shouldTouch: true });

			await emitEvent("addEntity", { layer: layerId, entity: entity }, WINDOW_MAP_EDITOR);
		});
		return () => {
			unsub.then(e => e());
			ub.then(e => e());
		}
	}, [getValue, setValue]);

	const onSubmit = (_state: ResolvedStage) => { }

	return (
		<div className="h-full w-full flex flex-col">
			<DevTool control={form.control} />
			<ActionListDialog ref={ald} />
			<StageGroupDialog ref={sgdRef} />
			<TriggerListDialog ref={tld} />
			<LayerSelectDialog options={loadDsfile?.layers} ref={selectLayerDialog} />
			<AdditionEntityDialog ref={aedRef} onAdd={(entity) => {
				window.dispatchEvent(new CustomEvent("dialog::additionEntityDialog", { detail: entity }));
			}} onClose={() => {
				window.dispatchEvent(new CustomEvent("dialog::additionEntityDialog", { detail: null }));
			}} />
			<Form {...form}>
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
				<ResizablePanelGroup direction="horizontal">
					<ResizablePanel className="flex flex-col mr-2" minSize={40}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="overflow-y-scroll p-2 gap-2 flex flex-col w-full">
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

					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel className="bg-zinc-900" minSize={30}>

						{loadDsfile === undefined ? (
							<div>Loading...</div>
						) : loadDsfile === null ? (
							<div className="flex flex-col justify-center items-center h-full">
								<h3>No File selected</h3>
							</div>
						) : (
							<div className="flex flex-col gap-2 overflow-y-scroll h-full">
								<DSNode openDialog={(target: string) => {
									switch (target) {
										case "tld":
											tld.current?.show();
											break;
										case "ald":
											ald.current?.show();
											break;
										case "aed":
											aedRef.current?.show();
											break;
										default:
											break;
									}
								}} selectedNode={selectedNode} node={loadDsfile.tree} targetWindow={WINDOW_MAP_EDITOR} />
							</div>
						)}

					</ResizablePanel>
				</ResizablePanelGroup>
			</Form>
		</div >
	);
}