import { ContextMenu, ContextMenuCheckboxItem, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { WINDOW_MAIN } from "@/lib/consts";
import DSRenderer from "@/lib/renderer/DSRenderer";
import { ContextMenuContent } from "@radix-ui/react-context-menu";
import { createFileRoute } from "@tanstack/react-router";
import { emitTo } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/display-editor")({
	component: DisplayEditorPage,
});

function DisplayEditorPage() {
	const ref = useRef<HTMLCanvasElement>(null);
	const renderer = useRef(new DSRenderer());

	useEffect(() => {
		if (ref.current) {
			renderer.current.mount(ref.current);
		}

		return () => {
			renderer.current.unmount();
		};
	}, []);

	return (
		<div className="h-full w-full z-50 relative">
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<canvas ref={ref} />
				</ContextMenuTrigger>
				<ContextMenuContent className="w-64 bg-gray-950">
					<ContextMenuItem inset>
						Back
						<ContextMenuShortcut>⌘[</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem inset disabled>
						Forward
						<ContextMenuShortcut>⌘]</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem inset onClick={() => window.location.reload()}>
						Reload
						<ContextMenuShortcut>⌘R</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
						<ContextMenuSubContent className="w-48">
							<ContextMenuItem>
								Save Page As...
								<ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuItem onClick={() => {
								emitTo(WINDOW_MAIN, "editor-reload-map", {})
							}}>Reload Map File</ContextMenuItem>
							<ContextMenuItem onClick={(ev) => {
								emitTo(WINDOW_MAIN, "editor-add-entity", renderer.current.getOffset(ev as never as MouseEvent));
							}}>Add Entity</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem>Developer Tools</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuSeparator />
					<ContextMenuCheckboxItem checked>
						Show Object Outlines
						<ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
					</ContextMenuCheckboxItem>
					<ContextMenuCheckboxItem>Ohter</ContextMenuCheckboxItem>
					<ContextMenuSeparator />
					<ContextMenuRadioGroup value="pedro">
						<ContextMenuLabel inset>People</ContextMenuLabel>
						<ContextMenuSeparator />
						<ContextMenuRadioItem value="pedro">
							Radio
						</ContextMenuRadioItem>
						<ContextMenuRadioItem value="colm">Radio</ContextMenuRadioItem>
					</ContextMenuRadioGroup>
				</ContextMenuContent>
			</ContextMenu>
		</div >
	);
}
