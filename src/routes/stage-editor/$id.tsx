import { createFileRoute, Link } from "@tanstack/react-router";
import { Controller, useFormContext } from "react-hook-form";
import { emitTo } from "@tauri-apps/api/event";
import { DevTool } from "@hookform/devtools";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EditorProvider, OpenDialog, useEditorContext } from "@/components/editor/EditorContext";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { EVENTS_MAP_EDITOR, WINDOW_MAP_EDITOR } from "@/lib/consts";
import { Button, buttonVariants } from "@/components/ui/button";
import { editorWindow, toggleEditorWindow } from "@/lib/window";
import { DSFileSelector } from "@/components/DSFileSelector";
import { Separator } from "@/components/ui/separator";
import { ComboBox } from "@/components/ui/combobox";
import type { ResolvedStage } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { DSNode } from "@/components/DSNode";
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
	component: EditorWrapper,
	errorComponent: (ev) => (
		<div className="h-full w-full flex flex-col justify-center items-center">
			<h1>{ev.error.message}</h1>
			<p>{ev.info?.componentStack}</p>
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
	async onEnter(ev) {
		const visible = await editorWindow.isVisible();
		if (!visible) await editorWindow.show();

		if (ev.loaderData?.stage.map) {
			await emitTo(WINDOW_MAP_EDITOR, EVENTS_MAP_EDITOR.Load, ev.loaderData?.stage.map.data);
		}
	},
});

function EditorWrapper() {
	const data = Route.useLoaderData();

	return (
		<EditorProvider stage={data.stage}>
			<StageEditorEditPage />
		</EditorProvider>
	);
}

function StageEditorEditPage() {
	const data = Route.useLoaderData();
	const { openDialog } = useEditorContext();
	const { control, handleSubmit } = useFormContext<ResolvedStage>();
	const onSubmit = (_state: ResolvedStage) => { }

	return (
		<div className="h-full w-full flex flex-col">
			{import.meta.env.DEV ? <DevTool control={control} /> : null}
			<header className="flex gap-2 w-full p-2 justify-between">
				<Link to="/stage-editor" className={buttonVariants({ variant: "ghost", size: "sm" })}>Back</Link>
				<div className="flex gap-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => openDialog(OpenDialog.AddStageGroup)}
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
					<form onSubmit={handleSubmit(onSubmit)} className="overflow-y-scroll p-2 gap-2 flex flex-col w-full">
						<FormField
							control={control}
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
						<FormField control={control} name="dsFilepath" render={({ field }) => (
							<FormItem>
								<FormLabel>Dungeon Layout</FormLabel>
								<FormControl>
									<DSFileSelector defaultValue={field.value} onChange={field.onChange} />
								</FormControl>
								<FormDescription>
									The file the describes that layout of the dungeon using the dungeon scroll editor.
								</FormDescription>
							</FormItem>
						)} />

						<div className="flex w-full gap-2">
							<FormField
								control={control}
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
								control={control}
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
							control={control}
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

					<Controller render={({ field }) => !field.value?.nodeTree ? (
						<div className="flex flex-col justify-center items-center h-full">
							<h3>No File selected</h3>
						</div>
					) : (
						<div className="flex flex-col gap-2 overflow-y-scroll h-full">
							<DSNode node={field.value?.nodeTree} />
						</div>
					)} control={control} name="map" />

				</ResizablePanel>
			</ResizablePanelGroup>
		</div >
	);
}