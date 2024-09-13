type EnityRef = { id: string, x: number, y: number };

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
    entities: EnityRef[],
    backgroundImage: string;
    backgroundPosition: { x: number, y: number }
    backgroundSize: { w: number; h: number }
    gridScale: number;
    prevStage: number;
    nextStage: number;
    stageGroup: string | null;
}