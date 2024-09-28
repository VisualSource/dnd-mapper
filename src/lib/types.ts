import type { PuckSize } from "./display/utils";

export type EntityRef = {
	id: string;
	instanceId: string;
	x: number;
	y: number;
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

export type Stage = {
	id: string;
	name: string;
	entities: EntityRef[];
	dsFilepaths: string[],
	prevStage: string | null;
	nextStage: string | null;
	stageGroup: string | null;
};

export type ReslovedEntity = Omit<EntityRef, "id"> & {
	entity: Entity;
	z?: number;
};
export type ResolvedStage = Omit<Stage, "entities"> & {
	entities: ReslovedEntity[];
};
