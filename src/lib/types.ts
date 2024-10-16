import type { UUID } from "node:crypto";
import type { PuckSize } from "./display/utils";
import type { Trigger } from "./renderer/actions";

export type EntityRef = {
	id: string;
	instanceId: string;
	x: number;
	y: number;
	layer?: UUID
	nameOverride?: string;
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
	type: "object",
	id: UUID,
	events: Trigger[],
	overrides: Record<string, unknown>
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
	data: (StageEntity | StageObject)[];
	/**
	 * @deprecated
	 */
	entities: EntityRef[];
	dsFilepath: string,
	prevStage: string | null;
	nextStage: string | null;
	stageGroup: string | null;
};

export type ReslovedEntity = Omit<EntityRef, "id"> & {
	entity: Entity;
	z?: number;
};
export type ResolvedStage = Omit<Stage, "entities"> & {
	/**
	 * @deprecated
	 */
	entities: ReslovedEntity[];
};
