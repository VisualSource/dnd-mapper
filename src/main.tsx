import { RouterProvider, createRouter } from "@tanstack/react-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { displayWindow, editorWindow } from "./lib/window";
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
if (win.label !== "main") {
	win.listen("tauri://close-requested", () => {
		displayWindow.destroy();
		editorWindow.destroy();
	});
	document.head.querySelector("script[src='http://localhost:8097']")?.remove();
}

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<RouterProvider router={router} />
		<Toaster />
	</StrictMode>,
);