import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { displayWindow, editorWindow } from "./lib/window";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Toaster } from "@/components/ui/toaster";
import { routeTree } from "./routeTree.gen";
import { initLogger } from "./lib/logger";
import "./index.css";

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

initLogger();
const router = createRouter({ routeTree });

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