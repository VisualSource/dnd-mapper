import { createFileRoute } from '@tanstack/react-router'
import { StageForm } from '../../components/editor/StageForm';
import { db } from '../../lib/db';
import { editorWindow } from '../../lib/window';
import { EDITOR_MAP_EVENTS, EDITOR_MAP_WINDOW_LABEL } from '../../lib/consts';
import { emitTo } from '@tauri-apps/api/event';
import { resloveStage } from '../../lib/loader';

export const Route = createFileRoute('/stage-editor/$id')({
  component: StageEditorEditPage,
  errorComponent: () => <div>Not Found</div>,
  async loader(ctx) {
    const stage = await resloveStage(ctx.params.id);
    if (!stage) throw new Error("Not Found");
    return stage;
  },
  async onEnter(ctx) {
    const visible = await editorWindow.isVisible();
    if (!visible) await editorWindow.show();
    await emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Update, ctx.loaderData);
  },
});

function StageEditorEditPage() {
  const data = Route.useLoaderData();
  return (
    <StageForm stage={data} onSubmit={async (ev) => {
      await db.stage.update(data.id, ev);
    }} />
  );
}