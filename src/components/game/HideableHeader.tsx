import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Maximize2 } from "lucide-react";
import { useRef } from "react";
import { Button } from "../ui/button";

const win = getCurrentWebviewWindow();

export const HideableHeader: React.FC = () => {
	const controls = useRef<HTMLDivElement>(null);
	return (
		<header
			className="absolute w-full h-10"
			onMouseLeave={() => {
				controls.current?.classList.remove("flex");
				controls.current?.classList.add("hidden");
			}}
			onMouseEnter={() => {
				controls.current?.classList.remove("hidden");
				controls.current?.classList.add("flex");
			}}
		>
			<div
				ref={controls}
				className="hidden bg-zinc-600 justify-end"
				data-tauri-drag-region
			>
				<Button
					variant="secondary"
					size="sm"
					type="button"
					onClick={() => win.toggleMaximize()}
				>
					<Maximize2 />
				</Button>
			</div>
		</header>
	);
};
