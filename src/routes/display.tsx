import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { HideableHeader } from "../components/game/HideableHeader";
//import { Renderer } from "../lib/display/renderer";

const Display: React.FC = () => {
	const ref = useRef<HTMLCanvasElement>(null);
	//const renderer = useRef(new Renderer(false));

	useEffect(() => {
		if (ref.current) {
			//renderer.current.mount(ref.current);
		}
		return () => {
			//renderer.current.unmount();
		};
	}, []);

	return (
		<div className="h-full w-full z-50 relative">
			<HideableHeader />
			<canvas ref={ref} className="h-full w-full block" />
		</div>
	);
};

export const Route = createFileRoute("/display")({
	component: Display,
});
