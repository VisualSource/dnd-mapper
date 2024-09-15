import { createFileRoute } from "@tanstack/react-router";
import { emitTo } from "@tauri-apps/api/event";
import { StageForm } from "../../components/editor/StageForm";
import { EDITOR_MAP_EVENTS, EDITOR_MAP_WINDOW_LABEL } from "../../lib/consts";
import { db } from "../../lib/db";
import { resloveStage } from "../../lib/loader";
import { editorWindow } from "../../lib/window";

export const Route = createFileRoute("/stage-editor/$id")({
	component: StageEditorEditPage,
	errorComponent: () => (
		<div className="h-full w-full flex flex-col justify-center items-center">
			Not Found
		</div>
	),
	async loader(ctx) {
		const stage = await resloveStage(ctx.params.id);
		if (!stage) throw new Error("Not Found");
		return stage;
	},
	async onEnter(ctx) {
		const visible = await editorWindow.isVisible();
		if (!visible) await editorWindow.show();
		await emitTo(
			EDITOR_MAP_WINDOW_LABEL,
			EDITOR_MAP_EVENTS.Update,
			ctx.loaderData,
		);
	},
});

function StageEditorEditPage() {
	const data = Route.useLoaderData();
	return (
		<StageForm
			stage={data}
			onSubmit={async (ev) => {
				await db.stage.update(data.id, ev);
			}}
		/>
	);
}
