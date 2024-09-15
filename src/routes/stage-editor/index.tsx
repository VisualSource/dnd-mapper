import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stage-editor/")({
	component: () => (
		<div className="h-full w-full text-center flex flex-col items-center justify-center">
			Select Stage or create new Stage
		</div>
	),
});
