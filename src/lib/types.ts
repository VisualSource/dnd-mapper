import type { UUID } from "node:crypto";
import type { PuckSize } from "./display/utils";
import type { Trigger } from "./renderer/actions";
import type { Dungeon } from "./renderer/dungeonScrawl/types";
import type { LightNode } from "@/components/DSNode";

export type EntityInstance = {
	entityId: string;
	id: UUID;
	x: number;
	y: number;
	z: number;
	overrides: {
		name?: string;
		visible?: boolean;
	}
};
export type Background = {
	image: string;
	size: { w: number; h: number };
	position: { x: number; y: number };
	offset: { x: number; y: number };
	autoCenter: boolean;
	rotation: number;
};
export type BackgroundFull = Omit<Background, "image"> & {
	image: HTMLImageElement;
};
export type Group = {
	id: number;
	name: string;
};

export type Entity = {
	id: string;
	name: string;
	image: string;
	initiative: number;
	isPlayerControlled: boolean;
	displayOnMap: boolean;
	health: number;
	maxHealth: number;
	tempHealth: number;
	puckSize: PuckSize;
};

export type StageObject = {
	id: UUID,
	events: Trigger[],
	overrides: {
		visible?: boolean
	}
};

export type StageEntity = {
	type: "entity",
	entityId: UUID,
	id: UUID,
	x: number,
	y: number,
	z: number,
	layer: UUID,
	nameOverride?: string
}


export type Stage = {
	id: string;
	name: string;
	data: Record<UUID, StageObject>
	entities: Record<UUID, EntityInstance[]>;
	dsFilepath: string,
	prevStage: string | null;
	nextStage: string | null;
	stageGroup: string | null;
};

export type ReslovedEntityInstance = Omit<EntityInstance, "entityId"> & {
	entity: Entity;
};
export type ResolvedStage = Omit<Stage, "entities"> & {
	entities: Record<UUID, ReslovedEntityInstance[]>;
	map: {
		data: Dungeon,
		nodeTree: LightNode,
		layers: { name: string, value: UUID }[]
	} | undefined
};
