export type EntityRef = { id: string, instanceId: string, x: number, y: number, nameOverride?: string };

export type Group = {
    id: number;
    name: string;
}

export type Entity = {
    id: string,
    name: string,
    image: string,
    initiative: number,
    isPlayerControlled: boolean,
    displayOnMap: boolean,
    health: number,
    maxHealth: number,
    tempHealth: number
}

export type Stage = {
    id: string;
    name: string;
    entities: EntityRef[],
    backgroundImage: string;
    backgroundPosition: { x: number, y: number }
    backgroundSize: { w: number; h: number }
    gridScale: number;
    prevStage: string | null;
    nextStage: string | null;
    stageGroup: string | null;
}

export type ResolvedStage = Omit<Stage, "entities"> & { entities: { instanceId: string, entity: Entity, x: number, y: number, nameOverride?: string }[] };