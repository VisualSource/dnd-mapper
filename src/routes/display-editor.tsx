import { ContextMenu, ContextMenuCheckboxItem, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import DSRenderer from "@/lib/renderer/DSRenderer";
import { ContextMenuContent } from "@radix-ui/react-context-menu";
import { createFileRoute } from "@tanstack/react-router";
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
							<ContextMenuItem>Create Shortcut...</ContextMenuItem>
							<ContextMenuItem>Name Window...</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem>Developer Tools</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuSeparator />
					<ContextMenuCheckboxItem checked>
						Show Bookmarks Bar
						<ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
					</ContextMenuCheckboxItem>
					<ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
					<ContextMenuSeparator />
					<ContextMenuRadioGroup value="pedro">
						<ContextMenuLabel inset>People</ContextMenuLabel>
						<ContextMenuSeparator />
						<ContextMenuRadioItem value="pedro">
							Pedro Duarte
						</ContextMenuRadioItem>
						<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
					</ContextMenuRadioGroup>
				</ContextMenuContent>
			</ContextMenu>
		</div >
	);
}
