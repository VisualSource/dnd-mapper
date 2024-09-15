import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { Toaster } from "@/components/ui/toaster"
import { getCurrentWindow } from "@tauri-apps/api/window";
import { displayWindow, editorWindow } from "./lib/window";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
const win = getCurrentWindow();
win.listen("tauri://close-requested", () => {
  editorWindow.destroy();
  displayWindow.destroy();
  win.destroy();
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>,
);
