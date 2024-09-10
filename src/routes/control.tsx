import { createFileRoute } from '@tanstack/react-router'
import { Window } from "@tauri-apps/api/window";
import { emitTo } from "@tauri-apps/api/event";

const win = new Window("display");

export const Route = createFileRoute('/control')({
  component: () => <div>

    <button type="button" onClick={async () => {
      const vis = await win.isVisible();
      if (!vis) {
        win.show();
      }
    }}>Show Display</button>

    <button type="button" onClick={async () => {
      win.hide();
    }}>
      Hide
    </button>

    <button type="button" onClick={() => {
      emitTo("display", "update-some-data", { target: "someTargetId" });
    }}>Send data</button>
  </div>
})