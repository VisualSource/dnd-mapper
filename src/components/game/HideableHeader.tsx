import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useRef } from "react";

const win = getCurrentWebviewWindow();

export const HideableHeader: React.FC = () => {
	const controls = useRef<HTMLDivElement>(null);
	return (
		<header
			className="absolute w-full h-10"
			onMouseLeave={() => {
				controls.current?.classList.add("hidden");
			}}
			onMouseEnter={() => {
				controls.current?.classList.remove("hidden");
			}}
		>
			<div ref={controls} className="hidden bg-gray-600" data-tauri-drag-region>
				<button
					type="button"
					onClick={() => {
						win.toggleMaximize();
					}}
				>
					Max
				</button>
			</div>
		</header>
	);
};
