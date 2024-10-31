import { readFile } from "@tauri-apps/plugin-fs";
import type { UUID } from "node:crypto";
import type { EntityInstance, ReslovedEntityInstance, ResolvedStage } from "./types";
import type { Dungeon } from "./renderer/dungeonScrawl/types";
import type { LightNode } from "@/components/DSNode";
import { db } from "./db";

export const loadDungeonFile = async (filepath: string) => {
	const file = await readFile(filepath);
	const reader = new TextDecoder();
	const value = reader.decode(file);

	const start = value.slice(value.indexOf("map") + 3);
	const config = start.slice(0, start.lastIndexOf("}") + 1);

	const content = JSON.parse(config) as Dungeon;
	return content;
}

export const loadEditorDungeonFile = async (filepath: string | undefined) => {
	if (!filepath) return;
	const content = await loadDungeonFile(filepath);
	const layers = Object.values(content.state.document.nodes).filter(e => e.type === "IMAGES" || e.type === "TEMPLATE").map(e => ({ value: e.id, name: e.name }));
	return {
		data: content,
		layers,
		nodeTree: getNode(content.state.document.nodes, "document" as UUID)
	}
}

const getNode = (nodes: Dungeon["state"]["document"]["nodes"], rootNode: UUID): LightNode => {

	const node = nodes[rootNode];

	const children = [];
	if ("children" in node) {
		for (const nodeId of node.children) {
			children.push(getNode(nodes, nodeId));
		}
	}
	let visible: boolean | undefined;
	if ("visible" in node) {
		visible = node.visible;
	}

	let name: string | undefined;
	if ("name" in node) {
		name = node.name;
	}

	return {
		name,
		visible,
		type: node.type,
		id: rootNode,
		children
	}
}

export const resloveEntities = async (stageEntites: Record<UUID, EntityInstance[]>): Promise<Record<UUID, ReslovedEntityInstance[]>> => {
	if (Array.isArray(stageEntites)) return {};

	const entities: Record<UUID, ReslovedEntityInstance[]> = {};
	for (const [layer, instance] of Object.entries(stageEntites)) {
		entities[layer as UUID] = [];
		const items = (await db.entity.bulkGet(instance.map(e => e.id))).filter(e => e !== undefined);

		for (const i of instance) {
			const core = items.find(e => e.id === i.entityId);
			if (!core) continue;
			entities[layer as UUID].push({
				...i,
				entity: core
			});
		}
	}

	return entities;
}

export const resloveStage = async (
	id: string,
): Promise<ResolvedStage | null> => {
	const stage = await db.stage.get(id);
	if (!stage) return null;

	const [map, entities] = await Promise.allSettled([
		loadEditorDungeonFile(stage.dsFilepath),
		resloveEntities(stage.entities)
	]);

	return {
		...stage,
		map: map.status === "fulfilled" ? map.value : undefined,
		entities: entities.status === "fulfilled" ? entities.value : {}
	};
};
