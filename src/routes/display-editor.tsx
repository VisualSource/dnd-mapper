import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { WINDOW_MAIN } from "@/lib/consts";
import DSRenderer from "@/lib/renderer/DSRenderer";
import { createFileRoute } from "@tanstack/react-router";
import { emitTo } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/display-editor")({
	component: DisplayEditorPage,
});

function DisplayEditorPage() {
	const ref = useRef<HTMLCanvasElement>(null);
	const renderer = useRef(new DSRenderer());
	const contextMenuRef = useRef<HTMLDivElement>(null);

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
				<ContextMenuContent ref={contextMenuRef} className="w-64 bg-gray-950">
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
								emitTo(WINDOW_MAIN, "editor-reload-map", null)
							}}>Reload Map File</ContextMenuItem>
							<ContextMenuItem onClick={() => {
								if (!contextMenuRef.current) return;
								const bb = contextMenuRef.current.getBoundingClientRect()
								const offset = renderer.current.getOffset({ clientX: bb.x, clientY: bb.y } as never as MouseEvent);
								const size = renderer.current.getGridCellSize();
								const n = Math.floor(offset.x / size);
								const m = Math.floor(offset.y / size);

								emitTo(WINDOW_MAIN, "editor-add-entity", { x: n, y: m });

								/*console.group("Click Event");
								console.log();
								console.log(ev.clientX, ev.clientY);
								const r = renderer.current.getOffset(ev as never as MouseEvent);
								console.log(r);
								console.log(Math.floor(r.x / 36), Math.floor(r.y / 36));
								console.groupEnd()*/


								//console.log(n, m, n * 36, m * 36);

								//renderer.current.addObject(n * 36, m * 36, 36 * 2, 36 * 2);

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
