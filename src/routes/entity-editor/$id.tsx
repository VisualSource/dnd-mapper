import { AddEntityForm } from "@/components/AddEntityForm";
import { db } from "@/lib/db";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/entity-editor/$id")({
	async loader(ctx) {
		const value = await db.entity.get(ctx.params.id);
		if (!value) throw new Error("Not found");
		return value;
	},
	errorComponent: (err) => (
		<div className="h-full w-full flex flex-col justify-center items-center">
			{err.error.message}
		</div>
	),
	component: () => {
		const { id } = Route.useParams();
		const entity = Route.useLoaderData();
		return (
			<AddEntityForm
				entity={entity}
				onSubmit={(ev) => db.entity.update(id, ev)}
				resetOnSubmit={false}
				btnMsg="Save"
			/>
		);
	},
});
