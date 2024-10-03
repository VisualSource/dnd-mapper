import { StageGroupSelect } from "@/components/editor/StageGroupSelect";
import { StageList } from "@/components/editor/StageList";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDebounce } from "use-debounce";

export const Route = createFileRoute("/stage-editor/")({
	component: () => {
		const naviagte = useNavigate();

		const [group, setGroup] = useState<string>();
		const [search, setSearch] = useState<string>();
		const [query] = useDebounce(search, 1000);

		return (
			<div className="h-full w-full text-center flex flex-col p-2">
				<header className="flex w-full pb-2 gap-1">
					<Link to="/" className={buttonVariants({ variant: "ghost" })}>Back</Link>
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search"
						type="search"
					/>
					<StageGroupSelect onSelect={setGroup} value={group} />
					<Button variant="secondary" onClick={async () => {
						const id = crypto.randomUUID()
						await db.stage.add({
							id,
							name: "Unnamed",
							entities: [],
							dsFilepath: "",
							nextStage: null,
							prevStage: null,
							stageGroup: null
						})
						naviagte({ to: "/stage-editor/$id", params: { id } })
					}}
					>
						New
					</Button>
				</header>
				<Separator className="mb-2" />
				<StageList
					deletable
					group={group}
					filter={query}
					onClick={(stage) =>
						naviagte({ to: "/stage-editor/$id", params: { id: stage.id } })
					}
				/>
			</div>
		)
	},
});
