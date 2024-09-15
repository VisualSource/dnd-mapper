import { createFileRoute } from '@tanstack/react-router'
import { StageForm } from '../../components/editor/StageForm';
import { db } from '../../lib/db';
import { editorWindow } from '../../lib/window';
import { emitTo } from '@tauri-apps/api/event';
import { EDITOR_MAP_EVENTS, EDITOR_MAP_WINDOW_LABEL } from '../../lib/consts';
import { useToast } from '@/hooks/use-toast';

export const Route = createFileRoute('/stage-editor/new')({
  component: StageEditorNewPage,
  async onEnter() {
    const visible = await editorWindow.isVisible();
    if (!visible) await editorWindow.show();
    await emitTo(EDITOR_MAP_WINDOW_LABEL, EDITOR_MAP_EVENTS.Update, {
      gridScale: 28,
      entities: [],
      background: null
    });
  }
});

function StageEditorNewPage() {
  const { toast } = useToast()
  const navigate = Route.useNavigate();
  return (
    <StageForm onSubmit={async (stage) => {
      await db.stage.add(stage);
      toast({
        title: "Created Stage"
      })
      navigate({
        to: "/stage-editor/$id", params: {
          id: stage.id
        }
      });
    }} />
  );
}
